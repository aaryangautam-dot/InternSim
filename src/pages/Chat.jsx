import { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { getManagerForRole } from '../data/managers';
import { TEAM_MEMBERS, SLACK_CHANNELS } from '../data/team';
import { sendChatMessage } from '../services/ai';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { playSound } from '../utils/sound';
import {
  Send, Loader, Mic, MicOff, Volume2, VolumeX,
  Hash, MessageSquare, AlertTriangle, CheckCircle2,
  Users, Sparkles, Smile
} from 'lucide-react';

export default function Chat() {
  const { user } = useUser();
  const { getActiveTask } = useTasks();
  const manager = getManagerForRole(user?.role);

  const [activeTab, setActiveTab] = useState('channel-standup'); // channel-X or dm-X
  const [channels, setChannels] = useState(() => {
    const saved = localStorage.getItem('internsim-slack-channels');
    if (saved) return JSON.parse(saved);
    return SLACK_CHANNELS;
  });

  const [dmThreads, setDmThreads] = useState(() => {
    const saved = localStorage.getItem('internsim-slack-dms');
    if (saved) return JSON.parse(saved);
    return {
      manager: [{
        role: 'manager',
        senderId: manager.id,
        content: manager.welcomeMessage,
        timestamp: '9:00 AM',
      }],
      sarah: [{
        role: 'teammate',
        senderId: 'sarah',
        content: "Hey! Welcome to the team. If you need any help navigating the legacy components or understanding our PR conventions, feel free to ping me anytime.",
        timestamp: '9:15 AM',
      }],
      devon: [{
        role: 'teammate',
        senderId: 'devon',
        content: "Hey intern. A word of advice: always test your changes against empty strings and mobile viewports before opening a PR. I review closely.",
        timestamp: '9:30 AM',
      }],
    };
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [standupForm, setStandupForm] = useState({ yesterday: '', today: '', blockers: '' });
  const [showStandupModal, setShowStandupModal] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    isListening, isSpeaking, transcript, voiceSupported,
    toggleListening, speak, stopSpeaking, setTranscript,
  } = useVoiceChat(manager.voiceConfig);

  useEffect(() => {
    localStorage.setItem('internsim-slack-channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('internsim-slack-dms', JSON.stringify(dmThreads));
  }, [dmThreads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channels, dmThreads, activeTab]);

  // Voice message auto-send
  useEffect(() => {
    if (!isListening && transcript && voiceMode) {
      handleSend(transcript);
      setTranscript('');
    }
  }, [isListening, transcript, voiceMode]);

  const activeChannel = channels.find(c => `channel-${c.id}` === activeTab);
  const isDM = activeTab.startsWith('dm-');
  const activeDmId = isDM ? activeTab.replace('dm-', '') : null;
  const currentDmMessages = isDM ? (dmThreads[activeDmId] || []) : [];

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isDM) {
      const userMsg = { role: 'user', content: msg, timestamp: timeStr };
      setDmThreads(prev => ({
        ...prev,
        [activeDmId]: [...(prev[activeDmId] || []), userMsg]
      }));
      setIsTyping(true);

      const apiKey = localStorage.getItem('internsim-apikey') || '';
      const activeTask = getActiveTask();
      const contextMessages = (dmThreads[activeDmId] || []).slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
      contextMessages.push({ role: 'user', content: msg });

      if (activeTask) {
        contextMessages.unshift({
          role: 'system',
          content: `The intern is currently working on ticket "${activeTask.title}". Keep responses in character.`
        });
      }

      try {
        let recipient = manager;
        if (activeDmId === 'sarah') {
          recipient = {
            name: 'Sarah Lin',
            systemPrompt: 'You are Sarah Lin, Senior Staff Frontend Engineer at NovaTech. You are supportive, technical, and love mentoring interns with practical code tips.',
            fallbackResponses: [
              "Take a look at how we implemented that in the shared components directory. That pattern should help.",
              "Good question! Make sure you check the event lifecycle so you don't trigger unnecessary re-renders.",
              "I saw that bug last sprint — check if the state is being reset on unmount."
            ]
          };
        } else if (activeDmId === 'devon') {
          recipient = {
            name: 'Devon Vance',
            systemPrompt: 'You are Devon Vance, Lead SDET / QA. You are sharp, dry, and always ask what tests have been run.',
            fallbackResponses: [
              "Did you test that on mobile Safari? That's where we usually see failures.",
              "Make sure you include unit test coverage in your PR or I'll request changes.",
              "If the edge cases aren't covered, QA will reject the ticket back to you."
            ]
          };
        }

        const reply = await sendChatMessage(contextMessages, apiKey, recipient);
        playSound.notification();
        const replyMsg = {
          role: activeDmId === 'manager' ? 'manager' : 'teammate',
          senderId: activeDmId === 'manager' ? manager.id : activeDmId,
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setDmThreads(prev => ({
          ...prev,
          [activeDmId]: [...(prev[activeDmId] || []), replyMsg]
        }));

        if (voiceMode && activeDmId === 'manager') speak(reply);
      } catch {
        setDmThreads(prev => ({
          ...prev,
          [activeDmId]: [...(prev[activeDmId] || []), {
            role: 'manager',
            senderId: manager.id,
            content: "In a meeting right now, I'll review your update shortly.",
            timestamp: timeStr
          }]
        }));
      } finally {
        setIsTyping(false);
      }
    } else {
      // Channel message
      const userChannelMsg = {
        id: `usr-${Date.now()}`,
        senderId: 'user',
        timestamp: timeStr,
        content: msg,
        reactions: [{ emoji: '👍', count: 1 }],
      };

      setChannels(prev => prev.map(c => {
        if (`channel-${c.id}` === activeTab) {
          return { ...c, initialMessages: [...c.initialMessages, userChannelMsg] };
        }
        return c;
      }));

      // Simulate a teammate acknowledging in channel
      if (activeTab === 'channel-engineering') {
        setTimeout(() => {
          playSound.notification();
          const teammateReply = {
            id: `reply-${Date.now()}`,
            senderId: 'sarah',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `Thanks for flagging @${user.name?.split(' ')[0] || 'intern'}. Let's discuss in the PR review.`,
            reactions: [{ emoji: '🙌', count: 2 }],
          };
          setChannels(prev => prev.map(c => {
            if (c.id === 'engineering') {
              return { ...c, initialMessages: [...c.initialMessages, teammateReply] };
            }
            return c;
          }));
        }, 1200);
      }
    }
  };

  const handlePostStandup = () => {
    if (!standupForm.yesterday || !standupForm.today) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const content = `*Yesterday:* ${standupForm.yesterday}\n*Today:* ${standupForm.today}\n*Blockers:* ${standupForm.blockers || 'None'}`;

    const standupMsg = {
      id: `standup-${Date.now()}`,
      senderId: 'user',
      timestamp: timeStr,
      content,
      reactions: [{ emoji: '🔥', count: 3 }, { emoji: '💪', count: 2 }],
    };

    setChannels(prev => prev.map(c => {
      if (c.id === 'standup') {
        return { ...c, initialMessages: [...c.initialMessages, standupMsg] };
      }
      return c;
    }));

    setShowStandupModal(false);
    playSound.notification();

    // Manager reaction after 2s
    setTimeout(() => {
      playSound.notification();
      const managerReply = {
        id: `mgr-reply-${Date.now()}`,
        senderId: manager.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Good alignment @${user?.name?.split(' ')[0] || 'intern'}. Focus on getting the PR up before 4 PM so Devon has time for verification.`,
        reactions: [{ emoji: '🎯', count: 2 }],
      };
      setChannels(prev => prev.map(c => {
        if (c.id === 'standup') {
          return { ...c, initialMessages: [...c.initialMessages, managerReply] };
        }
        return c;
      }));
    }, 2000);
  };

  const getMember = (senderId) => {
    if (senderId === 'user') {
      return {
        name: user?.name || 'You',
        initials: user?.name ? user.name.charAt(0) : 'U',
        avatarColor: 'var(--accent)',
      };
    }
    if (senderId === manager.id) {
      return {
        name: manager.name,
        initials: manager.initials,
        avatarColor: manager.avatarColor,
      };
    }
    const found = Object.values(TEAM_MEMBERS).find(m => m.id === senderId);
    return found || {
      name: senderId,
      initials: senderId.slice(0, 2).toUpperCase(),
      avatarColor: 'var(--bg-elevated)',
    };
  };

  return (
    <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 120px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      
      {/* Slack Sidebar */}
      <div style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚡ NovaTech Workspace</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            Sprint 4 · {user?.role === 'aiml' ? 'ML Ops' : user?.role === 'backend' ? 'Backend Services' : 'Web Team'}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Channels Section */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
              Channels
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {channels.map(c => {
                const isActive = activeTab === `channel-${c.id}`;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveTab(`channel-${c.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                      borderRadius: 'var(--radius-md)', border: 'none', background: isActive ? 'var(--accent-muted)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', fontWeight: isActive ? 600 : 400
                    }}
                  >
                    <Hash size={14} style={{ opacity: 0.7 }} />
                    <span style={{ flex: 1 }}>{c.name}</span>
                    {c.unreadCount > 0 && (
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, background: 'var(--danger)', color: 'white', fontWeight: 700 }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
              Direct Messages
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Manager DM */}
              <button
                onClick={() => setActiveTab('dm-manager')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                  borderRadius: 'var(--radius-md)', border: 'none',
                  background: activeTab === 'dm-manager' ? 'var(--accent-muted)' : 'transparent',
                  color: activeTab === 'dm-manager' ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem'
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: manager.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.55rem', fontWeight: 700 }}>
                  {manager.initials}
                </div>
                <span style={{ flex: 1, fontWeight: activeTab === 'dm-manager' ? 600 : 400 }}>{manager.name} (EM)</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
              </button>

              {/* Sarah DM */}
              <button
                onClick={() => setActiveTab('dm-sarah')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                  borderRadius: 'var(--radius-md)', border: 'none',
                  background: activeTab === 'dm-sarah' ? 'var(--accent-muted)' : 'transparent',
                  color: activeTab === 'dm-sarah' ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem'
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: TEAM_MEMBERS.senior_dev.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.55rem', fontWeight: 700 }}>
                  SL
                </div>
                <span style={{ flex: 1 }}>Sarah Lin (Sr Dev)</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
              </button>

              {/* Devon DM */}
              <button
                onClick={() => setActiveTab('dm-devon')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                  borderRadius: 'var(--radius-md)', border: 'none',
                  background: activeTab === 'dm-devon' ? 'var(--accent-muted)' : 'transparent',
                  color: activeTab === 'dm-devon' ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem'
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: TEAM_MEMBERS.qa_lead.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.55rem', fontWeight: 700 }}>
                  DV
                </div>
                <span style={{ flex: 1 }}>Devon Vance (QA)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        
        {/* Chat Header */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isDM ? (
                <>
                  <MessageSquare size={16} />
                  <span>
                    {activeDmId === 'manager' ? manager.name : activeDmId === 'sarah' ? 'Sarah Lin' : 'Devon Vance'}
                  </span>
                </>
              ) : (
                <>
                  <Hash size={16} />
                  <span>{activeChannel?.name}</span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {isDM ? 'Direct Message · Encrypted' : activeChannel?.topic}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {activeTab === 'channel-standup' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowStandupModal(true)} style={{ gap: 6 }}>
                <Sparkles size={14} /> Submit Standup
              </button>
            )}
            {isDM && voiceSupported && (
              <button
                className={`btn btn-sm ${voiceMode ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setVoiceMode(!voiceMode)}
                title="Toggle voice mode"
              >
                {voiceMode ? <Mic size={14} /> : <MicOff size={14} />}
                {voiceMode ? ' Voice Active' : ' Voice Mode'}
              </button>
            )}
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Channel messages */}
          {!isDM && activeChannel?.initialMessages.map(msg => {
            const member = getMember(msg.senderId);
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-md)',
                  background: member.avatarColor, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0
                }}>
                  {member.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{member.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{msg.timestamp}</span>
                  </div>
                  <div style={{
                    fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-line',
                    background: msg.isAlert ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    padding: msg.isAlert ? '8px 12px' : '0',
                    borderRadius: msg.isAlert ? 'var(--radius-md)' : '0',
                    borderLeft: msg.isAlert ? '3px solid var(--danger)' : 'none',
                  }}>
                    {msg.content}
                  </div>
                  {msg.reactions?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {msg.reactions.map((r, i) => (
                        <span key={i} style={{
                          fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12,
                          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                          display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer'
                        }}>
                          {r.emoji} {r.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* DM messages */}
          {isDM && currentDmMessages.map((msg, i) => {
            const member = getMember(msg.role === 'user' ? 'user' : (msg.senderId || manager.id));
            const isMe = msg.role === 'user';
            return (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && (
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                    background: member.avatarColor, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0
                  }}>
                    {member.initials}
                  </div>
                )}
                <div style={{
                  maxWidth: '70%',
                  background: isMe ? 'var(--accent-muted)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  padding: '10px 14px', borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {msg.content}
                  </div>
                  {!isMe && voiceSupported && (
                    <button
                      onClick={() => isSpeaking ? stopSpeaking() : speak(msg.content)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, color: 'var(--text-tertiary)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      {isSpeaking ? 'Stop Audio' : 'Listen'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: 0.7, padding: '4px 0' }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>teammate is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isDM ? `Message ${activeDmId === 'manager' ? manager.name : activeDmId}...` : `Message #${activeChannel?.name}...`}
              style={{ flex: 1 }}
            />
            {voiceMode && (
              <button
                className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'} btn-icon`}
                onClick={toggleListening}
                title="Tap to speak"
              >
                <Mic size={18} />
              </button>
            )}
            <button
              className="btn btn-primary btn-icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Standup Submission Modal */}
      {showStandupModal && (
        <div className="modal-overlay" onClick={() => setShowStandupModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ marginBottom: 6 }}>🗓️ Daily Standup Update</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Share your sprint status with the engineering team.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label>1. What did you accomplish yesterday?</label>
                <input
                  className="input"
                  placeholder="e.g. Fixed Safari login page regex and event handler"
                  value={standupForm.yesterday}
                  onChange={e => setStandupForm(p => ({ ...p, yesterday: e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label>2. What are you working on today?</label>
                <input
                  className="input"
                  placeholder="e.g. Opening Pull Request for mobile auth bug and testing edge cases"
                  value={standupForm.today}
                  onChange={e => setStandupForm(p => ({ ...p, today: e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label>3. Any blockers?</label>
                <input
                  className="input"
                  placeholder="e.g. None / Need Devon's review on the test suite"
                  value={standupForm.blockers}
                  onChange={e => setStandupForm(p => ({ ...p, blockers: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button className="btn btn-secondary" onClick={() => setShowStandupModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handlePostStandup}
                  disabled={!standupForm.yesterday || !standupForm.today}
                >
                  Post to #daily-standup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

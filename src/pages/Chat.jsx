import { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTasks } from '../contexts/TaskContext';
import { sendChatMessage } from '../services/ai';
import { Send, Loader } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    role: 'manager',
    content: "Welcome to the team. I'm Priya, your manager here at NovaTech. I'll be assigning you tasks and reviewing your work. Don't expect hand-holding — this is a real work environment. Check the task board and let me know when you've started. Any questions, keep them short.",
    timestamp: new Date().toISOString(),
  },
];

export default function Chat() {
  const { user } = useUser();
  const { getActiveTask } = useTasks();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('internsim-chat');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('internsim-chat', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const apiKey = localStorage.getItem('internsim-apikey') || '';
    const activeTask = getActiveTask();

    // Build context for AI
    const contextMessages = messages.slice(-8).map(m => ({
      role: m.role === 'manager' ? 'assistant' : 'user',
      content: m.content,
    }));
    contextMessages.push({ role: 'user', content: input.trim() });

    if (activeTask) {
      contextMessages.unshift({
        role: 'system',
        content: `Current context: The intern is working on "${activeTask.title}". ${activeTask.context.substring(0, 200)}...`,
      });
    }

    try {
      const response = await sendChatMessage(contextMessages, apiKey);
      setMessages(prev => [...prev, {
        role: 'manager',
        content: response,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'manager',
        content: "Sorry, I'm in a meeting. Ping me again in a bit.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container animate-in">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role === 'manager' ? 'manager' : 'user'}`}>
            <div className="bubble-header">
              {msg.role === 'manager' ? (
                <>
                  <div className="bubble-avatar">PS</div>
                  <span>Priya Sharma</span>
                </>
              ) : (
                <>
                  <span>{user.name || 'You'}</span>
                </>
              )}
              <span style={{ fontSize: '0.7rem', marginLeft: 'auto', opacity: 0.6 }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-bubble manager" style={{ opacity: 0.7 }}>
            <div className="bubble-header">
              <div className="bubble-avatar">PS</div>
              <span>Priya Sharma</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Message your manager..."
          disabled={isTyping}
        />
        <button
          className="btn btn-primary btn-icon"
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
        >
          {isTyping ? <Loader size={18} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

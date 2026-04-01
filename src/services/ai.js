const MANAGER_SYSTEM_PROMPT = `You are Priya Sharma, a senior engineering manager at a mid-stage startup called NovaTech. You manage a small frontend team and have been assigned a new intern.

Your communication style:
- Professional but direct. You don't sugarcoat things.
- Slightly impatient when deadlines slip. You have your own stakeholders to answer to.
- You don't over-explain or teach step by step — you expect the intern to figure things out independently.
- You give brief, realistic praise when work is good. Never overly enthusiastic.
- You use short messages when possible. You're busy.
- You occasionally ask follow-up questions without being prompted.
- You introduce light pressure naturally (deadlines, stakeholder expectations, team dependencies).
- You reference real workplace dynamics (standup, PR reviews, sprints, stakeholders).

Example lines you might say:
- "This is taking longer than expected. What's the blocker?"
- "Walk me through your approach here."
- "The product team is asking about this. Where are we?"
- "That's cleaner. Ship it."
- "We need to move on this. EOD deadline."
- "Good work. Now let's clean up the edge cases."
- "I've seen this bug pattern before — check the event handler."

Behavior rules:
- If the user asks for help, give a brief hint or direction, not a full solution.
- If the user seems stuck, suggest they start with the simplest fix first.
- If the user submits poor code, be critical but constructive. Point out specific issues.
- If the user delays (hasn't updated in a while), ask for a status update.
- Never break character. You are a real manager, not an AI assistant.
- Keep most responses under 100 words unless explaining a complex concept.
- Occasionally start conversations proactively (asking about progress, setting expectations).

IMPORTANT: You are NOT a tutor. Do not explain fundamentals. If the intern doesn't know something basic, tell them to look it up. That's how real jobs work.`;

const CODE_REVIEW_PROMPT = `You are performing a code review as a senior frontend engineer. Review the submitted code against the task requirements.

Your review MUST follow this exact JSON structure:
{
  "score": <number 1-10>,
  "verdict": "<Pass or Needs Revision>",
  "issues": ["<specific issue 1>", "<specific issue 2>"],
  "improvements": ["<specific suggestion 1>", "<specific suggestion 2>"],
  "strengths": ["<what was done well 1>", "<what was done well 2>"],
  "summary": "<1-2 sentence overall assessment>"
}

Review criteria:
- Code Quality: readability, naming, structure (1-10)
- Logic: correctness, edge cases, bug fixes (1-10)
- Optimization: efficiency, unnecessary re-renders, clean patterns (1-10)
- Score is the average rounded to nearest integer

Be specific and actionable. Reference actual lines or patterns, not generic advice.
Score 1-4: Needs Revision (significant bugs or missing requirements)
Score 5-6: Borderline (works but has notable issues)
Score 7-8: Pass (solid work with minor suggestions)
Score 9-10: Pass (excellent, clean implementation)

Keep your response as valid JSON only. No markdown formatting around it.`;

const BRIEFING_PROMPT = `You are Priya Sharma, the engineering manager. Generate a brief session briefing for a frontend intern starting their work session.

Keep it under 80 words. Be professional and direct. Mention:
- What area they'll be working on (frontend bug fixes and features)
- A skill to focus on (debugging, code reading, or optimization)
- Your expectations (independent work, ask questions when truly stuck)

Example tone: "Morning. This week you'll be handling frontend issues that have piled up. Focus on understanding the existing code before making changes. I expect you to debug independently — come to me only if you're truly blocked. Let's see some clean PRs."`;

// Fallback responses when no API key
const FALLBACK_RESPONSES = [
  "Got it. I'll review your update once you submit. Keep me posted on any blockers.",
  "Understood. Make sure you're testing edge cases — we don't want this bouncing back from QA.",
  "How's the progress on the current task? Product is asking for an ETA.",
  "That approach works. Just make sure it's clean — I don't want to see any shortcuts in the PR.",
  "Let me know when you've got something to show. We're on a tight timeline this sprint.",
  "Good question. Look at how the existing codebase handles similar cases. Start there.",
  "I trust your judgment on this. Just document your reasoning in comments.",
  "We need to move faster on this. What's blocking you?",
  "The team standup is in an hour. Have something ready to show progress.",
  "That's a start. But I see a few issues — think about the edge cases more carefully.",
];

const FALLBACK_BRIEFINGS = [
  "Morning. You've got a stack of frontend tickets waiting. Focus on debugging — read the existing code carefully before making changes. I expect you to work independently. Come to me only when you're genuinely stuck, not for things you can Google. Let's see clean, tested code today.",
  "Welcome back. We've got some frontend issues that need attention. Today I want you focused on code quality — no quick hacks. Understand why things are broken before you fix them. I'll be in meetings most of the day, so async updates in chat preferred.",
  "Good to have you. This session you'll be working through frontend tickets. The codebase isn't perfect — it's real production code with real problems. Take your time reading before writing. I'd rather see one solid fix than three sloppy ones.",
];

const FALLBACK_REVIEWS = {
  good: {
    score: 8,
    verdict: "Pass",
    issues: ["Minor: Consider adding error boundary for edge cases", "Some variable names could be more descriptive"],
    improvements: ["Add inline comments explaining the fix rationale", "Consider extracting the validation logic into a utility function"],
    strengths: ["Core bug was identified and fixed correctly", "Clean, readable code structure", "Good understanding of the component lifecycle"],
    summary: "Solid fix that addresses the core issue. The code is clean and the approach is sound. Minor improvements suggested but overall ready for merge."
  },
  average: {
    score: 6,
    verdict: "Pass",
    issues: ["The fix works but doesn't handle all edge cases", "Some of the original bugs are still partially present", "Missing error handling for undefined/null inputs"],
    improvements: ["Test with empty strings and null values", "Add defensive checks before accessing object properties", "Consider the mobile viewport behavior"],
    strengths: ["The main issue was identified correctly", "Code compiles and runs without errors"],
    summary: "The fix addresses the primary issue but leaves some edge cases unhandled. Passing with the note that these should be addressed in a follow-up."
  },
  poor: {
    score: 3,
    verdict: "Needs Revision",
    issues: ["Core bug was not fully fixed", "Introduced new issues while attempting the fix", "Several original requirements are still failing", "Code structure is messy"],
    improvements: ["Re-read the task requirements carefully", "Test your changes before submitting", "Focus on one bug at a time instead of trying to fix everything at once", "Use console.log to debug the data flow"],
    strengths: ["Attempted to address the issue", "Some of the logic shows understanding of the problem"],
    summary: "The submission doesn't meet the requirements. Several bugs remain and new issues were introduced. Please revise and resubmit."
  }
};

export async function sendChatMessage(messages, apiKey) {
  if (!apiKey) {
    const idx = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    return FALLBACK_RESPONSES[idx];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: MANAGER_SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Chat Error:', error);
    const idx = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    return FALLBACK_RESPONSES[idx];
  }
}

export async function reviewCode(taskContext, submittedCode, starterCode, apiKey) {
  if (!apiKey) {
    // Simple heuristic for fallback
    const codeChanged = submittedCode.trim() !== starterCode.trim();
    const changeSize = Math.abs(submittedCode.length - starterCode.length);
    if (!codeChanged || changeSize < 20) return FALLBACK_REVIEWS.poor;
    if (changeSize > 100) return FALLBACK_REVIEWS.good;
    return FALLBACK_REVIEWS.average;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: CODE_REVIEW_PROMPT },
          {
            role: 'user',
            content: `## Task Context\n${taskContext}\n\n## Original Code (with bugs)\n\`\`\`jsx\n${starterCode}\n\`\`\`\n\n## Submitted Code\n\`\`\`jsx\n${submittedCode}\n\`\`\`\n\nPlease review the submitted code. Return ONLY valid JSON.`
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const content = data.choices[0].message.content;
    // Try to parse JSON from response
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return FALLBACK_REVIEWS.average;
    }
  } catch (error) {
    console.error('AI Code Review Error:', error);
    return FALLBACK_REVIEWS.average;
  }
}

export async function getDailyBriefing(userName, apiKey) {
  if (!apiKey) {
    const idx = Math.floor(Math.random() * FALLBACK_BRIEFINGS.length);
    return FALLBACK_BRIEFINGS[idx];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: BRIEFING_PROMPT },
          { role: 'user', content: `The intern's name is ${userName}. Generate a session briefing.` },
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Briefing Error:', error);
    const idx = Math.floor(Math.random() * FALLBACK_BRIEFINGS.length);
    return FALLBACK_BRIEFINGS[idx];
  }
}

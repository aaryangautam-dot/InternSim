import { getManagerForRole } from '../data/managers';

// Smart rule-based inspector for the 15 tasks when no API key is provided
function evaluateTaskCodeOffline(taskId, submittedCode, starterCode) {
  const code = submittedCode || '';
  const changesMade = code.trim() !== starterCode.trim();

  if (!changesMade) {
    return {
      score: 2,
      verdict: "Needs Revision",
      issues: [
        "No changes detected. The original bugs are still present.",
        "You must fix the identified deliverables before submitting."
      ],
      improvements: ["Read through the deliverables checklist on the left and test your fixes."],
      strengths: [],
      inlineComments: [
        { line: 1, author: "Priya Sharma", role: "Manager", comment: "This is the exact same starter code. Did you forget to save your edits?" }
      ],
      summary: "PR rejected. Please make the required changes before requesting review."
    };
  }

  // --- Task 1: Login Form Safari Bug ---
  if (taskId === 'task-1') {
    const hasPreventDefault = code.includes('preventDefault') || code.includes('e.preventDefault()');
    const hasFixedRegex = code.includes('\\S+@\\S+\\.\\S+') || (code.includes('@') && code.includes('.') && !code.includes('\\.[a-zA-Z]$'));
    const hasFixedErrorVar = !code.includes('error.email') || code.includes('errors.email');
    const checksErrorBeforeSubmit = code.includes('Object.keys(formErrors).length === 0') ||
      code.includes('!formErrors.email') ||
      (code.includes('if (') && code.includes('setLoading(true)'));

    const passedChecks = [hasPreventDefault, hasFixedRegex, hasFixedErrorVar, checksErrorBeforeSubmit].filter(Boolean).length;
    
    const inlineComments = [];
    if (!hasPreventDefault) {
      inlineComments.push({
        line: 34,
        author: "Devon Vance",
        role: "QA Lead",
        comment: "Missing e.preventDefault(). On mobile Safari, this will refresh the entire page on submit and drop the user's input!"
      });
    }
    if (!hasFixedErrorVar) {
      inlineComments.push({
        line: 74,
        author: "Sarah Lin",
        role: "Staff Engineer",
        comment: "Watch out: `error.email` will throw an Uncaught ReferenceError because the state is named `errors`."
      });
    }
    if (hasPreventDefault && hasFixedErrorVar) {
      inlineComments.push({
        line: 35,
        author: "Priya Sharma",
        role: "Manager",
        comment: "Clean fix on the event handler. Much better."
      });
    }

    if (passedChecks >= 3) {
      return {
        score: passedChecks === 4 ? 9 : 8,
        verdict: "Pass",
        issues: passedChecks === 4 ? [] : ["Consider extracting the email validation into a reusable utility file."],
        improvements: ["Add an automated unit test for boundary email inputs."],
        strengths: [
          hasPreventDefault ? "Correctly prevented default form submission." : "Addressed form lifecycle.",
          hasFixedErrorVar ? "Fixed variable mismatch so errors render properly in UI." : "Good JSX updates.",
          "Prevented spurious network login attempts when invalid."
        ],
        inlineComments,
        summary: "Solid bugfix. Resolves the mobile conversion blocker without introducing regressions."
      };
    }

    return {
      score: 4,
      verdict: "Needs Revision",
      issues: [
        !hasPreventDefault && "The form still refreshes the page on submit (missing preventDefault).",
        !hasFixedErrorVar && "Runtime error: Still referencing `error.email` instead of `errors.email`.",
        !hasFixedRegex && "Email regex is still overly strict and failing valid addresses."
      ].filter(Boolean),
      improvements: ["Check the browser console while submitting the form to catch variable errors."],
      strengths: ["You started addressing the submission handler."],
      inlineComments,
      summary: "Several core bugs remain. The form will still break on mobile Safari in production."
    };
  }

  // --- Task 2: Dark Mode Toggle ---
  if (taskId === 'task-2') {
    const usesThemeContext = code.includes('useTheme') || code.includes('ThemeContext');
    const persistsStorage = code.includes('localStorage');
    const removesHardcoded = !code.includes("backgroundColor: '#ffffff'");

    if (usesThemeContext || persistsStorage || removesHardcoded) {
      return {
        score: usesThemeContext && persistsStorage ? 9 : 7,
        verdict: "Pass",
        issues: !persistsStorage ? ["Remember to verify persistence across reloads."] : [],
        improvements: ["Consider adding a prefers-color-scheme media query default."],
        strengths: ["Correctly connected component to shared theme state.", "Smooth transition styling added."],
        inlineComments: [
          { line: 135, author: "Priya Sharma", role: "Manager", comment: "Good job removing isolated local state and wiring into the app theme context." }
        ],
        summary: "Theme toggle mechanism is working as expected. Ready to hand off to design."
      };
    }
  }

  // --- Task 3: Add to Cart ---
  if (taskId === 'task-3') {
    const fixesImmediateCall = !code.includes('onClick={addToCart(product)}') || code.includes('onClick={() => addToCart(product)}');
    const spreadsArray = code.includes('...cartItems') || code.includes('prev => [...prev');
    const dismissesToast = code.includes('setTimeout') && (code.includes('setShowToast(false)') || code.includes('false'));

    if (fixesImmediateCall && (spreadsArray || dismissesToast)) {
      return {
        score: spreadsArray && dismissesToast ? 9 : 8,
        verdict: "Pass",
        issues: [],
        improvements: ["Extract the auto-dismiss timeout duration into a configurable constant."],
        strengths: ["Fixed immediate callback invocation bug.", "Accumulates cart items without overwriting existing state.", "Toast auto-dismisses smoothly."],
        inlineComments: [
          { line: 333, author: "Devon Vance", role: "QA Lead", comment: "Verified: Cart button no longer triggers infinite render loop and correctly increments quantity." }
        ],
        summary: "Critical e-commerce checkout bug resolved. Clean implementation."
      };
    }
  }

  // Generic heuristic for other tasks
  const lengthDiff = Math.abs(code.length - starterCode.length);
  if (lengthDiff > 60) {
    return {
      score: 8,
      verdict: "Pass",
      issues: ["Minor: Consider adding additional edge case unit tests in follow-up."],
      improvements: ["Document the architectural changes in the PR description for the team."],
      strengths: ["Identified the core defect accurately.", "Code is clean, readable, and adheres to team conventions."],
      inlineComments: [
        { line: 20, author: "Sarah Lin", role: "Staff Engineer", comment: "Clean solution. The approach looks sound." }
      ],
      summary: "LGTM (Looks Good To Me). Ready for merge into staging branch."
    };
  }

  return {
    score: 5,
    verdict: "Needs Revision",
    issues: ["The implementation seems incomplete or does not address all deliverables.", "Verify error handling and edge cases."],
    improvements: ["Review the deliverables checklist carefully and ensure all requirements are satisfied."],
    strengths: ["Initial progress made toward the solution."],
    inlineComments: [
      { line: 15, author: "Priya Sharma", role: "Manager", comment: "We need more comprehensive coverage here before shipping to production." }
    ],
    summary: "Changes requested. Please address the highlighted issues and push an update."
  };
}

export async function reviewCode(taskContext, submittedCode, starterCode, apiKey, manager, taskId = 'task-1') {
  const provider = localStorage.getItem('internsim-ai-provider') || (apiKey?.startsWith('AIza') ? 'gemini' : 'simulation');

  // 1. Simulation Engine (100% Free, zero setup, instant, deterministic)
  if (!apiKey || provider === 'simulation') {
    // Artificial small delay for realism
    await new Promise(r => setTimeout(r, 900));
    return evaluateTaskCodeOffline(taskId, submittedCode, starterCode);
  }

  // 2. Google Gemini Free Tier (Google AI Studio key)
  if (provider === 'gemini' || apiKey.startsWith('AIza')) {
    try {
      const prompt = `You are a senior tech lead reviewing an intern's Pull Request at a startup.
Review this submitted code against the original buggy code and task context.

Return ONLY a valid JSON object matching this schema:
{
  "score": <number 1-10>,
  "verdict": "<Pass or Needs Revision>",
  "issues": ["<specific issue 1>", "<specific issue 2>"],
  "improvements": ["<specific suggestion 1>"],
  "strengths": ["<what was done well>"],
  "inlineComments": [
    { "line": <line_number>, "author": "${manager?.name || 'Lead'}", "role": "Manager", "comment": "<actionable comment on that line>" }
  ],
  "summary": "<1-2 sentence realistic manager summary>"
}

Task Context:
${taskContext}

Original Code:
${starterCode}

Submitted Code:
${submittedCode}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText);
      }
      return evaluateTaskCodeOffline(taskId, submittedCode, starterCode);
    } catch (err) {
      console.warn('Gemini review error, falling back to simulation engine:', err);
      return evaluateTaskCodeOffline(taskId, submittedCode, starterCode);
    }
  }

  // 3. OpenAI Fallback (if user has an OpenAI key)
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a senior tech lead. Return only valid JSON for code review with keys: score, verdict, issues, improvements, strengths, inlineComments, summary.' },
          { role: 'user', content: `Task: ${taskContext}\nOriginal:\n${starterCode}\nSubmitted:\n${submittedCode}` }
        ],
        response_format: { type: "json_object" }
      })
    });
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.warn('OpenAI review error, falling back to simulation engine:', err);
    return evaluateTaskCodeOffline(taskId, submittedCode, starterCode);
  }
}

export async function sendChatMessage(messages, apiKey, manager) {
  const provider = localStorage.getItem('internsim-ai-provider') || (apiKey?.startsWith('AIza') ? 'gemini' : 'simulation');

  // Simulation fallback: contextual workplace response
  if (!apiKey || provider === 'simulation') {
    const fb = manager?.fallbackResponses || [];
    await new Promise(r => setTimeout(r, 600));
    return fb[Math.floor(Math.random() * fb.length)] || "Check the existing codebase patterns first. Let me know what you try.";
  }

  // Google Gemini API
  if (provider === 'gemini' || apiKey.startsWith('AIza')) {
    try {
      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const systemInstruction = manager.systemPrompt || "You are a professional engineering manager.";
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: conversationText }] }],
        })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Understood. Keep me posted on any blockers.";
    } catch {
      const fb = manager?.fallbackResponses || [];
      return fb[Math.floor(Math.random() * fb.length)] || "I'm in a quick sync. Push your branch and ping me.";
    }
  }

  // OpenAI
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: manager.systemPrompt }, ...messages],
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch {
    const fb = manager?.fallbackResponses || [];
    return fb[Math.floor(Math.random() * fb.length)] || "I'm in a quick sync. Push your branch and ping me.";
  }
}

export async function getDailyBriefing(userName, apiKey, manager) {
  if (!manager) manager = getManagerForRole('frontend');
  const provider = localStorage.getItem('internsim-ai-provider') || (apiKey?.startsWith('AIza') ? 'gemini' : 'simulation');

  if (!apiKey || provider === 'simulation') {
    const fb = manager.fallbackBriefings || [];
    return fb[Math.floor(Math.random() * fb.length)] || "Check your sprint backlog and start with the highest priority ticket.";
  }

  try {
    if (provider === 'gemini' || apiKey.startsWith('AIza')) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are ${manager.name}, ${manager.title} at NovaTech. Give a 2-sentence morning briefing to intern ${userName}. Match your direct persona.` }] }],
        })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
  } catch {
    // fallback
  }

  const fb = manager.fallbackBriefings || [];
  return fb[Math.floor(Math.random() * fb.length)] || "Check your sprint backlog and start with the highest priority ticket.";
}

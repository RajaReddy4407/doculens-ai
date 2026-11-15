import {
  AnalysisMode,
  AnalysisResult,
  NextActionOutput,
  PersonalityMode,
  UploadedFilePayload,
} from "@/types/analysis";

export interface DemoPreset {
  id: string;
  label: string;
  badge: string;
  mode: AnalysisMode;
  description: string;
  file: UploadedFilePayload;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

const HANDWRITING_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="540" viewBox="0 0 760 540">
  <rect width="760" height="540" fill="#fdfbf7"/>
  <g stroke="#e2e8f0" stroke-width="1">
    <line x1="0" y1="70" x2="760" y2="70"/><line x1="0" y1="115" x2="760" y2="115"/>
    <line x1="0" y1="160" x2="760" y2="160"/><line x1="0" y1="205" x2="760" y2="205"/>
    <line x1="0" y1="250" x2="760" y2="250"/><line x1="0" y1="295" x2="760" y2="295"/>
    <line x1="0" y1="340" x2="760" y2="340"/><line x1="0" y1="385" x2="760" y2="385"/>
    <line x1="0" y1="430" x2="760" y2="430"/><line x1="0" y1="475" x2="760" y2="475"/>
  </g>
  <line x1="78" y1="0" x2="78" y2="540" stroke="#fda4af" stroke-width="2"/>
  <g font-family="Comic Sans MS, Chalkboard SE, cursive" fill="#1e293b">
    <text x="95" y="58" font-size="26" font-weight="bold" fill="#0f172a">Calculus Lecture #4 - Derivatives &amp; Kinematics</text>
    <text x="95" y="105" font-size="20">1. Power Rule:  d/dx (x^n) = n * x^(n-1)</text>
    <text x="95" y="150" font-size="20">Example:  f(x) = x^3 + 4x^2 - 7</text>
    <text x="95" y="195" font-size="20" fill="#b91c1c">   f'(x) = 2x^2 + 8x   &lt;-- check power!</text>
    <text x="95" y="242" font-size="20">2. Velocity v(t) = ds/dt,  Acceleration a(t) = dv/dt</text>
    <text x="95" y="287" font-size="20">If s(t) = 5t^2 + 3t, then v(2) = 10(2) + 3 = 23 m/s</text>
    <text x="95" y="334" font-size="20" font-weight="bold" fill="#1d4ed8">Exam Tip: Always check chain rule on composite fns!</text>
    <text x="95" y="378" font-size="19">   d/dx [sin(3x)] = 3 cos(3x)</text>
    <text x="95" y="423" font-size="19">Homework due: Friday Oct 18 - Ch 3 #1-15 odd</text>
  </g>
</svg>
`);

const SCREENSHOT_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520">
  <rect width="760" height="520" rx="12" fill="#0f172a"/>
  <rect width="760" height="38" rx="12" fill="#1e293b"/>
  <circle cx="22" cy="19" r="6" fill="#ef4444"/><circle cx="42" cy="19" r="6" fill="#eab308"/><circle cx="62" cy="19" r="6" fill="#22c55e"/>
  <text x="95" y="24" font-family="monospace" font-size="13" fill="#94a3b8">UserList.tsx — Next.js App</text>
  <g font-family="monospace" font-size="15" fill="#e2e8f0">
    <text x="26" y="78" fill="#64748b">12</text><text x="64" y="78"><tspan fill="#c084fc">export function</tspan> <tspan fill="#38bdf8">UserList</tspan>({ users }) {</text>
    <text x="26" y="106" fill="#64748b">13</text><text x="64" y="106">  <tspan fill="#c084fc">return</tspan> (</text>
    <text x="26" y="134" fill="#64748b">14</text><text x="64" y="134">    &lt;<tspan fill="#4ade80">ul</tspan>&gt;{users.<tspan fill="#fbbf24">map</tspan>(u =&gt; &lt;li key={u.id}&gt;{u.name}&lt;/li&gt;)}&lt;/<tspan fill="#4ade80">ul</tspan>&gt;</text>
    <text x="26" y="162" fill="#64748b">15</text><text x="64" y="162">  );</text>
    <text x="26" y="190" fill="#64748b">16</text><text x="64" y="190">}</text>
  </g>
  <rect x="20" y="225" width="720" height="270" rx="8" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
  <text x="40" y="258" font-family="monospace" font-size="15" font-weight="bold" fill="#f87171">Runtime TypeError: Cannot read properties of undefined (reading 'map')</text>
  <g font-family="monospace" font-size="13" fill="#fca5a5">
    <text x="40" y="290">at UserList (src/components/UserList.tsx:14:15)</text>
    <text x="40" y="316">at DashboardPage (src/app/page.tsx:28:7)</text>
    <text x="40" y="352" fill="#a8a29e">Call Stack: fetch('/api/users') returned { data: [...] } instead of array</text>
    <text x="40" y="382" fill="#a8a29e">React 19.3.0 | Next.js 16.4.6 (Client Component)</text>
  </g>
</svg>
`);

const INVOICE_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="540" viewBox="0 0 760 540">
  <rect width="760" height="540" fill="#ffffff"/>
  <rect width="760" height="84" fill="#1e293b"/>
  <text x="36" y="48" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">NORTHSTAR CLOUD &amp; FIBER</text>
  <text x="36" y="68" font-family="sans-serif" font-size="12" fill="#94a3b8">Invoice #INV-2026-8841  |  Account: ACCT-99204</text>
  <text x="580" y="45" font-family="sans-serif" font-size="13" fill="#cbd5e1">AMOUNT DUE</text>
  <text x="580" y="70" font-family="sans-serif" font-size="24" font-weight="bold" fill="#38bdf8">$248.40</text>
  <g font-family="sans-serif" font-size="14" fill="#334155">
    <text x="36" y="124" font-weight="bold">Billing Period: Nov 01 – Nov 30, 2026</text>
    <text x="450" y="124" font-weight="bold" fill="#dc2626">Due Date: Dec 05, 2026</text>
    <line x1="36" y1="148" x2="724" y2="148" stroke="#e2e8f0"/>
    <text x="36" y="182">Business Fiber 1Gbps Plan</text><text x="640" y="182">$129.00</text>
    <text x="36" y="218">Managed Cloud Backup (2 TB)</text><text x="640" y="218">$65.00</text>
    <text x="36" y="254">Static IPv4 Block (4 Addresses)</text><text x="640" y="254">$36.00</text>
    <line x1="36" y1="280" x2="724" y2="280" stroke="#e2e8f0"/>
    <text x="480" y="312">Subtotal:</text><text x="640" y="312">$230.00</text>
    <text x="480" y="340">State &amp; Local Tax (8%):</text><text x="640" y="340">$18.40</text>
    <text x="480" y="376" font-size="18" font-weight="bold" fill="#0f172a">Total Due:</text>
    <text x="640" y="376" font-size="18" font-weight="bold" fill="#0f172a">$248.40</text>
    <rect x="36" y="416" width="688" height="86" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="54" y="446" font-weight="bold" fill="#0f172a">Payment Instructions</text>
    <text x="54" y="470" font-size="13">ACH Routing: 021000021  |  Account: 883920114  |  Memo: INV-2026-8841</text>
    <text x="54" y="490" font-size="13" fill="#b91c1c">Late fee of $15.00 applies after Dec 10, 2026.</text>
  </g>
</svg>
`);

const DIAGRAM_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520">
  <rect width="760" height="520" fill="#0b1120"/>
  <text x="380" y="44" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#f8fafc">Cellular Respiration — Energy Flow Diagram</text>
  <rect x="45" y="110" width="175" height="90" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="132" y="148" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">1. Glycolysis</text>
  <text x="132" y="172" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#cbd5e1">Cytosol • 2 ATP</text>
  <line x1="220" y1="155" x2="285" y2="155" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arrow)"/>
  <rect x="285" y="110" width="185" height="90" rx="12" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
  <text x="377" y="148" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#c084fc">2. Krebs Cycle</text>
  <text x="377" y="172" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#cbd5e1">Mitochondrial Matrix • 2 ATP</text>
  <line x1="470" y1="155" x2="530" y2="155" stroke="#94a3b8" stroke-width="2.5"/>
  <rect x="530" y="110" width="190" height="90" rx="12" fill="#1e293b" stroke="#22c55e" stroke-width="2"/>
  <text x="625" y="148" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#4ade80">3. Electron Transport</text>
  <text x="625" y="172" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#cbd5e1">Inner Membrane • ~32 ATP</text>
  <rect x="90" y="265" width="580" height="175" rx="12" fill="#111827" stroke="#334155"/>
  <text x="380" y="302" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#fbbf24">Overall Equation: C6H12O6 + 6 O2 → 6 CO2 + 6 H2O + ~36 ATP</text>
  <text x="380" y="340" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#cbd5e1">• NADH &amp; FADH2 carry high-energy electrons from Stages 1 &amp; 2 to Stage 3.</text>
  <text x="380" y="372" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#cbd5e1">• Oxygen acts as the final electron acceptor, forming water (H2O).</text>
  <text x="380" y="404" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#cbd5e1">• Proton gradient drives ATP Synthase (chemiosmosis).</text>
</svg>
`);

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "handwriting-math",
    label: "Handwritten Math Notes",
    badge: "Handwriting",
    mode: "handwriting",
    description: "Calculus notes with an intentional derivative mistake to catch",
    file: {
      id: "preset-handwriting-math",
      name: "calculus-lecture-4-notes.svg",
      mimeType: "image/svg+xml",
      size: 2048,
      dataUrl: HANDWRITING_SVG,
      presetId: "handwriting-math",
    },
  },
  {
    id: "error-screenshot",
    label: "React Error Screenshot",
    badge: "Screenshot",
    mode: "screenshot",
    description: "Code snippet + runtime TypeError stack trace",
    file: {
      id: "preset-error-screenshot",
      name: "nextjs-typeerror-screenshot.svg",
      mimeType: "image/svg+xml",
      size: 1980,
      dataUrl: SCREENSHOT_SVG,
      presetId: "error-screenshot",
    },
  },
  {
    id: "utility-invoice",
    label: "Cloud & Fiber Invoice",
    badge: "Everyday Life",
    mode: "everyday",
    description: "Bill with line items, tax, due date, and ACH instructions",
    file: {
      id: "preset-utility-invoice",
      name: "northstar-invoice-nov-2026.svg",
      mimeType: "image/svg+xml",
      size: 2150,
      dataUrl: INVOICE_SVG,
      presetId: "utility-invoice",
    },
  },
  {
    id: "science-diagram",
    label: "Biology Diagram",
    badge: "Visual Learning",
    mode: "visual_learning",
    description: "Cellular respiration diagram with flashcards & quiz",
    file: {
      id: "preset-science-diagram",
      name: "cellular-respiration-diagram.svg",
      mimeType: "image/svg+xml",
      size: 2210,
      dataUrl: DIAGRAM_SVG,
      presetId: "science-diagram",
    },
  },
  {
    id: "resume-doc",
    label: "Engineer Resume",
    badge: "Next Actions",
    mode: "auto",
    description: "Text resume that triggers Interview Questions & Skill Gap actions",
    file: {
      id: "preset-resume-doc",
      name: "alex-rivera-resume.txt",
      mimeType: "text/plain",
      size: 1120,
      presetId: "resume-doc",
      textContent: `ALEX RIVERA — Senior Full-Stack Engineer
Location: Austin, TX | Email: alex.rivera@example.com | GitHub: github.com/arivera

SUMMARY
Full-stack engineer with 6+ years building TypeScript, Next.js, Node.js, and PostgreSQL applications. Led migration of monolithic billing service to event-driven microservices handling 4M+ daily events.

EXPERIENCE
Staff Software Engineer, PulseCloud (2023 – Present)
- Architected real-time analytics dashboard using Next.js App Router, WebSockets, and Redis.
- Reduced API p95 latency from 480ms to 95ms via query indexing and edge caching.
- Mentored 5 engineers and introduced automated Playwright E2E testing in CI.

Software Engineer, FinLedger (2020 – 2023)
- Built Stripe + ACH reconciliation pipeline in Node.js and PostgreSQL with idempotent webhooks.
- Designed role-based access control (RBAC) and audit logging for SOC2 compliance.

SKILLS
TypeScript, React, Next.js, Node.js, PostgreSQL, Redis, Docker, AWS, Tailwind CSS

EDUCATION
B.S. Computer Science, University of Texas at Austin (2019)`,
    },
  },
];

function tonePrefix(personality: PersonalityMode): string {
  switch (personality) {
    case "beginner":
      return "[Beginner-Friendly] ";
    case "expert":
      return "[Technical Deep-Dive] ";
    case "student":
      return "[Study Guide] ";
    case "professional":
      return "[Executive Brief] ";
    case "short":
      return "[TL;DR] ";
  }
}

export function buildDemoAnalysis(
  file: UploadedFilePayload,
  _mode: AnalysisMode,
  personality: PersonalityMode
): AnalysisResult {
  const prefix = tonePrefix(personality);
  const preset = file.presetId;

  if (preset === "handwriting-math") {
    return {
      detectedCategory: "Handwritten Calculus & Kinematics Notes",
      recommendedTab: "handwriting",
      summary:
        personality === "short"
          ? `${prefix}Calculus notes covering the Power Rule, velocity/acceleration derivatives, and Chain Rule. 1 calculation error found in f'(x) = 2x^2 + 8x (should be 3x^2 + 8x). Homework Ch 3 #1-15 odd due Oct 18.`
          : `${prefix}These handwritten lecture notes cover foundational differential calculus: the Power Rule, kinematic relationships between position, velocity, and acceleration, and the Chain Rule. Notably, there is an arithmetic mistake in the Power Rule example where the derivative of x^3 was written as 2x^2 instead of 3x^2.`,
      keyPoints: [
        "Power Rule: d/dx(x^n) = n·x^(n-1)",
        "Mistake detected: d/dx(x^3) is 3x^2, not 2x^2",
        "Kinematics: v(t) = ds/dt and a(t) = dv/dt; v(2) = 23 m/s is correct",
        "Homework due Friday, Oct 18: Chapter 3 #1–15 odd",
      ],
      extractedInfo: [
        { label: "Topic", value: "Derivatives & Kinematics (Lecture #4)", category: "entity" },
        { label: "Homework Deadline", value: "Friday, Oct 18", category: "date" },
        { label: "Assignment", value: "Chapter 3, #1–15 odd", category: "other" },
        { label: "Mistakes Found", value: "1 calculation error", category: "other" },
      ],
      handwriting: {
        editableText: `Calculus Lecture #4 - Derivatives & Kinematics

1. Power Rule: d/dx (x^n) = n * x^(n-1)
Example: f(x) = x^3 + 4x^2 - 7
f'(x) = 2x^2 + 8x  [ERROR: should be 3x^2 + 8x]

2. Velocity v(t) = ds/dt, Acceleration a(t) = dv/dt
If s(t) = 5t^2 + 3t, then v(2) = 10(2) + 3 = 23 m/s

Exam Tip: Always check chain rule on composite functions!
d/dx [sin(3x)] = 3 cos(3x)

Homework due: Friday Oct 18 - Ch 3 #1-15 odd`,
        equations: [
          { expression: "d/dx (x^n) = n · x^(n-1)", explanation: "Power rule for differentiating polynomial terms." },
          { expression: "f(x) = x^3 + 4x^2 - 7", explanation: "Sample polynomial function; constant -7 differentiates to 0." },
          { expression: "v(t) = ds/dt,  a(t) = dv/dt", explanation: "Velocity is the 1st derivative of position; acceleration is the 2nd." },
          { expression: "d/dx [sin(3x)] = 3 cos(3x)", explanation: "Chain rule multiplies outer derivative cos(3x) by inner derivative 3." },
        ],
        chapters: [
          {
            title: "Chapter 1: The Power Rule",
            content: "Bring the exponent down as a coefficient and reduce the exponent by 1. Constants differentiate to 0.",
          },
          {
            title: "Chapter 2: Kinematics Applications",
            content: "Differentiating position s(t) = 5t^2 + 3t gives velocity v(t) = 10t + 3. Evaluating at t = 2 yields 23 m/s.",
          },
          {
            title: "Chapter 3: Chain Rule & Exam Prep",
            content: "For composite functions f(g(x)), multiply f'(g(x)) by g'(x). Remember to complete Ch 3 #1–15 odd by Oct 18.",
          },
        ],
        calculationMistakes: [
          {
            line: "f'(x) = 2x^2 + 8x",
            issue: "For the term x^3, the exponent 3 was not brought down as the coefficient (2 was used instead of 3).",
            correction: "f'(x) = 3x^2 + 8x",
          },
        ],
      },
      visualLearning: {
        diagramExplanation: "Step-by-step breakdown of applying the Power Rule and Chain Rule to polynomial and trigonometric functions.",
        mathSteps: [
          { step: "1. Differentiate x^3", detail: "Apply n·x^(n-1) with n = 3 → 3x^2." },
          { step: "2. Differentiate 4x^2", detail: "Multiply 4 by exponent 2 and reduce power → 8x." },
          { step: "3. Differentiate -7", detail: "The derivative of any constant is 0." },
        ],
        flashcards: [
          { id: "fc-1", front: "What is the Power Rule for d/dx(x^n)?", back: "n · x^(n-1)" },
          { id: "fc-2", front: "How do you get velocity from position s(t)?", back: "Take the first derivative: v(t) = ds/dt" },
          { id: "fc-3", front: "What is d/dx[sin(3x)]?", back: "3 cos(3x) (by the Chain Rule)" },
        ],
        quiz: [
          {
            id: "q-1",
            question: "What is the correct derivative of f(x) = x^3 + 4x^2 - 7?",
            options: ["2x^2 + 8x", "3x^2 + 8x", "3x^2 + 4x - 7", "x^2 + 8x"],
            correctIndex: 1,
            explanation: "Using the power rule, d/dx(x^3) = 3x^2, d/dx(4x^2) = 8x, and d/dx(-7) = 0.",
          },
          {
            id: "q-2",
            question: "If s(t) = 5t^2 + 3t, what is the velocity at t = 2?",
            options: ["13 m/s", "20 m/s", "23 m/s", "26 m/s"],
            correctIndex: 2,
            explanation: "v(t) = 10t + 3, so v(2) = 10(2) + 3 = 23 m/s.",
          },
        ],
      },
      nextActions: [
        {
          id: "study-plan",
          title: "Generate a Study Plan",
          description: "Create a focused 5-day calculus review & homework schedule before Oct 18.",
          actionType: "study_plan",
        },
        {
          id: "practice-problems",
          title: "Generate Practice Problems",
          description: "Create 5 similar Power Rule & Chain Rule problems with worked solutions.",
          actionType: "practice_problems",
        },
      ],
    };
  }

  if (preset === "error-screenshot") {
    return {
      detectedCategory: "React / Next.js Runtime Error Screenshot",
      recommendedTab: "screenshot",
      summary:
        personality === "short"
          ? `${prefix}TypeError in UserList.tsx:14 — \`users\` is undefined when \`.map()\` runs because \`fetch('/api/users')\` returns \`{ data: [...] }\` instead of an array.`
          : `${prefix}Your Next.js Client Component \`UserList\` crashed at line 14 because it tried to call \`.map()\` on \`users\`, which is \`undefined\`. The call stack indicates the API returned an object wrapper \`{ data: [...] }\` rather than a raw array.`,
      keyPoints: [
        "Error: Cannot read properties of undefined (reading 'map')",
        "Location: src/components/UserList.tsx, line 14",
        "Root cause: API returns { data: [...] }, not a direct array",
        "Fix: Pass `res.data` or default `users = []` and use optional chaining `users?.map(...)`",
      ],
      extractedInfo: [
        { label: "File", value: "src/components/UserList.tsx:14", category: "entity" },
        { label: "Caller", value: "src/app/page.tsx:28", category: "entity" },
        { label: "Error Type", value: "Runtime TypeError", category: "other" },
        { label: "Framework", value: "React 19.3.0 / Next.js 16.4.6", category: "other" },
      ],
      screenshot: {
        errorDiagnosis: {
          error: "TypeError: Cannot read properties of undefined (reading 'map')",
          rootCause:
            "The `users` prop passed into `UserList` is `undefined` during render because `fetch('/api/users')` returns `{ data: [...] }` instead of an array.",
          fixSteps: [
            "Unwrap `data` where you fetch: `const { data: users = [] } = await res.json();`",
            "Add a safe default prop in `UserList({ users = [] })` so it never crashes if data is loading.",
            "Guard the render with `Array.isArray(users)` or an empty-state fallback.",
          ],
        },
        codeTranscription: {
          language: "tsx",
          code: `export function UserList({ users = [] }: { users?: { id: string; name: string }[] }) {\n  return (\n    <ul>\n      {users.map((u) => (\n        <li key={u.id}>{u.name}</li>\n      ))}\n    </ul>\n  );\n}`,
          explanation:
            "Adding a default empty array `users = []` and TypeScript prop types prevents `.map()` from throwing when `users` is undefined.",
        },
        uiBreakdown: [
          { element: "Top Editor Pane", purpose: "Displays UserList.tsx lines 12–16 where `.map()` is invoked." },
          { element: "Red Error Overlay", purpose: "Shows the React runtime TypeError, stack trace, and API payload hint." },
        ],
        websiteOrMessageSummary:
          "IDE & browser runtime error overlay showing a classic undefined-array `.map()` crash in React.",
      },
      nextActions: [
        {
          id: "fix-checklist",
          title: "Generate Fix & Test Checklist",
          description: "Get exact patch steps and a unit test to prevent this regression.",
          actionType: "fix_checklist",
        },
        {
          id: "explain-types",
          title: "Add TypeScript Safety Guard",
          description: "Generate a runtime Zod/TypeScript validator for /api/users.",
          actionType: "code_hardening",
        },
      ],
    };
  }

  if (preset === "utility-invoice") {
    return {
      detectedCategory: "Cloud & Fiber Utility Invoice",
      recommendedTab: "everyday",
      summary:
        personality === "short"
          ? `${prefix}Northstar Cloud & Fiber invoice #INV-2026-8841 for $248.40, due Dec 05, 2026. $15 late fee after Dec 10.`
          : `${prefix}This is a monthly invoice from Northstar Cloud & Fiber for November 2026 totaling $248.40 (including 8% tax). Payment is due by December 5, 2026 via ACH, and a $15.00 late fee applies after December 10.`,
      keyPoints: [
        "Total Amount Due: $248.40 (Subtotal $230.00 + Tax $18.40)",
        "Due Date: Dec 05, 2026 (Late fee $15 after Dec 10)",
        "Invoice #INV-2026-8841 | Account: ACCT-99204",
        "ACH Routing: 021000021 | Account: 883920114",
      ],
      extractedInfo: [
        { label: "Vendor", value: "Northstar Cloud & Fiber", category: "entity" },
        { label: "Total Due", value: "$248.40", category: "amount" },
        { label: "Due Date", value: "Dec 05, 2026", category: "date" },
        { label: "Invoice Number", value: "INV-2026-8841", category: "other" },
        { label: "Account ID", value: "ACCT-99204", category: "other" },
      ],
      everyday: {
        documentType: "Bill / Invoice",
        lineItems: [
          { item: "Business Fiber 1Gbps Plan", amount: "$129.00" },
          { item: "Managed Cloud Backup (2 TB)", amount: "$65.00" },
          { item: "Static IPv4 Block (4 Addresses)", amount: "$36.00" },
          { item: "State & Local Tax (8%)", amount: "$18.40" },
        ],
        importantDates: [
          { label: "Payment Due Date", date: "Dec 05, 2026", urgency: "high" },
          { label: "Late Fee ($15.00) Trigger", date: "Dec 10, 2026", urgency: "high" },
          { label: "Billing Period", date: "Nov 01 – Nov 30, 2026", urgency: "normal" },
        ],
        plainLanguageFormGuide: [
          {
            field: "ACH Routing / Account",
            meaning: "Bank transfer numbers to pay directly from a checking account without card fees.",
            example: "Routing 021000021 • Memo: INV-2026-8841",
          },
        ],
        warrantyOrPurchase: null,
      },
      nextActions: [
        {
          id: "extract-payment",
          title: "Extract Payment Details",
          description: "Format a ready-to-paste bank transfer / accounting entry.",
          actionType: "payment_details",
        },
        {
          id: "calendar-reminder",
          title: "Create Payment Schedule",
          description: "Generate calendar reminder milestones before the Dec 5 due date.",
          actionType: "schedule",
        },
      ],
    };
  }

  if (preset === "science-diagram") {
    return {
      detectedCategory: "Scientific Illustration — Cellular Respiration",
      recommendedTab: "visual_learning",
      summary:
        personality === "short"
          ? `${prefix}3-stage cellular respiration diagram: Glycolysis (2 ATP) → Krebs Cycle (2 ATP) → Electron Transport Chain (~32 ATP). Total ~36 ATP per glucose.`
          : `${prefix}This diagram illustrates how cells convert glucose and oxygen into usable energy (ATP) across three sequential stages: Glycolysis in the cytosol, the Krebs Cycle in the mitochondrial matrix, and the Electron Transport Chain across the inner mitochondrial membrane.`,
      keyPoints: [
        "Stage 1 (Glycolysis): Occurs in cytosol, nets 2 ATP",
        "Stage 2 (Krebs Cycle): Occurs in mitochondrial matrix, nets 2 ATP",
        "Stage 3 (Electron Transport Chain): Inner membrane, produces ~32 ATP",
        "Oxygen is the final electron acceptor, forming H2O",
      ],
      extractedInfo: [
        { label: "Process", value: "Cellular Respiration", category: "entity" },
        { label: "Total Yield", value: "~36 ATP per glucose", category: "other" },
        { label: "Key Electron Carriers", value: "NADH, FADH2", category: "other" },
      ],
      visualLearning: {
        diagramExplanation:
          "Glucose enters Glycolysis in the cytosol (2 ATP), its products enter the Krebs Cycle inside the mitochondrial matrix (2 ATP + NADH/FADH2), and those electron carriers power the Electron Transport Chain on the inner membrane (~32 ATP) using O2 as the final electron acceptor.",
        mathSteps: [
          { step: "Stage 1: Glycolysis", detail: "+2 net ATP" },
          { step: "Stage 2: Krebs Cycle", detail: "+2 ATP" },
          { step: "Stage 3: Electron Transport Chain", detail: "+32 ATP (approx.) → Total ~36 ATP" },
        ],
        flashcards: [
          { id: "bio-1", front: "Where does Glycolysis take place?", back: "In the cytosol (outside the mitochondria)." },
          { id: "bio-2", front: "Which stage produces the most ATP?", back: "The Electron Transport Chain (~32 ATP)." },
          { id: "bio-3", front: "What is the role of Oxygen (O2)?", back: "It acts as the final electron acceptor, forming water (H2O)." },
        ],
        quiz: [
          {
            id: "bq-1",
            question: "Approximately how much ATP is generated by the Electron Transport Chain?",
            options: ["2 ATP", "6 ATP", "32 ATP", "100 ATP"],
            correctIndex: 2,
            explanation: "The Electron Transport Chain generates the vast majority (~32 ATP) via chemiosmosis.",
          },
          {
            id: "bq-2",
            question: "What molecules carry high-energy electrons from Stages 1 & 2 to Stage 3?",
            options: ["CO2 and H2O", "NADH and FADH2", "ATP Synthase", "Glucose"],
            correctIndex: 1,
            explanation: "NADH and FADH2 transport electrons to the Electron Transport Chain.",
          },
        ],
      },
      nextActions: [
        {
          id: "study-plan",
          title: "Generate a Study Plan",
          description: "Build a 3-day biology mastery plan with active recall checkpoints.",
          actionType: "study_plan",
        },
        {
          id: "teach-me",
          title: "Create Analogy & Memory Hooks",
          description: "Turn the 3 stages into a memorable story for exam recall.",
          actionType: "memory_hooks",
        },
      ],
    };
  }

  // Resume or generic uploaded file
  const isResume = preset === "resume-doc" || file.name.toLowerCase().includes("resume") || (file.textContent ?? "").toLowerCase().includes("experience");
  if (isResume) {
    return {
      detectedCategory: "Professional Resume / CV",
      recommendedTab: "overview",
      summary:
        personality === "short"
          ? `${prefix}Alex Rivera — Staff/Senior Full-Stack Engineer (6+ yrs: TypeScript, Next.js, Node.js, PostgreSQL). Cut API p95 latency 480ms→95ms.`
          : `${prefix}Alex Rivera is a Senior/Staff Full-Stack Engineer with 6+ years of experience specializing in TypeScript, Next.js, Node.js, and PostgreSQL. Key highlights include migrating a billing monolith to event-driven microservices (4M+ daily events) and reducing p95 API latency by 80%.`,
      keyPoints: [
        "6+ years full-stack experience (TypeScript, Next.js, Node.js, PostgreSQL)",
        "PulseCloud: Reduced p95 latency from 480ms to 95ms",
        "FinLedger: Built idempotent Stripe + ACH reconciliation & SOC2 RBAC",
        "Mentored 5 engineers & rolled out Playwright E2E CI",
      ],
      extractedInfo: [
        { label: "Candidate", value: "Alex Rivera", category: "entity" },
        { label: "Location", value: "Austin, TX", category: "other" },
        { label: "Email", value: "alex.rivera@example.com", category: "contact" },
        { label: "Core Stack", value: "TypeScript, Next.js, PostgreSQL, Redis", category: "other" },
      ],
      nextActions: [
        {
          id: "interview-questions",
          title: "Generate Interview Questions",
          description: "Create tailored technical & system-design questions based on Alex's resume.",
          actionType: "interview_questions",
        },
        {
          id: "task-breakdown",
          title: "Candidate Evaluation Rubric",
          description: "Generate a structured hiring scorecard for this profile.",
          actionType: "task_breakdown",
        },
      ],
    };
  }

  // Generic fallback for any custom uploaded file in Demo Mode
  const snippet = (file.textContent || "").slice(0, 240).trim();
  return {
    detectedCategory: file.mimeType.startsWith("image/") ? "Uploaded Image / Visual" : "Uploaded Document",
    recommendedTab: "overview",
    summary:
      `${prefix}Analyzed "${file.name}" (${(file.size / 1024).toFixed(1)} KB). ` +
      (snippet
        ? `Previewed text content: "${snippet}${snippet.length >= 240 ? "..." : ""}". Add a Gemini or OpenAI API key in Settings for live deep-vision & document extraction.`
        : "Image loaded and ready. Add a Gemini or OpenAI API key in Settings (top right) for live AI vision analysis of your own images."),
    keyPoints: [
      `File: ${file.name} (${file.mimeType || "unknown type"})`,
      `Active Personality: ${personality.toUpperCase()}`,
      "Connect Gemini or OpenAI API key in Settings for live OCR, diagram, & receipt parsing",
    ],
    extractedInfo: [
      { label: "File Name", value: file.name, category: "entity" },
      { label: "MIME Type", value: file.mimeType || "application/octet-stream", category: "other" },
      { label: "File Size", value: `${(file.size / 1024).toFixed(1)} KB`, category: "other" },
    ],
    nextActions: [
      {
        id: "task-breakdown",
        title: "Generate Task Breakdown",
        description: "Turn this document into an actionable checklist.",
        actionType: "task_breakdown",
      },
      {
        id: "study-plan",
        title: "Create Summary & Study Notes",
        description: "Convert key points into structured notes.",
        actionType: "study_plan",
      },
    ],
  };
}

export function buildDemoNextAction(
  actionId: string,
  actionTitle: string,
  file: UploadedFilePayload,
  personality: PersonalityMode
): NextActionOutput {
  if (actionId === "interview-questions") {
    return {
      actionId,
      title: actionTitle,
      summary: `Tailored interview questions for ${file.name} (${personality} mode):`,
      items: [
        {
          title: "1. Architecture: Monolith → Event-Driven Microservices",
          detail: "How did you handle message ordering, dead-letter queues, and idempotency at 4M+ daily events?",
          meta: "System Design",
        },
        {
          title: "2. Performance: 480ms → 95ms p95 Latency",
          detail: "Walk through how you profiled the bottleneck and decided between query indexing vs. Redis edge caching.",
          meta: "Backend",
        },
        {
          title: "3. Reliability: Stripe + ACH Webhooks",
          detail: "How did your idempotent webhook handler prevent double-crediting during network retries?",
          meta: "Payments",
        },
        {
          title: "4. Leadership: Mentoring & Playwright CI",
          detail: "How did you keep Playwright E2E suites fast and non-flaky in CI for 5 engineers?",
          meta: "Leadership",
        },
      ],
    };
  }

  if (actionId === "extract-payment") {
    return {
      actionId,
      title: actionTitle,
      summary: "Ready-to-use payment & bookkeeping details:",
      items: [
        { title: "Payee", detail: "Northstar Cloud & Fiber", meta: "Vendor" },
        { title: "Amount Due", detail: "$248.40 USD", meta: "Due Dec 05, 2026" },
        { title: "ACH Routing / Account", detail: "021000021 / 883920114", meta: "Bank Transfer" },
        { title: "Required Memo", detail: "INV-2026-8841 (Acct: ACCT-99204)", meta: "Reference" },
      ],
    };
  }

  if (actionId === "fix-checklist") {
    return {
      actionId,
      title: actionTitle,
      summary: "Step-by-step fix checklist for UserList.tsx:",
      items: [
        { title: "Step 1: Unwrap API response", detail: "Change `setUsers(await res.json())` to `const json = await res.json(); setUsers(json.data ?? []);`", meta: "page.tsx" },
        { title: "Step 2: Add default prop", detail: "Update `UserList({ users = [] })` so `.map()` never runs on `undefined`.", meta: "UserList.tsx" },
        { title: "Step 3: Add empty state", detail: "Render `<p>No users found</p>` when `users.length === 0`.", meta: "UX" },
      ],
    };
  }

  return {
    actionId,
    title: actionTitle,
    summary: `Generated ${actionTitle} for ${file.name} in ${personality} mode:`,
    items: [
      { title: "Day 1: Core Concepts & Review", detail: "Review the extracted summary, key equations/facts, and fix any flagged errors.", meta: "30 mins" },
      { title: "Day 2: Active Recall", detail: "Complete the generated flashcards and 2-question self-check quiz.", meta: "25 mins" },
      { title: "Day 3: Applied Practice", detail: "Work through practice exercises or execute the action items before the deadline.", meta: "45 mins" },
    ],
  };
}

export function buildDemoChatReply(
  question: string,
  file: UploadedFilePayload,
  analysis: AnalysisResult,
  personality: PersonalityMode
): string {
  const q = question.toLowerCase();
  const prefix = tonePrefix(personality);

  if (q.includes("mistake") || q.includes("error") || q.includes("wrong")) {
    if (analysis.handwriting?.calculationMistakes?.length) {
      const m = analysis.handwriting.calculationMistakes[0];
      return `${prefix}Yes! On the line "${m.line}", ${m.issue} The corrected expression is: ${m.correction}.`;
    }
    if (analysis.screenshot?.errorDiagnosis) {
      return `${prefix}The error is "${analysis.screenshot.errorDiagnosis.error}". ${analysis.screenshot.errorDiagnosis.rootCause}`;
    }
  }

  if (q.includes("due") || q.includes("date") || q.includes("deadline") || q.includes("amount") || q.includes("pay")) {
    const info = analysis.extractedInfo.map((i) => `${i.label}: ${i.value}`).join(" • ");
    return `${prefix}Here are the key extracted details from ${file.name}: ${info}.`;
  }

  return `${prefix}Based on "${file.name}" (${analysis.detectedCategory}): ${analysis.summary}\n\nKey points:\n• ${analysis.keyPoints.join("\n• ")}`;
}

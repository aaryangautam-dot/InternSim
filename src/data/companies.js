export const COMPANIES = [
  {
    id: 'novatech',
    tier: 1,
    name: 'NovaTech',
    brandName: 'NovaTech AI',
    stage: 'Seed Stage (YC W24)',
    headcount: '14 employees',
    valuation: '$12M Valuation',
    stipend: '$1,500 / month · 0.1% Early Equity',
    accentColor: '#FF6B2C',
    gradient: 'linear-gradient(135deg, #FF6B2C 0%, #FF9A5C 100%)',
    culture: 'Scrappy, high-velocity, chaos. Legacy code with minimal docs. You wear multiple hats and ship directly to users.',
    managerQuote: "We move fast. If you see something broken, don't wait for permission—fix it, test it, and ship the PR.",
    taskIdsByRole: {
      frontend: ['task-1', 'task-2'],
      backend: ['be-task-1', 'be-task-2'],
      aiml: ['ai-task-1', 'ai-task-2'],
    },
    promotionCriteria: {
      minTasksCompleted: 2,
      minAverageScore: 7.0,
      nextCompanyId: 'finpulse',
    },
    offerDetails: {
      roleTitle: 'Software Engineering Intern',
      department: 'Core Product & Growth',
      location: 'San Francisco, CA (or Remote)',
      perks: ['Equity Grant Options', 'Direct Mentorship from Founders', 'High Autonomy'],
      congratulationsNote: "You've officially joined the founding engineering team at NovaTech! Roll up your sleeves—you'll be working directly on customer-facing features.",
    },
  },
  {
    id: 'finpulse',
    tier: 2,
    name: 'FinPulse',
    brandName: 'FinPulse Technologies',
    stage: 'Series B Scale-Up',
    headcount: '380 employees',
    valuation: '$450M Valuation',
    stipend: '$6,800 / month · Comprehensive Health · Equipment Stipend',
    accentColor: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
    culture: 'High growth with rigorous engineering standards. Modular services, strict QA gates, design systems, and automated test pipelines.',
    managerQuote: "At our scale, sloppy code creates security vulnerabilities and payment drops. Every PR needs thorough unit tests.",
    taskIdsByRole: {
      frontend: ['task-3', 'task-4'],
      backend: ['be-task-3', 'be-task-4'],
      aiml: ['ai-task-3', 'ai-task-4'],
    },
    promotionCriteria: {
      minTasksCompleted: 2,
      minAverageScore: 7.5,
      nextCompanyId: 'apex',
    },
    offerDetails: {
      roleTitle: 'Mid-Level Engineering Intern',
      department: 'Platform Architecture & Services',
      location: 'New York, NY · Hybrid',
      perks: ['401(k) Match', 'Ergonomic Home Setup ($1,000)', 'Annual Learning Budget ($2,500)'],
      congratulationsNote: "Congratulations! Based on your demonstrated execution at NovaTech, FinPulse is thrilled to extend you this offer for our high-growth platform engineering team.",
    },
  },
  {
    id: 'apex',
    tier: 3,
    name: 'Apex Global',
    brandName: 'Apex Technologies (FAANG Tier)',
    stage: 'Big Tech Enterprise',
    headcount: '65,000+ engineers',
    valuation: '$1.4 Trillion Market Cap',
    stipend: '$11,500 / month · Luxury Corporate Housing · Relocation Bonus',
    accentColor: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    culture: 'Extreme scale and five-nines (99.999%) availability. Deep systems optimization, distributed pipelines, zero-allocation memory constraints, and formal RFC design reviews.',
    managerQuote: "When your code touches 500 million daily active users, a 10ms regression costs millions. We expect engineering excellence.",
    taskIdsByRole: {
      frontend: ['task-5'],
      backend: ['be-task-5'],
      aiml: ['ai-task-5'],
    },
    promotionCriteria: {
      minTasksCompleted: 1,
      minAverageScore: 8.0,
      nextCompanyId: null,
    },
    offerDetails: {
      roleTitle: 'Elite SWE Fellow (L3 Track)',
      department: 'Global Infrastructure & Distributed Systems',
      location: 'Mountain View, CA (Apex HQ)',
      perks: ['Corporate Housing', 'Gourmet Campus Dining', 'Full Return-Offer Fast Track'],
      congratulationsNote: "Welcome to Apex Global. You've earned one of the most competitive engineering seats in the tech industry. Your work will directly impact millions of users worldwide.",
    },
  },
];

export function getCompanyById(companyId) {
  return COMPANIES.find(c => c.id === companyId) || COMPANIES[0];
}

export function getCompanyForTask(taskId) {
  for (const company of COMPANIES) {
    for (const roleTasks of Object.values(company.taskIdsByRole)) {
      if (roleTasks.includes(taskId)) return company;
    }
  }
  return COMPANIES[0];
}

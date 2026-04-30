export type Mode = 
  | 'CAREER_GUIDANCE'
  | 'FINANCIAL_PLANNING'
  | 'LIFE_OUTCOME'
  | 'LOAN_ADVISORY'
  | 'LOAN_PREDICTOR'
  | 'SOP_RESUME'
  | 'TIMELINE'
  | 'CONSULTANT'
  | 'DECISION'
  | 'ACTION_PLAN'
  | 'WORST_CASE'
  | 'NEGOTIATOR'
  | 'CAREER_PATHWAY'
  | 'GENERAL';

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  icon: 'compare' | 'loan' | 'career' | 'outcome' | 'warning' | 'deal';
}

export interface DashboardState {
  riskScore: 'Safe' | 'Moderate' | 'Risky';
  aiInsight: string;
  roi: { cost: string; salary: string; payback: string };
  admissionChance: number;
  loanEligibility: number;
  incomeEMI: { income: number; emi: number };
  worstCaseImpact?: string;
}

export interface UserProfile {
  name: string;
  gpa: number;
  field: string;
  goal: string;
  budget: number;
  preferredCountries: string[];
  educationLevel: 'Undergraduate' | 'Postgraduate' | 'PHD';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  mode?: Mode;
  metadata?: any;
}

export interface SimulationResult {
  salaryGrowth: number[];
  riskScore: 'Safe' | 'Moderate' | 'Risky';
  paybackPeriod: number;
}

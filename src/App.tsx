import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Loader2, 
  RefreshCcw,
  MessageSquare, 
  HelpCircle, 
  Briefcase,
  Target,
  Zap,
  Layers,
  Search,
  X,
  History,
  UserCircle,
  TrendingUp,
  Scale,
  Coins,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, ChatMessage, Mode, ActivityItem, DashboardState } from './types';
import { chatWithAI } from './services/gemini';
import { cn } from './lib/utils';
import ProfileBuilder from './components/ProfileBuilder';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { signInWithGoogle, loginWithEmail, registerWithEmail, logout, auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";

// --- Global Constants & Mock Data ---
const INITIAL_PROFILE: UserProfile = {
  name: "",
  gpa: 0,
  field: "Computer Science",
  goal: "MS in Computer Science",
  budget: 50000,
  preferredCountries: ["USA", "Germany"],
  educationLevel: "Postgraduate"
};

const INITIAL_DASHBOARD: DashboardState = {
  riskScore: 'Safe',
  aiInsight: "Complete your profile to get personalized AI insights for your education journey.",
  roi: { cost: "$22,500", salary: "$72,000", payback: "1.1 Years" },
  admissionChance: 85,
  loanEligibility: 92,
  incomeEMI: { income: 5500, emi: 450 },
  worstCaseImpact: "Low impact. In a job market downturn, your German degree allows for a 18-month stay-back with zero tuition debt."
};

const INITIAL_HISTORY: ActivityItem[] = [
  { id: '1', action: "Simulated USA MS Outcome", timestamp: "10 mins ago", icon: 'outcome' },
  { id: '2', action: "Compared Germany vs USA ROI", timestamp: "25 mins ago", icon: 'compare' },
  { id: '3', action: "Checked Loan Odds", timestamp: "1 hour ago", icon: 'loan' },
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [dashboard, setDashboard] = useState<DashboardState>(INITIAL_DASHBOARD);
  const [history, setHistory] = useState<ActivityItem[]>(INITIAL_HISTORY);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>('GENERAL');
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile-builder'>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.displayName) {
        setProfile(prev => ({ ...prev, name: currentUser.displayName! }));
      } else if (currentUser?.email) {
        setProfile(prev => ({ ...prev, name: currentUser.email!.split('@')[0] }));
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) setIsChatOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || loading) return;
    if (!isChatOpen) setIsChatOpen(true);

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const response = await chatWithAI([...messages, userMessage], profile);
    
    let detectedMode: Mode = 'GENERAL';
    const lowerRes = response.toLowerCase();
    const lowerText = textToSend.toLowerCase();

    if (lowerText.includes("worst") || lowerText.includes("fail") || lowerText.includes("risk")) detectedMode = 'WORST_CASE';
    else if (lowerText.includes("cheaper") || lowerText.includes("negotiate") || lowerRes.includes("negotiator")) detectedMode = 'NEGOTIATOR';
    else if (lowerRes.includes("career") || lowerRes.includes("roadmap")) detectedMode = 'CAREER_PATHWAY';
    else if (lowerRes.includes("loan") || lowerRes.includes("approval")) detectedMode = 'LOAN_ADVISORY';
    else if (lowerRes.includes("roi") || lowerRes.includes("salary")) detectedMode = 'FINANCIAL_PLANNING';
    else if (lowerRes.includes("outcome") || lowerRes.includes("future")) detectedMode = 'LIFE_OUTCOME';
    
    const iconMap: Record<string, any> = {
      WORST_CASE: 'warning', NEGOTIATOR: 'deal', CAREER_PATHWAY: 'career',
      LOAN_ADVISORY: 'loan', FINANCIAL_PLANNING: 'compare', LIFE_OUTCOME: 'outcome'
    };

    const newActivity: ActivityItem = {
      id: Math.random().toString(),
      action: textToSend.substring(0, 35) + (textToSend.length > 35 ? "..." : ""),
      timestamp: "Just now",
      icon: iconMap[detectedMode] || 'career'
    };
    setHistory(prev => [newActivity, ...prev]);
    setActiveMode(detectedMode);
    setMessages(prev => [...prev, { role: 'model', content: response, mode: detectedMode }]);
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 animate-pulse">
            <GraduationCap size={32} className="text-white" />
          </div>
          <p className="text-indigo-300/60 text-sm font-medium tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      {currentView === 'profile-builder' && (
        <div className="relative">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCurrentView('dashboard')}
            className="fixed top-8 left-8 z-50 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-all shadow-lg border border-slate-200"
          >
            <ArrowLeft size={24} className="text-slate-900" />
          </motion.button>
          <ProfileBuilder onProfileComplete={(profileData) => {
            setProfile({
              name: user?.displayName || user?.email?.split('@')[0] || 'Student',
              gpa: parseFloat(profileData.gpa) || 0,
              field: profileData.field,
              goal: `${profileData.degree} in ${profileData.field}`,
              budget: profileData.budget / 75,
              preferredCountries: profileData.countries,
              educationLevel: profileData.degree
            });
            setDashboard(prev => ({
              ...prev,
              aiInsight: `Based on your ${profileData.gpa} GPA in ${profileData.field}, your top countries ${profileData.countries.slice(0,2).join(' & ')} offer strong ROI. Your ${profileData.riskTolerance} risk profile is factored in.`
            }));
            setCurrentView('dashboard');
          }} />
        </div>
      )}

      {currentView === 'dashboard' && (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
          <nav className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-8 shrink-0 z-50">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
              <GraduationCap size={24} />
            </div>
            <div className="flex flex-col gap-6 mt-4">
              <NavIcon icon={<Layers size={22} />} active />
              <NavIcon icon={<TrendingUp size={22} />} />
              <NavIcon icon={<ShieldCheck size={22} />} />
              <NavIcon icon={<History size={22} />} />
            </div>
            <div className="mt-auto px-4">
              <button 
                onClick={() => setCurrentView('profile-builder')}
                className="w-10 h-10 rounded-full border-2 border-indigo-500/30 overflow-hidden bg-slate-800 flex items-center justify-center hover:border-indigo-500 hover:bg-indigo-600/20 transition-all group"
              >
                <UserCircle size={24} className="text-white/40 group-hover:text-white transition-colors" />
              </button>
            </div>
          </nav>

          <div className="flex-1 flex flex-col relative overflow-hidden">
            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-5">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">FundMyDegree Dashboard</h2>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Advanced Life Decision System</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">AI Live Sync</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input placeholder="Search roadmaps..." className="bg-slate-100 border-none rounded-full py-2.5 pl-12 pr-4 text-xs w-64 focus:ring-2 focus:ring-indigo-600/20 transition-all" />
                </div>
                <button 
                  onClick={() => handleSend("Give me a complete optimized path for my profile including best universities, ROI, and action plan.")}
                  className="bg-slate-900 text-white pl-4 pr-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                  <Zap size={14} className="text-indigo-400" /> Optimize My Path
                </button>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  Logout
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-50 p-10 pb-40">
              <div className="max-w-7xl mx-auto space-y-12">
                
                <motion.section 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative p-12 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-600/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-900" />
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
                    <GraduationCap size={400} />
                  </div>
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-8">
                      <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 rounded-full text-white/90 border border-white/20 backdrop-blur-xl">
                        <Target size={14} className="text-white" />
                        <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Goal: {profile.goal}</span>
                      </div>
                      <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic">
                          Hi, {(profile.name || 'Student').split(' ')[0]}.
                        </h1>
                        <p className="text-xl text-indigo-100/70 font-medium mt-4 max-w-lg leading-relaxed">
                          {profile.gpa > 0 
                            ? `Your GPA ${profile.gpa} opens doors to 14 top-tier programs. Ready for your 10-year simulation?`
                            : `Welcome! Complete your profile to unlock your personalized AI plan.`
                          }
                        </p>
                      </div>
                      <div className="p-6 bg-white/10 border border-white/10 rounded-3xl backdrop-blur-2xl">
                        <div className="flex gap-4 items-start">
                          <div className="p-3 bg-white/10 rounded-2xl text-indigo-200">
                            <Sparkles size={22} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Active AI Insight</p>
                            <p className="text-sm font-medium text-white italic leading-relaxed">"{dashboard.aiInsight}"</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-2 gap-5">
                      <RiskGauge score={dashboard.riskScore} />
                      <StatCard label="Salary Cap" value="$180k" detail="Post-5 Years" />
                      <StatCard label="Loan Odds" value={`${dashboard.loanEligibility}%`} detail="Eligible Now" />
                      <StatCard label="Admission" value={`${dashboard.admissionChance}%`} detail="Est. Probability" />
                    </div>
                  </div>
                </motion.section>

                <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  <QuickAction icon={<Scale size={20} />} label="Worst Case" onClick={() => handleSend("Simulate the worst-case scenario for my plan.")} />
                  <QuickAction icon={<Coins size={20} />} label="Negotiate Cost" onClick={() => handleSend("Can you optimize my costs or suggest cheaper alternatives?")} />
                  <QuickAction icon={<TrendingUp size={20} />} label="Life Outcome" onClick={() => handleSend("Show me my 10-year life outcome projection.")} />
                  <QuickAction icon={<Briefcase size={20} />} label="Career Roadmap" onClick={() => handleSend("What does my career roadmap look like after this degree?")} />
                  <QuickAction icon={<Zap size={20} />} label="Timeline Sync" onClick={() => handleSend("Generate a smart timeline for my prep.")} className="hidden lg:flex" />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <VisualInsightCard 
                        title="Financial Matrix" 
                        icon={<Wallet size={20} className="text-emerald-500" />}
                        tags={['Personalized', 'Market Sync']}
                      >
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-5">
                            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Est. Debt</p>
                              <p className="text-2xl font-bold font-mono tracking-tighter">{dashboard.roi.cost}</p>
                            </div>
                            <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                              <p className="text-[10px] text-emerald-600 font-bold uppercase mb-2">Final ROI</p>
                              <p className="text-2xl font-bold font-mono tracking-tighter text-emerald-700">340%</p>
                            </div>
                          </div>
                          <div className="p-5 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Payback Period</span>
                            <span className="text-lg font-bold text-indigo-700">{dashboard.roi.payback}</span>
                          </div>
                        </div>
                      </VisualInsightCard>

                      <VisualInsightCard 
                        title="Loan Eligibility" 
                        icon={<ShieldCheck size={20} className="text-indigo-600" />}
                        tags={['Low EMI', 'Pre-qualified']}
                      >
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                              <circle cx="64" cy="64" r="56" stroke="#4f46e5" strokeWidth="12" strokeDasharray={`${dashboard.loanEligibility * 3.51} 351`} strokeLinecap="round" fill="transparent" className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-2xl font-bold font-mono">{dashboard.loanEligibility}%</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-6 tracking-widest">Confidence Score</p>
                        </div>
                      </VisualInsightCard>
                    </div>

                    <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-xl shadow-slate-200/40">
                      <div className="flex justify-between items-center mb-10">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-800">Income vs Growth Simulation</h3>
                          <p className="text-xs text-slate-400 font-medium italic">Predictive data for {profile.field || 'Computer Science'} graduates</p>
                        </div>
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-black transition-all">
                          <RefreshCcw size={18} />
                        </button>
                      </div>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsAreaChart data={[
                            { year: '1', salary: 60000 }, { year: '2', salary: 68000 }, { year: '3', salary: 82000 },
                            { year: '4', salary: 105000 }, { year: '5', salary: 130000 }, { year: '6', salary: 155000 },
                            { year: '7', salary: 185000 }, { year: '8', salary: 220000 }, { year: '9', salary: 265000 }, { year: '10', salary: 310000 },
                          ]}>
                            <defs>
                              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(v) => `$${v/1000}k`} />
                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }} />
                            <Area type="monotone" dataKey="salary" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorPrimary)" />
                          </RechartsAreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-10">
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-900/20 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Decision Journey</h3>
                        <div className="p-2 bg-white/5 rounded-xl text-white/40">
                          <History size={16} />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-10 relative">
                        <div className="absolute left-[15px] top-4 bottom-10 w-px bg-white/10" />
                        {history.map((item, idx) => (
                          <div key={item.id} className="relative flex gap-8 group cursor-default">
                            <div className={cn(
                              "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-slate-900 transition-all",
                              idx === 0 ? "bg-indigo-500 scale-125 shadow-xl shadow-indigo-500/40" : "bg-slate-800"
                            )}>
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                            <div className="space-y-1.5">
                              <p className={cn("text-[13px] font-bold leading-tight", idx === 0 ? "text-white" : "text-white/50")}>{item.action}</p>
                              <p className="text-[9px] font-bold uppercase text-white/20 tracking-widest">{item.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 p-6 bg-indigo-600/10 rounded-[32px] border border-white/10 group cursor-pointer hover:bg-indigo-600/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Next Milestone</p>
                          <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl ring-8 ring-white/5 group-hover:scale-105 transition-transform">2</div>
                          <div>
                            <p className="text-sm font-bold text-white">Register for IELTS</p>
                            <p className="text-[10px] text-white/40 font-medium mt-1">Deadline: Nov 15, 2026</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </main>
          </div>

          <AnimatePresence>
            {!isChatOpen ? (
              <motion.button 
                initial={{ scale: 0, boxShadow: "none" }}
                animate={{ scale: 1, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.4)" }}
                exit={{ scale: 0 }}
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-12 right-12 w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
              >
                <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-20 pointer-events-none group-hover:animate-none" />
                <MessageSquare size={32} />
              </motion.button>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsChatOpen(false)}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99]"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 100, scale: 0.8 }}
                  className="fixed bottom-8 right-8 w-[480px] max-h-[calc(100vh-80px)] bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden z-[100]"
                >
                  <div className="sticky top-0 p-8 bg-slate-900 text-white flex items-center justify-between z-10 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white tracking-tight">AI Engine Consultant</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Personalized Insights Live</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsChatOpen(false)}
                      className="w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center transition-all text-white shadow-lg active:scale-90"
                    >
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-slate-50/30">
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6">
                          <HelpCircle size={32} className="text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800">Ask your AI Advisor</h4>
                        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                          Simulate ROI, cross-verify universities, check loan chances, or detect worst-case risks for your profile.
                        </p>
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div key={idx} className={cn(
                        "flex gap-4 max-w-[90%]",
                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}>
                        <div className={cn(
                          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm mt-1",
                          msg.role === 'user' ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-indigo-600"
                        )}>
                          {msg.role === 'user' ? <UserCircle size={16} /> : <Sparkles size={16} />}
                        </div>
                        <div className={cn(
                          "p-5 text-sm leading-relaxed rounded-3xl shadow-sm",
                          msg.role === 'user' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none text-slate-800"
                        )}>
                          <div className="markdown-body prose prose-sm max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <Loader2 size={14} className="animate-spin text-indigo-600" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse italic">Engine thinking...</p>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-8 border-t border-slate-100 bg-white">
                    <div className="relative">
                      <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question..."
                        className="w-full bg-slate-50 border-none rounded-[24px] py-5 pl-7 pr-16 text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                      />
                      <button 
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-[18px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-indigo-600/30"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

// ── AUTH PAGE ──────────────────────────────────────────────────────────────────
function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    if (tab === 'register' && !name) { setError('Please enter your name'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/user-not-found') setError('No account found. Please register.');
      else if (code === 'auth/wrong-password') setError('Wrong password. Try again.');
      else if (code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (code === 'auth/email-already-in-use') setError('Email already registered. Please login.');
      else if (code === 'auth/invalid-email') setError('Invalid email address.');
      else setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError('Google sign-in failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/40">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">FundMyDegree</h1>
          <p className="text-indigo-300/70 text-sm mt-2 font-medium">AI-Powered Student Financial Planning</p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/20 p-8 shadow-2xl">
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8 border border-white/10">
            <button onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'login' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-white/50 hover:text-white'}`}>
              Login
            </button>
            <button onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'register' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-white/50 hover:text-white'}`}>
              Register
            </button>
          </div>

          <div className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                placeholder="you@example.com"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                placeholder="Min. 6 characters"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            <button onClick={handleEmailAuth} disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={20} className="animate-spin" /> : (tab === 'login' ? 'Login to Dashboard' : 'Create Account')}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button onClick={handleGoogle} disabled={loading}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        <p className="text-center text-white/20 text-xs mt-6 font-medium">TenzorX 2026 · Poonawalla Fincorp Hackathon</p>
      </div>
    </div>
  );
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────────
function NavIcon({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
      active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-white/30 hover:text-white hover:bg-white/5")}>
      {icon}
    </button>
  );
}

function StatCard({ label, value, detail }: { label: string, value: string, detail: string }) {
  return (
    <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2 opacity-60">{label}</p>
      <p className="text-3xl font-black text-white tracking-tight leading-none mb-3 italic">{value}</p>
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-indigo-400" />
        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{detail}</p>
      </div>
    </div>
  );
}

function RiskGauge({ score }: { score: 'Safe' | 'Moderate' | 'Risky' }) {
  const configs = {
    Safe: { text: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400/20' },
    Moderate: { text: 'text-amber-400', bg: 'bg-amber-400/20', border: 'border-amber-400/20' },
    Risky: { text: 'text-rose-400', bg: 'bg-rose-400/20', border: 'border-rose-400/20' }
  };
  return (
    <div className={cn("p-6 bg-white/10 rounded-3xl border backdrop-blur-3xl flex flex-col justify-between", configs[score].border)}>
      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2 opacity-60">Success Risk</p>
      <div className={cn("px-5 py-2.5 rounded-2xl text-xl font-black italic tracking-tight w-fit", configs[score].bg, configs[score].text)}>
        {score}
      </div>
      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-4">Personalized Engine Match</p>
    </div>
  );
}

function VisualInsightCard({ title, icon, children, tags }: { title: string, icon: React.ReactNode, children: React.ReactNode, tags?: string[] }) {
  return (
    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col h-full group hover:border-indigo-600/30 transition-all hover:shadow-indigo-600/5">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[22px] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
            {icon}
          </div>
          <h3 className="font-bold text-lg text-slate-800 tracking-tight">{title}</h3>
        </div>
        <div className="flex gap-2">
          {tags?.map(tag => (
            <span key={tag} className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-100 transition-all group-hover:bg-indigo-50/50 group-hover:text-indigo-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1">{children}</div>
      <button className="mt-10 flex items-center justify-center gap-3 group text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest">
        Deep Performance View <ArrowUpRight size={16} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

function QuickAction({ icon, label, onClick, className }: { icon: React.ReactNode, label: string, onClick: () => void, className?: string }) {
  return (
    <button onClick={onClick}
      className={cn("flex flex-col items-center justify-center p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm transition-all gap-4 hover:border-indigo-600 hover:scale-[103%] group hover:shadow-2xl hover:shadow-indigo-600/10 active:scale-95", className)}>
      <div className="w-14 h-14 bg-slate-50 rounded-[22px] flex items-center justify-center transition-all group-hover:bg-indigo-600 text-slate-400 group-hover:text-white group-hover:rotate-12">
        {icon}
      </div>
      <span className="text-xs font-bold tracking-tight uppercase leading-none text-slate-600 group-hover:text-slate-900">{label}</span>
    </button>
  );
}

function ArrowUpRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}
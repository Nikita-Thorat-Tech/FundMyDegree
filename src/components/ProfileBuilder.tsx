import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, Target, Zap, Calendar, CheckCircle2,
  Lightbulb, BarChart3, Trophy, DollarSign,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileData {
  gpa: string; field: string; countries: string[]; degree: string;
  specialization: string; dreamUniversity: string; budget: number;
  coApplicantIncome: string; collateral: boolean;
  riskTolerance: 'Low' | 'Medium' | 'High';
  lifestyleGoal: 'save' | 'balanced' | 'spend';
  intake: string; examsGiven: string[];
}

interface ProfileBuilderProps {
  onProfileComplete?: (data: ProfileData) => void;
}

const COUNTRIES = ['USA', 'Canada', 'Germany', 'UK', 'India', 'Australia', 'Singapore', 'Netherlands', 'Ireland'];
const FIELDS = ['Computer Science', 'Finance', 'Engineering', 'Data Science', 'Business', 'Healthcare', 'Law'];
const DEGREES = ['MS', 'MBA', 'MTech', 'PhD', 'Diploma'];
const SPECIALIZATIONS = ['AI & ML', 'Data Science', 'Finance', 'Cloud Computing', 'Cybersecurity', 'Full Stack'];
const INTAKES = ['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026'];
const EXAMS = ['IELTS', 'TOEFL', 'GRE', 'GMAT'];

const getSmartHints = (data: ProfileData) => [
  { hint: '🎯 Students with GPA 8+ have 40% higher admission chances in top US universities', condition: parseFloat(data.gpa) >= 8 },
  { hint: '🇩🇪 Germany offers tuition-free MS programs — popular with high GPA students', condition: data.countries.includes('Germany') },
  { hint: '💰 Your budget supports MS in Germany or Netherlands perfectly', condition: data.budget >= 2500000 && data.countries.includes('Germany') },
  { hint: '📊 CS graduates earn 35% more in the first 5 years abroad', condition: data.field === 'Computer Science' },
  { hint: '✅ Having both IELTS + GRE increases Canada admission chances by 50%', condition: data.examsGiven.length >= 2 }
];

const calculateProfileStrength = (data: ProfileData) => {
  let strength = 0;
  const suggestions: string[] = [];
  if (data.gpa) { strength += 20; } else suggestions.push('Add your GPA for better predictions');
  if (data.field) { strength += 20; } else suggestions.push('Select your field of interest');
  if (data.countries.length > 0) { strength += 20; } else suggestions.push('Choose preferred countries');
  if (data.degree) { strength += 20; } else suggestions.push('Select your target degree');
  if (data.intake) { strength += 10; } else suggestions.push('Choose target intake');
  if (data.examsGiven.length > 0) { strength += 10; } else suggestions.push('Add exam scores to maximize chances');
  return { strength: Math.min(strength, 100), suggestions };
};

export default function ProfileBuilder({ onProfileComplete }: ProfileBuilderProps) {
  const [data, setData] = useState<ProfileData>({
    gpa: '', field: '', countries: [], degree: '', specialization: '',
    dreamUniversity: '', budget: 2500000, coApplicantIncome: '',
    collateral: false, riskTolerance: 'Medium', lifestyleGoal: 'balanced',
    intake: '', examsGiven: []
  });
  const [generating, setGenerating] = useState(false);

  const { strength, suggestions } = useMemo(() => calculateProfileStrength(data), [data]);
  const activeHints = useMemo(() => getSmartHints(data).filter(h => h.condition), [data]);
  const canGenerate = !!(data.gpa && data.field && data.countries.length > 0 && data.degree);

  const toggleCountry = (country: string) => setData(prev => ({
    ...prev,
    countries: prev.countries.includes(country)
      ? prev.countries.filter(c => c !== country)
      : [...prev.countries, country]
  }));

  const toggleExam = (exam: string) => setData(prev => ({
    ...prev,
    examsGiven: prev.examsGiven.includes(exam)
      ? prev.examsGiven.filter(e => e !== exam)
      : [...prev.examsGiven, exam]
  }));

  const handleGenerate = () => {
    if (!canGenerate || generating) return;
    setGenerating(true);
    setTimeout(() => {
      try {
        if (onProfileComplete) onProfileComplete(data);
      } catch (e) {
        console.error('Profile complete error:', e);
        setGenerating(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Smart Profile Builder</h1>
              <p className="text-xs text-slate-500 font-medium">AI-powered education planning</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Profile Strength</p>
              <p className="text-2xl font-bold text-indigo-600">{strength}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <CheckCircle2 size={24} className={cn(canGenerate ? 'text-emerald-500' : 'text-amber-500')} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-lg shadow-indigo-100/30 border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Basic Profile</h2>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">GPA / Percentage</label>
                <div className="relative">
                  <input type="number" value={data.gpa}
                    onChange={(e) => setData(prev => ({ ...prev, gpa: e.target.value }))}
                    placeholder="8.5" step="0.1" min="0" max="10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-lg font-semibold focus:ring-2 focus:ring-indigo-600/30 focus:border-transparent transition-all" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">/10</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Field of Interest</label>
                <select value={data.field} onChange={(e) => setData(prev => ({ ...prev, field: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-base font-semibold focus:ring-2 focus:ring-indigo-600/30 focus:border-transparent transition-all appearance-none cursor-pointer">
                  <option value="">Select field...</option>
                  {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">Preferred Countries</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COUNTRIES.map(country => (
                    <motion.button key={country} onClick={() => toggleCountry(country)}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={cn("p-4 rounded-2xl font-semibold text-sm transition-all border-2",
                        data.countries.includes(country)
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300")}>
                      {country}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] p-8 shadow-lg shadow-purple-100/30 border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Trophy size={20} className="text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Degree Preferences</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Target Degree</label>
                  <select value={data.degree} onChange={(e) => setData(prev => ({ ...prev, degree: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-base font-semibold focus:ring-2 focus:ring-purple-600/30 focus:border-transparent transition-all appearance-none">
                    <option value="">Select degree...</option>
                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Specialization</label>
                  <select value={data.specialization} onChange={(e) => setData(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-base font-semibold focus:ring-2 focus:ring-purple-600/30 focus:border-transparent transition-all appearance-none">
                    <option value="">Select specialization...</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Dream University (Optional)</label>
                <input type="text" value={data.dreamUniversity}
                  onChange={(e) => setData(prev => ({ ...prev, dreamUniversity: e.target.value }))}
                  placeholder="e.g., Stanford, MIT, Oxford..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-base font-semibold focus:ring-2 focus:ring-purple-600/30 focus:border-transparent transition-all" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-[32px] p-8 shadow-lg shadow-emerald-100/30 border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Financial Details</h2>
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-slate-700">Budget Range</label>
                  <span className="text-xl font-bold text-emerald-600">₹{(data.budget / 100000).toFixed(1)}L</span>
                </div>
                <input type="range" min="1000000" max="5000000" step="100000" value={data.budget}
                  onChange={(e) => setData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-emerald-100 rounded-full appearance-none cursor-pointer accent-emerald-600" />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>₹10L</span><span>₹50L</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Co-applicant Annual Income</label>
                <input type="number" value={data.coApplicantIncome}
                  onChange={(e) => setData(prev => ({ ...prev, coApplicantIncome: e.target.value }))}
                  placeholder="₹5,00,000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-base font-semibold focus:ring-2 focus:ring-emerald-600/30 focus:border-transparent transition-all" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-slate-700">Collateral Available?</p>
                  <p className="text-xs text-slate-500 mt-1">Property, gold, or other assets</p>
                </div>
                <button onClick={() => setData(prev => ({ ...prev, collateral: !prev.collateral }))}
                  className={cn("w-14 h-8 rounded-full flex items-center px-1 transition-all",
                    data.collateral ? "bg-emerald-600" : "bg-slate-300")}>
                  <motion.div initial={false} animate={{ x: data.collateral ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-[32px] p-8 shadow-lg shadow-amber-100/30 border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Zap size={20} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Risk & Lifestyle</h2>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-4">Risk Tolerance</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Low', 'Medium', 'High'].map(level => (
                    <motion.button key={level} onClick={() => setData(prev => ({ ...prev, riskTolerance: level as any }))}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                      className={cn("p-4 rounded-2xl font-semibold text-sm transition-all border-2",
                        data.riskTolerance === level
                          ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/30"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300")}>
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">Lifestyle Goal</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'save', label: 'Save More', icon: '💰' },
                    { id: 'balanced', label: 'Balanced', icon: '⚖️' },
                    { id: 'spend', label: 'Spend More', icon: '🎉' }
                  ].map(goal => (
                    <motion.button key={goal.id} onClick={() => setData(prev => ({ ...prev, lifestyleGoal: goal.id as any }))}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                      className={cn("p-4 rounded-2xl font-semibold text-sm transition-all border-2 flex flex-col items-center gap-2",
                        data.lifestyleGoal === goal.id
                          ? "bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-600/30"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-pink-300")}>
                      <span className="text-xl">{goal.icon}</span>
                      {goal.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-[32px] p-8 shadow-lg shadow-cyan-100/30 border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-cyan-100 rounded-2xl flex items-center justify-center">
                  <Calendar size={20} className="text-cyan-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Timeline</h2>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Target Intake</label>
                <select value={data.intake} onChange={(e) => setData(prev => ({ ...prev, intake: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-base font-semibold focus:ring-2 focus:ring-cyan-600/30 focus:border-transparent transition-all appearance-none">
                  <option value="">Select intake...</option>
                  {INTAKES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">Exams Given</label>
                <div className="space-y-3">
                  {EXAMS.map(exam => (
                    <label key={exam} className="flex items-center p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input type="checkbox" checked={data.examsGiven.includes(exam)}
                        onChange={() => toggleExam(exam)}
                        className="w-5 h-5 rounded-lg accent-cyan-600 cursor-pointer" />
                      <span className="ml-3 font-semibold text-slate-700">{exam}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/30 sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Profile Strength</h3>
                <CheckCircle2 size={28} className={cn(canGenerate ? 'text-emerald-300' : 'text-amber-300')} />
              </div>
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8"
                      strokeDasharray={`${strength * 3.51} 351`} strokeLinecap="round" fill="transparent"
                      className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{strength}%</span>
                    <span className="text-xs text-white/70 mt-1">{canGenerate ? '✓ Ready' : 'In Progress'}</span>
                  </div>
                </div>
              </div>
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">Next Steps:</p>
                  {suggestions.slice(0, 3).map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }} className="flex items-start gap-2 p-3 bg-white/10 rounded-xl">
                      <Lightbulb size={16} className="mt-0.5 flex-shrink-0" />
                      <p className="text-xs">{s}</p>
                    </motion.div>
                  ))}
                </div>
              )}
              {canGenerate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-emerald-400/20 rounded-2xl border border-emerald-400/30 text-center">
                  <p className="text-xs font-bold text-emerald-300">✅ Ready to generate your plan!</p>
                  <p className="text-xs text-white/60 mt-1">Scroll down and click the button</p>
                </motion.div>
              )}
            </motion.div>

            {activeHints.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-100/50 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" /> Smart Insights
                </h3>
                <div className="space-y-3">
                  {activeHints.slice(0, 3).map((hint, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }} className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-xs text-slate-700 leading-relaxed">{hint.hint}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-100/50 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" /> Profile Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">GPA</span>
                  <span className="font-bold text-slate-900">{data.gpa || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Field</span>
                  <span className="font-bold text-slate-900">{data.field || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Degree</span>
                  <span className="font-bold text-slate-900">{data.degree || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Countries</span>
                  <span className="font-bold text-slate-900">{data.countries.length > 0 ? data.countries.join(', ') : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Budget</span>
                  <span className="font-bold text-slate-900">₹{(data.budget / 100000).toFixed(0)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Exams</span>
                  <span className="font-bold text-slate-900">{data.examsGiven.length > 0 ? data.examsGiven.join(', ') : '—'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Required fields</span>
                    <span className={cn("font-bold text-xs px-2 py-1 rounded-full",
                      canGenerate ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {[data.gpa, data.field, data.countries.length > 0, data.degree].filter(Boolean).length}/4
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-8 px-6 z-10">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              style={{ width: '100%' }}
              className={cn(
                "w-full py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl border-0 outline-none",
                canGenerate && !generating
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : generating
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white cursor-wait"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}>
              {generating ? (
                <>
                  <svg className="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Building your plan...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Generate My Future Plan 🚀
                </>
              )}
            </button>
            {!canGenerate && !generating && (
              <p className="text-center text-xs text-slate-500 mt-3">
                Fill in: {[!data.gpa && 'GPA', !data.field && 'Field', data.countries.length === 0 && 'Country', !data.degree && 'Degree'].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </motion.div>

        <div className="h-32" />
      </div>
    </div>
  );
}
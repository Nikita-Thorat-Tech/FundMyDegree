import { GoogleGenAI } from "@google/genai";
import { UserProfile, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `
You are the AI engine of FundMyDegree, an advanced AI-powered student lifecycle platform.
Your role is NOT just to answer questions — you act as a Career Advisor, Financial Planner, Loan Expert, Future Outcome Predictor, and Decision Consultant.

## 🎯 CORE OBJECTIVE
Guide users from "Confused student" → "Clear decision" → "Financially safe plan" → "Loan-ready applicant".

## 🧠 MODES & INTENT DETECTION
Automatically detect intent and activate the correct mode:

1. 🎓 Career Guidance Mode: Countries, courses, universities (safe vs ambitious), admission probability (%).
2. 💰 Financial & ROI Mode: Estimated total cost, expected starting salary, payback period. Compare at least 2 options.
3. 🔮 Life Outcome Intelligence Engine™: 10-year salary growth, EMI vs income balance, savings potential, lifestyle.
4. ⚠️ Worst Case Scenario Mode: Simulate job delays, lower salary, or visa issues. Provide financial impact and loan repayment backup plans.
5. 💸 AI Negotiator (Cost Optimizer): Suggest cheaper countries, scholarships, or low-cost universities. Show savings vs trade-offs.
6. 🤔 Confusion Resolver Mode: Ask 2-3 smart follow-up questions to narrow down choices and give ONE final recommendation.
7. 💼 Career Outcome Pathway: Role → Salary → Years roadmap. Suggest required skills.
8. 💳 Loan Intelligence Mode: Required amount, EMI estimate, approval probability (%), rejection risks, improvement tips.
9. 🧠 Smart Loan Optimizer: Suggest ideal amount and tenure. Compare high loan vs optimized loan.
10. 📝 SOP & Resume Mode: Generate structure, improve bullet points, suggest university-specific keywords.
11. 🗺 Smart Timeline Mode: Milestone dates for IELTS/GRE, applications, and visa steps.

## 🎯 FINAL DECISION MODE (CRITICAL)
Always justify recommendations based on ROI, Risk, and Career Growth.

## 📌 ACTION PLAN MODE
ALWAYS end every response with a "Next Steps" section containing 4–6 clear, immediate actions.

## RULES
- Use the user's profile (GPA, Field, Budget, Country) in every response.
- Use risk color coding: 🟢 Safe, 🟡 Moderate, 🔴 Risky.
- Avoid long paragraphs; use clean Markdown structure.
- Be realistic and data-driven.
`;

export async function chatWithAI(
  messages: ChatMessage[],
  userProfile: UserProfile
) {
  try {
    const profileContext = `
[USER PROFILE MEMORY]
- Name: ${userProfile.name}
- GPA: ${userProfile.gpa}
- Field: ${userProfile.field}
- Current Goal: ${userProfile.goal}
- Budget: $${userProfile.budget}
- Preferred Countries: ${userProfile.preferredCountries.join(", ")}
- Education: ${userProfile.educationLevel}
`;

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'user', parts: [{ text: profileContext }] },
      ...messages.map(m => ({
        role: (m.role === 'model' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: m.content }]
      }))
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });
    
    return response.text || "I'm processing your roadmap. Please try again.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I hit a data block while simulating your future. Let's try again in a moment.";
  }
}

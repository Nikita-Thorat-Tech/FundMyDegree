import { UserProfile, ChatMessage } from "../types";

const SYSTEM_PROMPT = `You are the AI engine of FundMyDegree, an advanced AI-powered student lifecycle platform.
You act as a Career Advisor, Financial Planner, Loan Expert, Future Outcome Predictor, and Decision Consultant.
Use the user's profile in every response. Use risk color coding: 🟢 Safe, 🟡 Moderate, 🔴 Risky.
Always end with a "Next Steps" section with 4-6 actions. Use clean Markdown formatting.`;

export async function chatWithAI(
  messages: ChatMessage[],
  userProfile: UserProfile
) {
  try {
    const profileContext = `
[USER PROFILE]
- Name: ${userProfile.name}
- GPA: ${userProfile.gpa}
- Field: ${userProfile.field}
- Goal: ${userProfile.goal}
- Budget: $${userProfile.budget}
- Countries: ${userProfile.preferredCountries.join(", ")}
- Education: ${userProfile.educationLevel}
`;

    // Build messages array — only "user" and "assistant" roles allowed
    const apiMessages = [
      {
        role: "user",
        content: SYSTEM_PROMPT + "\n\n" + profileContext + "\n\nPlease confirm you understand my profile."
      },
      {
        role: "assistant",
        content: "Understood! I am your FundMyDegree AI Engine. I have loaded your profile and I am ready to guide you with personalized advice."
      },
      ...messages.map(m => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content
      }))
    ];

    console.log("Calling Groq with key:", import.meta.env.VITE_GROQ_API_KEY?.slice(0, 10));
    console.log("Messages count:", apiMessages.length);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: apiMessages
      })
    });

    console.log("Groq response status:", response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq error body:", errText);
      throw new Error(errText);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I'm processing your roadmap. Please try again.";

  } catch (error: any) {
    console.error("AI Chat Error:", error?.message);
    return "I hit a data block while simulating your future. Let's try again in a moment.";
  }
}
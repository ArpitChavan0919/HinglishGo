
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationTone } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const translateToHinglish = async (
  text: string, 
  tone: TranslationTone = TranslationTone.CASUAL
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are an expert Hinglish translator. Hinglish is Hindi written using English (Latin) alphabets.
    Your goal is to translate the input text (which could be English or Hindi Devanagari) into natural, conversational, and culturally relevant Hinglish.
    
    RULES:
    1. Tone: ${tone === TranslationTone.CASUAL ? 'Casual, friendly, and spoken' : 'Formal, respectful, and professional'}.
    2. Maintain natural flow: Do not do word-for-word translation. Use phrases that a native speaker would use in a chat or conversation.
    3. Retain technical terms: Keep English words like "AI", "Internet", "Software", "Startup", "Meeting", "Email", "Phone" as they are if they are commonly used in daily Hindi conversations.
    4. Script: Use ONLY English alphabets (Latin script).
    5. Formatting: Preserve paragraphs and line breaks.
    
    EXAMPLES:
    Input: "How are you doing today?"
    Output (Casual): "Aap kaise ho aaj?"
    
    Input: "This meeting is very important for our startup."
    Output (Formal): "Yeh meeting hamare startup ke liye bahut important hai."
    
    Input: "मुझे कल दिल्ली जाना है।"
    Output: "Mujhe kal Delhi jaana hai."
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Translation failed. Please try again.";
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw new Error("Failed to connect to the translation service.");
  }
};

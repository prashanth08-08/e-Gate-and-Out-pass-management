import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const polishReason = async (rawReason: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Reword the following reason for a hostel leave request to make it sound professional and polite, but keep it concise (under 20 words). 
      Raw reason: "${rawReason}"`,
    });
    return response.text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("AI Error:", error);
    return rawReason; // Fallback to original
  }
};

export const summarizeForWarden = async (reason: string, days: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this leave request. Return a JSON object with: 1. A 5-word summary. 2. A risk level (Low/Medium/High) based on urgency and duration (${days} days).
      Reason: "${reason}"
      
      Response Format: {"summary": "...", "risk": "..."}`,
      config: { responseMimeType: "application/json" }
    });
    return response.text;
  } catch (error) {
    return JSON.stringify({ summary: reason.substring(0, 30) + "...", risk: "Unknown" });
  }
};
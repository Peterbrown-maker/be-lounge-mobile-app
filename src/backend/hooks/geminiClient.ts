import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
export const genAI = new GoogleGenAI({
  apiKey: "YOUR_API_KEY_HERE", // Replace with your key
});

// Function to ask Gemini
export async function askGemini(prompt: string) {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash", // Use the Gemini model you want
      contents: prompt,
    });

    // Gemini response text
    return response.text;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Sorry, something went wrong with the AI.";
  }
}

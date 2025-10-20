// FIX: Implemented the geminiService to analyze symptoms and suggest medications using the @google/genai SDK.
import { GoogleGenAI, Type } from "@google/genai";

// FIX: Initialize GoogleGenAI with apiKey from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const analyzeSymptoms = async (
  symptomsText: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // FIX: Construct the prompt with a system instruction for better context.
    const systemInstruction = `You are an AI medical assistant for "ArogyaAI", a platform for rural India.
Your role is to provide a preliminary analysis of symptoms.
Analyze the user's symptoms and provide a potential diagnosis, suggest possible next steps, and include a clear disclaimer that this is not a substitute for professional medical advice.
Structure the response in clear, simple language suitable for a non-medical audience. Use Markdown for formatting.
The response should be structured as follows:
1.  **Preliminary Analysis:** A brief summary of possible conditions based on the symptoms.
2.  **Recommended Next Steps:** Suggestions like "rest", "hydration", "monitoring symptoms", or "consulting a doctor".
3.  **Disclaimer:** "This is an AI-generated analysis and not a substitute for professional medical advice. Please consult a qualified doctor for an accurate diagnosis."
Keep the tone helpful, empathetic, and cautious.`;

    const parts: any[] = [{ text: symptomsText }];

    // FIX: Add image part to the prompt if available.
    if (imageBase64 && imageMimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        },
      });
    }

    // FIX: Call generateContent with the correct model, contents, and system instruction.
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
      },
    });

    // FIX: Directly access the 'text' property from the response for the generated content.
    return response.text;
  } catch (error) {
    console.error("Error analyzing symptoms with Gemini API:", error);
    throw new Error("Failed to get analysis from AI. Please check your connection or API key.");
  }
};

export const suggestMedications = async (symptomsText: string): Promise<{ medications: {name: string, dosage: string, frequency: string}[] }> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an AI medical assistant. Based on the provided symptoms, suggest a list of common, over-the-counter or first-line prescription medications.
    For each medication, provide a common name, a suggested dosage (e.g., '500mg'), and frequency (e.g., 'Twice a day').
    This is for a doctor's reference, not a direct prescription. Do not include any warnings or disclaimers in the JSON output.`;
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        medications: {
          type: Type.ARRAY,
          description: "A list of suggested medications.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the medication." },
              dosage: { type: Type.STRING, description: "Dosage of the medication (e.g., '500mg')." },
              frequency: { type: Type.STRING, description: "How often to take the medication (e.g., 'Twice a day')." }
            },
            required: ["name", "dosage", "frequency"]
          }
        }
      },
      required: ["medications"]
    };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Symptoms: ${symptomsText}` }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error suggesting medications with Gemini API:", error);
    // Return empty array on failure so the UI doesn't break
    return { medications: [] };
  }
};
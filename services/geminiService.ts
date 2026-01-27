import { GoogleGenAI, Type } from "@google/genai";
import { TaskSubject, AIGeneratedTask } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseNaturalLanguagePlan = async (
  text: string, 
  currentDate: string
): Promise<AIGeneratedTask[]> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return [];
  }

  const modelId = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are a Salesforce data assistant. 
    Your job is to extract task planning information from unstructured text.
    
    The valid 'Subject' values are STRICTLY limited to: 
    ${Object.values(TaskSubject).join(', ')}.
    
    Map the user's intent to the closest valid Subject.
    The current date is ${currentDate}.
    If a date is not specified, assume it is for the current month or week mentioned.
    Format dates as YYYY-MM-DD.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subject: {
                type: Type.STRING,
                description: "One of the 6 allowed task subjects.",
                enum: Object.values(TaskSubject)
              },
              description: {
                type: Type.STRING,
                description: "The details or comments about the task."
              },
              dueDate: {
                type: Type.STRING,
                description: "The due date in YYYY-MM-DD format."
              }
            },
            required: ["subject", "description", "dueDate"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIGeneratedTask[];
    }
    return [];
  } catch (error) {
    console.error("Gemini parsing error:", error);
    throw error;
  }
};
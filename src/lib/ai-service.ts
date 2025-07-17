import { GoogleGenerativeAI } from '@google/generative-ai';

// Use your existing API key name pattern
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateContent(prompt: string): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Free model
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
    
  } catch (error: unknown) {
    console.error("Error generating content:", error);
    
    // Handle service unavailable (like your pattern)
    // if (error.response && error.response.status === 503) {
    //   throw new Error("Service Unavailable: Please try again later.");
    // }

    if (error instanceof Error) {
      // Handle service unavailable (like your pattern)
      if ('response' in error && typeof error.response === 'object' && error.response !== null) {
        const errorResponse = error.response as { status?: number };
        if (errorResponse.status === 503) {
          throw new Error("Service Unavailable: Please try again later.");
        }
      }
    }
    
    
    throw error;
  }
}
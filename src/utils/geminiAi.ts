import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client with the API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

// List of models to try in order of preference
const GEMINI_MODELS = [
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-pro",
  "gemini-1.0-pro",
  "text-unicorn",
  "text-bison"
];

/**
 * Generates markdown content from a prompt using Google's Gemini AI
 * @param prompt The user's prompt to generate content
 * @returns Promise containing the generated markdown content
 */
export async function generateMarkdownWithGemini(prompt: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please check your environment variables.");
    }

    // System prompt to ensure we get markdown formatting
    const systemPrompt = 
      "You are a helpful AI writing assistant. Generate well-formatted markdown content based on the user's request. " + 
      "Include appropriate markdown formatting like headers, lists, code blocks, etc. " +
      "Your response should be in pure markdown format that can be directly used in a blog post.";
    
    const fullPrompt = systemPrompt + "\n\nUser request: " + prompt;
    let lastError = null;

    // Try each model in order until one works
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        });

        // If we get here, the model worked
        return result.response.text();
      } catch (error) {
        console.warn(`Model ${modelName} failed:`, error);
        lastError = error;
        // Continue to the next model
      }
    }

    // If we get here, none of the models worked
    throw new Error(`All Gemini models failed. Last error: ${lastError?.message || "Unknown error"}`);
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
} 
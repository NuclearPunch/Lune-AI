import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-placeholder" 
});

export interface AIAgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
}

export class OpenAIService {
  async callAgent(prompt: string, systemMessage?: string): Promise<AIAgentResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          ...(systemMessage ? [{ role: "system" as const, content: systemMessage }] : []),
          { role: "user" as const, content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return { success: false, error: "No response from AI" };
      }

      const data = JSON.parse(content);
      return { success: true, data };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown AI error" 
      };
    }
  }

  async callAgentWithStructuredOutput<T>(
    prompt: string, 
    systemMessage: string,
    schema?: string
  ): Promise<AIAgentResponse<T>> {
    const fullSystemMessage = schema 
      ? `${systemMessage}\n\nPlease respond with JSON in this format: ${schema}`
      : `${systemMessage}\n\nPlease respond with JSON format.`;

    return this.callAgent(prompt, fullSystemMessage);
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Embedding generation error:", error);
      return null;
    }
  }
}

export const openaiService = new OpenAIService();

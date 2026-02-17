import { GoogleGenAI } from "@google/genai";
import { INFOGRAPHIC_SYSTEM_PROMPT } from "@/lib/prompts/infographic";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API! });

export type InfographicPromptResult = {
  prompt: string;
  caption: string;
};

export async function generateInfographicPrompt(
  title: string,
  body: string,
): Promise<InfographicPromptResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `${INFOGRAPHIC_SYSTEM_PROMPT}\n\n---\n\nHypothesis Title: ${title}\n\nHypothesis Body:\n${body}`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No prompt text in Gemini response");

  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned) as { prompt?: string; caption?: string };
    if (!parsed.prompt) throw new Error("Missing prompt field");
    return {
      prompt: parsed.prompt,
      caption: parsed.caption ?? "",
    };
  } catch {
    // Fallback: treat entire response as the prompt, no caption
    return { prompt: text.trim(), caption: "" };
  }
}

export async function generateInfographicImage(
  prompt: string,
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData);

  const imageData = imagePart?.inlineData?.data;
  if (!imageData) {
    throw new Error("No image data in Gemini response");
  }

  return Buffer.from(imageData, "base64");
}

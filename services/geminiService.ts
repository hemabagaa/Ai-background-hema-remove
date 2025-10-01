
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image-preview';

const PROMPT = `
You are an expert image editor specializing in background removal.
Your task is to remove the background from the uploaded image with maximum precision.
- The subject must be perfectly intact.
- Preserve the original resolution.
- Keep all edges sharp and clean.
- Do not apply any compression, filters, or color changes to the subject.
- The output must be a PNG file with a fully transparent background.
`;

export const removeImageBackground = async (dataUrl: string): Promise<string> => {
  const { base64Data, mimeType } = parseDataUrl(dataUrl);

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: PROMPT,
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    // Check for safety ratings or other reasons for no image output
    if (response.candidates[0]?.finishReason !== 'STOP') {
        throw new Error(`Processing was stopped due to: ${response.candidates[0]?.finishReason}. Please try a different image.`);
    }

    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the API.");
  }
};

function parseDataUrl(dataUrl: string): { base64Data: string; mimeType: string } {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid data URL format");
    }
    const mimeType = match[1];
    const base64Data = match[2];
    return { base64Data, mimeType };
}

import { GoogleGenAI } from "@google/genai";
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  const systemInstruction = "Hello";
  const formattedMessages = [{ role: 'user', parts: [{ text: "hello" }] }];
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.6-flash",
    contents: formattedMessages,
    config: {
      systemInstruction,
    }
  });
  for await (const chunk of responseStream) {
    console.log(chunk.text);
  }
}
run().catch(console.error);

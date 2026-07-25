import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI } from "@google/genai";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    
    // Either use API key from env, or rely on Google Application Credentials for Vertex AI / Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: { systemInstruction }
    });
    
    res.json({ content: response.text });
  } catch (error: any) {
    logger.error("Generate API error:", error);
    res.status(500).json({ error: "Failed to generate content", details: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, agent_scope } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});
    
    const systemInstruction = `You are a helpful dragon fruit farming AI assistant for Dragon Fruit Farming Africa (DFSA).
You provide helpful information about dragon fruit cultivars, commercial farming packages, pricing, and advice.
Always be polite and professional.
${agent_scope ? `Focus on: ${agent_scope}` : ""}`;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-1.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction,
      }
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of responseStream) {
      if (chunk.text) {
        const payload = {
          choices: [{
            delta: {
              content: chunk.text
            }
          }]
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    logger.error("Chat API error:", error);
    res.status(500).json({ error: "Failed to process chat request.", details: error.message });
  }
});

export const api = onRequest(app);

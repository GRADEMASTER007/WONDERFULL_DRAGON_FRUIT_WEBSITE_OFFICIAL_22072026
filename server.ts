import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || path.join(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized with serviceAccountKey.json");
  } else {
    // Fallback to default application credentials if available
    admin.initializeApp();
    console.log("Firebase Admin initialized with default credentials");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", key: !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS });
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      // If GOOGLE_APPLICATION_CREDENTIALS is set, the SDK will automatically use it for auth
      const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { systemInstruction }
      });
      
      res.json({ content: response.text });
    } catch (error: any) {
      console.error("Generate API error:", error);
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
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to process chat request.", details: error.message, stack: error.stack });
    }
  });

  app.post("/api/paypal/create-order", async (req, res) => {
    try {
      const { orderId, amount, currency, returnUrl, cancelUrl } = req.body;
      const mockApprovalUrl = `${returnUrl}?token=mock_paypal_token_${Date.now()}`;
      res.json({
        success: true,
        redirectUrl: mockApprovalUrl,
        orderId: `PAYPAL_${Date.now()}`
      });
    } catch (error) {
      console.error("PayPal API error:", error);
      res.status(500).json({ success: false, error: "Failed to process PayPal request." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

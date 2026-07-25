"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const genai_1 = require("@google/genai");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.post("/api/generate", async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        // Either use API key from env, or rely on Google Application Credentials for Vertex AI / Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        const ai = apiKey ? new genai_1.GoogleGenAI({ apiKey }) : new genai_1.GoogleGenAI({});
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: { systemInstruction }
        });
        res.json({ content: response.text });
    }
    catch (error) {
        logger.error("Generate API error:", error);
        res.status(500).json({ error: "Failed to generate content", details: error.message });
    }
});
app.post("/api/chat", async (req, res) => {
    try {
        const { messages, agent_scope } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        const ai = apiKey ? new genai_1.GoogleGenAI({ apiKey }) : new genai_1.GoogleGenAI({});
        const systemInstruction = `You are a helpful dragon fruit farming AI assistant for Dragon Fruit Farming Africa (DFSA).
You provide helpful information about dragon fruit cultivars, commercial farming packages, pricing, and advice.
Always be polite and professional.
${agent_scope ? `Focus on: ${agent_scope}` : ""}`;
        const formattedMessages = messages.map((m) => ({
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
    }
    catch (error) {
        logger.error("Chat API error:", error);
        res.status(500).json({ error: "Failed to process chat request.", details: error.message });
    }
});
exports.api = (0, https_1.onRequest)(app);
//# sourceMappingURL=index.js.map
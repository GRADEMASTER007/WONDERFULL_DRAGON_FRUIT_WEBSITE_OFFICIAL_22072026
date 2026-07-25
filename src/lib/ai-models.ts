export interface AIModel {
  id: string;
  name: string;
  provider: string;
  recommended?: boolean;
  lightweight?: boolean;
  capabilities?: string[];
}

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  authType: "bearer";
  models: AIModel[];
}

export const GEMINI_MODELS: AIModel[] = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", recommended: true, lightweight: true, capabilities: ["chat", "coding", "reasoning", "vision", "content", "seo"] },
];

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "google",
    name: "Google AI",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    authType: "bearer",
    models: GEMINI_MODELS,
  },
];

export const AI_FUNCTION_TYPES = [
  { id: "chat", name: "Customer Chat", icon: "MessageCircle", description: "Website chat and support" },
  { id: "content", name: "Content Generation", icon: "FileText", description: "Product descriptions, marketing" },
  { id: "seo", name: "SEO Optimization", icon: "Search", description: "Meta tags, keywords" },
  { id: "coding", name: "Code Generation", icon: "Code", description: "Code writing and debugging" },
  { id: "audit", name: "Security Audit", icon: "Shield", description: "Security analysis and review" },
  { id: "blog", name: "Blog Generation", icon: "BookOpen", description: "Blog posts and articles" },
  { id: "page", name: "Page Builder", icon: "Layout", description: "Website page content" },
  { id: "image", name: "Image Prompts", icon: "Image", description: "Image generation prompts" },
];

export function getModelsForProvider(providerId: string): AIModel[] {
  const provider = AI_PROVIDERS.find(p => p.id === providerId);
  return provider?.models || GEMINI_MODELS;
}

export function findModel(modelId: string): { model: AIModel; provider: AIProvider } | null {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return { model, provider };
  }
  return null;
}

export function getRecommendedModels(): AIModel[] {
  return GEMINI_MODELS.filter(m => m.recommended);
}

// Backward-compat exports
export const ZAI_MODELS = GEMINI_MODELS;
export const DASHSCOPE_MODELS = GEMINI_MODELS;

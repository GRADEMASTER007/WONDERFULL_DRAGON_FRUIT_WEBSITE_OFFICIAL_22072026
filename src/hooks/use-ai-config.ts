/**
 * Unified AI Configuration Hook
 * 
 * Single provider: z.ai (GLM-4.7)
 * All AI requests route through the ai-orchestrator edge function.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, query, orderBy, where, getDoc } from "firebase/firestore";
import { toast } from "sonner";

// AI Functional Scopes
export const AI_SCOPES = [
  { id: "customer_chat", name: "Customer Chat", description: "Customer-facing AI assistant widget", icon: "MessageCircle" },
  { id: "admin_ai_assistant", name: "Admin AI Assistant", description: "Admin panel AI chat interface", icon: "Bot" },
  { id: "ai_control_panel", name: "AI Control Panel", description: "Manual AI prompt testing", icon: "Settings2" },
  { id: "content_generation", name: "Content Generation", description: "Product descriptions, marketing copy", icon: "FileText" },
  { id: "seo_optimization", name: "SEO Optimization", description: "Meta tags, keywords, content SEO", icon: "Search" },
  { id: "blog_generation", name: "Blog Generation", description: "Auto-generate blog articles", icon: "BookOpen" },
  { id: "page_builder", name: "Page Builder", description: "AI-assisted page creation", icon: "Layout" },
  { id: "image_prompt_generation", name: "Image Prompts", description: "Generate prompts for image AI", icon: "Image" },
  { id: "security_audit", name: "Security Audit", description: "Code security analysis", icon: "Shield" },
  { id: "code_generation", name: "Code Generation", description: "Generate code snippets", icon: "Code" },
] as const;

export type AIScopeId = typeof AI_SCOPES[number]["id"];

// Canonical type mappings for backward compatibility
export const TYPE_TO_SCOPE: Record<string, AIScopeId> = {
  chat: "customer_chat",
  custom: "ai_control_panel",
  product_description: "content_generation",
  seo_meta: "seo_optimization",
  content: "content_generation",
  code_review: "security_audit",
  audit: "security_audit",
  vision: "image_prompt_generation",
  blog: "blog_generation",
  page: "page_builder",
};

export interface AIScopeConfig {
  id: string;
  function_type: string;
  provider: string;
  model_id: string;
  model_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tools_enabled_serpapi: boolean;
  serpapi_max_calls: number;
}

export interface AIProviderConfig {
  id: string;
  provider_name: string;
  display_name: string;
  base_url: string;
  auth_type: string;
  auth_header: string | null;
  is_active: boolean;
  priority: number;
  rate_limit_per_minute: number | null;
  daily_credit_limit: number | null;
  settings: Record<string, any>;
}

/**
 * Hook to fetch all AI scope configurations
 */
export function useAIScopeConfigs() {
  return useQuery({
    queryKey: ["ai-scope-configs"],
    queryFn: async () => {
      const q = query(collection(db, "ai_model_config"), orderBy("function_type"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AIScopeConfig[];
    },
  });
}

/**
 * Hook to fetch configuration for a specific scope
 */
export function useAIScopeConfig(scopeId: AIScopeId | string) {
  return useQuery({
    queryKey: ["ai-scope-config", scopeId],
    queryFn: async () => {
      const q = query(collection(db, "ai_model_config"), where("function_type", "==", scopeId));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as AIScopeConfig;
    },
  });
}

/**
 * Hook to fetch all active AI providers
 */
export function useAIProviders() {
  return useQuery({
    queryKey: ["ai-providers"],
    queryFn: async () => {
      const q = query(collection(db, "ai_provider_config"), orderBy("priority", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AIProviderConfig[];
    },
  });
}

/**
 * Hook to update a scope's AI configuration
 */
export function useUpdateAIScopeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scopeId, provider, modelId, modelName,
    }: { scopeId: string; provider: string; modelId: string; modelName: string }) => {
      const q = query(collection(db, "ai_model_config"), where("function_type", "==", scopeId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docId = snap.docs[0].id;
        await updateDoc(doc(db, "ai_model_config", docId), { provider, model_id: modelId, model_name: modelName, updated_at: new Date().toISOString() });
      } else {
        await setDoc(doc(collection(db, "ai_model_config")), {
          function_type: scopeId, provider, model_id: modelId, model_name: modelName, created_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-scope-configs"] });
      queryClient.invalidateQueries({ queryKey: ["ai-scope-config"] });
      toast.success("AI configuration updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update configuration");
    },
  });
}

/**
 * Hook to toggle a scope on/off
 */
export function useToggleAIScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scopeId, isActive }: { scopeId: string; isActive: boolean }) => {
      const q = query(collection(db, "ai_model_config"), where("function_type", "==", scopeId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, "ai_model_config", snap.docs[0].id), { is_active: isActive });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-scope-configs"] });
    },
  });
}

/**
 * Hook to update SerpAPI settings for a scope
 */
export function useUpdateSerpAPISettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scopeId, serpApiEnabled, maxCalls }: { scopeId: string; serpApiEnabled: boolean; maxCalls: number }) => {
      const q = query(collection(db, "ai_model_config"), where("function_type", "==", scopeId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, "ai_model_config", snap.docs[0].id), { tools_enabled_serpapi: serpApiEnabled, serpapi_max_calls: maxCalls, updated_at: new Date().toISOString() });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-scope-configs"] });
      toast.success("SerpAPI settings updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update SerpAPI settings");
    },
  });
}

/**
 * Hook to update provider priority/status
 */
export function useUpdateAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerId, updates }: { providerId: string; updates: Partial<AIProviderConfig> }) => {
      await updateDoc(doc(db, "ai_provider_config", providerId), { ...updates, updated_at: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
      toast.success("Provider updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update provider");
    },
  });
}

/**
 * Get the AI gateway URL
 */
export function getAIGatewayUrl(): string {
  return `/api/generate`;
}

/**
 * Make an AI request through the z.ai gateway
 * This is the PRIMARY and ONLY way to interact with AI
 */
export interface AIDebugInfo {
  scope_used: string;
  provider_used: string;
  model_used: string;
}

export async function callAIGateway(params: {
  scope: AIScopeId | string;
  prompt: string;
  messages?: Array<{ role: string; content: string }>;
  context?: Record<string, any>;
  stream?: boolean;
}): Promise<{
  success: boolean;
  content: string;
  model: string;
  provider: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  debug?: AIDebugInfo;
}> {
  const type = TYPE_TO_SCOPE[params.scope] || params.scope;
  
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: params.prompt,
      messages: params.messages,
      context: params.context,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "AI request failed");
  }

  const data = await response.json();
  
  return {
    success: true,
    content: data.content,
    model: "gemini-1.5-flash",
    provider: "google",
  };
}

/**
 * Call SerpAPI through the shared gateway
 */
export async function callSerpAPI(params: {
  endpoint: "search" | "images" | "places" | "shopping";
  query: string;
  scope?: AIScopeId | string;
  options?: { location?: string; num?: number; gl?: string; hl?: string };
}): Promise<{ success: boolean; data: any; cached: boolean; remaining: number }> {
  throw new Error("SerpAPI is no longer supported directly via edge functions.");
}

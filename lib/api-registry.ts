// Central API Registry for EON-2.0
// Pre-configured with 15 typed endpoints for the Polymath Innovae x Eonexea AI Hackathon.
// Operates in Mock Mode (offline-safe, zero failure risk) or Live API Mode (plugs in external endpoints).

export interface ApiEndpoint {
  id: string;
  slotNumber: number;
  name: string;
  category: "AI Systems" | "Consumer Growth" | "Clinical HealthTech" | "Shared Utilities";
  method: "POST" | "GET";
  description: string;
  url: string;
  apiKey?: string;
  status: "ready" | "connected" | "mock_active";
  defaultMockHandler: (input: any) => Promise<any>;
}

export interface ApiRegistryConfig {
  useLiveApis: boolean;
  endpoints: Record<string, { url: string; apiKey: string }>;
}

const DEFAULT_CONFIG: ApiRegistryConfig = {
  useLiveApis: false,
  endpoints: {},
};

export function getStoredApiConfig(): ApiRegistryConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem("eon_api_registry_config");
    if (!raw) return DEFAULT_CONFIG;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveStoredApiConfig(config: ApiRegistryConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("eon_api_registry_config", JSON.stringify(config));
}

// 15 Pre-wired API slots
export const API_SLOTS: Omit<ApiEndpoint, "defaultMockHandler">[] = [
  // Track 1: AI Systems & Product
  {
    id: "api_triage_ticket",
    slotNumber: 1,
    name: "Support Ticket AI Triage Classifier",
    category: "AI Systems",
    method: "POST",
    description: "Evaluates support query for emotional charge vs factual resolution. Returns AI vs Human verdict + rationale.",
    url: "/api/mock/triage-ticket",
    status: "mock_active",
  },
  {
    id: "api_build_vs_buy",
    slotNumber: 2,
    name: "Build vs Buy Tradeoff Evaluator",
    category: "AI Systems",
    method: "POST",
    description: "Accepts 4 core constraints (cost, time, tech debt, lock-in) and returns sensitivity recommendation.",
    url: "/api/mock/build-vs-buy",
    status: "mock_active",
  },
  {
    id: "api_cluster_feedback",
    slotNumber: 3,
    name: "Unstructured Feedback Clustering & Ranking",
    category: "AI Systems",
    method: "POST",
    description: "Clusters raw reviews into high-severity themes and identifies quiet power-user signals.",
    url: "/api/mock/cluster-feedback",
    status: "mock_active",
  },
  {
    id: "api_intentional_edge_detector",
    slotNumber: 4,
    name: "Intentional Edge Case & Bias Detector",
    category: "AI Systems",
    method: "POST",
    description: "Flags multi-intent reversals and contradictory customer statements where LLMs risk hallucinating.",
    url: "/api/mock/edge-detector",
    status: "mock_active",
  },

  // Track 2: Consumer Growth & Applied Psychology
  {
    id: "api_loyalty_loop_builder",
    slotNumber: 5,
    name: "Behavioral Loyalty Loop Generator",
    category: "Consumer Growth",
    method: "POST",
    description: "Maps psychological principles (endowment effect, variable rewards) into non-discount retention mechanics.",
    url: "/api/mock/loyalty-loop",
    status: "mock_active",
  },
  {
    id: "api_friction_simulator",
    slotNumber: 6,
    name: "Checkout Friction & Elasticity Simulator",
    category: "Consumer Growth",
    method: "POST",
    description: "Models conversion dip vs return rate decrease under deliberate cooling-off pauses.",
    url: "/api/mock/friction-simulator",
    status: "mock_active",
  },
  {
    id: "api_referral_peak_trigger",
    slotNumber: 7,
    name: "Peak-Moment Referral Trigger Engine",
    category: "Consumer Growth",
    method: "POST",
    description: "Pinpoints emotional unboxing moments and computes incremental vs baseline referral advocacy.",
    url: "/api/mock/referral-trigger",
    status: "mock_active",
  },
  {
    id: "api_customer_emotional_hook",
    slotNumber: 8,
    name: "Customer Emotional Quote Synthesizer",
    category: "Consumer Growth",
    method: "POST",
    description: "Generates realistic simulated customer persona reactions to validate behavior loops.",
    url: "/api/mock/emotional-hook",
    status: "mock_active",
  },

  // Track 3: Clinical & HealthTech
  {
    id: "api_adherence_bottleneck_diagnosis",
    slotNumber: 9,
    name: "Clinical Adherence Bottleneck Diagnostician",
    category: "Clinical HealthTech",
    method: "POST",
    description: "Diagnoses real non-adherence causes (cost anxiety, complacency, side-effect fear) beyond simple forgetfulness.",
    url: "/api/mock/adherence-diagnosis",
    status: "mock_active",
  },
  {
    id: "api_conversational_nudge_bot",
    slotNumber: 10,
    name: "Targeted Patient Conversational Nudge Flow",
    category: "Clinical HealthTech",
    method: "POST",
    description: "Generates empathetic WhatsApp-style dialogue tailored strictly to the diagnosed behavioral bottleneck.",
    url: "/api/mock/conversational-nudge",
    status: "mock_active",
  },
  {
    id: "api_lab_plain_translator",
    slotNumber: 11,
    name: "Ambiguous Lab Result Plain-Language Translator",
    category: "Clinical HealthTech",
    method: "POST",
    description: "Explains borderline blood/thyroid tests without alarmism, calibrating tone for anxious vs dismissive patients.",
    url: "/api/mock/lab-translator",
    status: "mock_active",
  },
  {
    id: "api_medical_safety_validator",
    slotNumber: 12,
    name: "Clinical Boundary & Disclaimer Guardrail",
    category: "Clinical HealthTech",
    method: "POST",
    description: "Enforces strict 'this is not a diagnosis' boundaries and checks against prescribing liabilities.",
    url: "/api/mock/clinical-guardrail",
    status: "mock_active",
  },
  {
    id: "api_referral_tracker_status",
    slotNumber: 13,
    name: "Specialist Referral Pipeline Tracker",
    category: "Clinical HealthTech",
    method: "POST",
    description: "Tracks hospital specialist referral aging across 5 stages and flags stuck patients before drop-off.",
    url: "/api/mock/referral-tracker",
    status: "mock_active",
  },

  // Cross-Domain & Judging Helpers
  {
    id: "api_reasoning_trail_explainer",
    slotNumber: 14,
    name: "Inspectable Reasoning Trail Generator",
    category: "Shared Utilities",
    method: "POST",
    description: "Generates step-by-step logic audit logs so judges can inspect the 'why' behind AI decisions.",
    url: "/api/mock/reasoning-trail",
    status: "mock_active",
  },
  {
    id: "api_pitch_rubric_evaluator",
    slotNumber: 15,
    name: "Hackathon Pitch Rubric & Metric Exporter",
    category: "Shared Utilities",
    method: "POST",
    description: "Compiles presentation memo with 2-min situation, 3-min demo script, and moved metric verification.",
    url: "/api/mock/pitch-rubric",
    status: "mock_active",
  },
];

// Universal dispatch function: checks if live endpoint configured, otherwise uses instant client-side mock
export async function executeApiCall<T>(slotId: string, payload: any, fallbackMock: () => T): Promise<T> {
  const config = getStoredApiConfig();
  const endpointOverride = config.endpoints[slotId];

  if (config.useLiveApis && endpointOverride?.url) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (endpointOverride.apiKey) {
        headers["Authorization"] = `Bearer ${endpointOverride.apiKey}`;
      }
      const res = await fetch(endpointOverride.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return (await res.json()) as T;
      }
      console.warn(`[API Registry] Live API failed with status ${res.status}, falling back to mock.`);
    } catch (err) {
      console.warn("[API Registry] Live API network exception, falling back to mock:", err);
    }
  }

  // Instant zero-latency mock fallback
  await new Promise((resolve) => setTimeout(resolve, 350));
  return fallbackMock();
}

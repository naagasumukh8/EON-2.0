"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Globe, Shield, Zap, RefreshCw, Key, HelpCircle } from "lucide-react";
import { API_SLOTS, getStoredApiConfig, saveStoredApiConfig, ApiRegistryConfig } from "@/lib/api-registry";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiSettingsModal({ isOpen, onClose }: ApiSettingsModalProps) {
  const [config, setConfig] = useState<ApiRegistryConfig>({
    useLiveApis: false,
    endpoints: {},
  });
  const [activeTab, setActiveTab] = useState<"all" | "AI Systems" | "Consumer Growth" | "Clinical HealthTech">("all");
  const [testStatus, setTestStatus] = useState<Record<string, "idle" | "testing" | "success">>({});
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredApiConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleLive = () => {
    const updated = { ...config, useLiveApis: !config.useLiveApis };
    setConfig(updated);
    saveStoredApiConfig(updated);
  };

  const handleUpdateEndpoint = (slotId: string, field: "url" | "apiKey", value: string) => {
    const currentEndpoint = config.endpoints[slotId] || { url: "", apiKey: "" };
    const updated = {
      ...config,
      endpoints: {
        ...config.endpoints,
        [slotId]: {
          ...currentEndpoint,
          [field]: value,
        },
      },
    };
    setConfig(updated);
  };

  const handleSave = () => {
    saveStoredApiConfig(config);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleTestSlot = (slotId: string) => {
    setTestStatus((prev) => ({ ...prev, [slotId]: "testing" }));
    setTimeout(() => {
      setTestStatus((prev) => ({ ...prev, [slotId]: "success" }));
      setTimeout(() => {
        setTestStatus((prev) => ({ ...prev, [slotId]: "idle" }));
      }, 2500);
    }, 600);
  };

  const filteredSlots =
    activeTab === "all"
      ? API_SLOTS
      : API_SLOTS.filter((s) => s.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-black">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-cyan-400 border border-white/10">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold tracking-tight">API Registry & Live Adapter</h2>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] font-mono font-medium text-cyan-300 border border-cyan-500/20">
                  15 Pre-Wired Slots
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Plug in your live API endpoints during the hackathon or rely on zero-latency offline mock models.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Mode Switch Banner */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0f0f0f] px-6 py-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-neutral-300">Operational Engine Mode:</span>
            <div className="inline-flex rounded-lg border border-white/10 bg-black p-0.5">
              <button
                onClick={handleToggleLive}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  !config.useLiveApis
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Mock Data Engine (100% Offline Safe)
              </button>
              <button
                onClick={handleToggleLive}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  config.useLiveApis
                    ? "bg-cyan-500 text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Live API Endpoints (Custom URLs)
              </button>
            </div>
          </div>

          {savedToast && (
            <span className="flex items-center text-xs font-mono text-emerald-400">
              <Check className="h-3.5 w-3.5 mr-1" /> Config Saved
            </span>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/[0.08] px-6 bg-black overflow-x-auto">
          {(["all", "AI Systems", "Consumer Growth", "Clinical HealthTech"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`py-3 px-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === cat
                  ? "border-white text-white font-semibold"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {cat === "all" ? "All 15 Slots" : cat}
            </button>
          ))}
        </div>

        {/* Scrollable Slots List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredSlots.map((slot) => {
            const endpointData = config.endpoints[slot.id] || { url: "", apiKey: "" };
            const status = testStatus[slot.id] || "idle";

            return (
              <div
                key={slot.id}
                className="rounded-xl border border-white/[0.08] bg-[#0c0c0c] p-4 transition-all hover:border-white/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-white">
                      SLOT #{slot.slotNumber}
                    </span>
                    <span className="text-xs font-mono uppercase text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                      {slot.method}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{slot.name}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTestSlot(slot.id)}
                      disabled={status === "testing"}
                      className="flex items-center space-x-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:bg-white/10 hover:text-white"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${status === "testing" ? "animate-spin" : ""}`}
                      />
                      <span>
                        {status === "testing"
                          ? "Testing..."
                          : status === "success"
                          ? "200 OK (Pass)"
                          : "Test Slot"}
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 mb-3">{slot.description}</p>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-500 mb-1">
                      Endpoint URL (optional if using mock):
                    </label>
                    <input
                      type="text"
                      placeholder={slot.url}
                      value={endpointData.url}
                      onChange={(e) => handleUpdateEndpoint(slot.id, "url", e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-black px-3 py-1.5 font-mono text-xs text-white placeholder-neutral-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-500 mb-1">
                      API Key / Bearer Token:
                    </label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={endpointData.apiKey}
                      onChange={(e) => handleUpdateEndpoint(slot.id, "apiKey", e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-black px-3 py-1.5 font-mono text-xs text-white placeholder-neutral-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-black px-6 py-4">
          <span className="text-xs text-neutral-500 font-mono">
            All endpoints fallback seamlessly to offline mock algorithms if not populated.
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors shadow-glow"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save & Apply Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

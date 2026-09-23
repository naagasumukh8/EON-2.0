"use client";

import React from "react";
import { Sparkles, Terminal, Sliders, Presentation, ExternalLink, ShieldCheck } from "lucide-react";

interface NavbarProps {
  activeTrack: number;
  setActiveTrack: (track: number) => void;
  onOpenApiModal: () => void;
  onOpenPitchModal: () => void;
}

export function Navbar({
  activeTrack,
  setActiveTrack,
  onOpenApiModal,
  onOpenPitchModal,
}: NavbarProps) {
  const tracks = [
    { id: 1, label: "01. AI Systems & Product" },
    { id: 2, label: "02. Consumer Growth" },
    { id: 3, label: "03. Clinical HealthTech" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white text-black shadow-glow">
            {/* Iconic Vercel Triangle */}
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 115 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-white text-sm sm:text-base">
                EON 2.0
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-300 border border-white/[0.08]">
                POLYMATH × EONEXEA
              </span>
            </div>
          </div>
        </div>

        {/* Track Switcher Navigation */}
        <nav className="hidden md:flex items-center space-x-1 rounded-full border border-white/[0.08] bg-[#0c0c0c] p-1">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTrack === track.id
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {track.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* API Registry Modal Button */}
          <button
            onClick={onOpenApiModal}
            className="group flex items-center space-x-2 rounded-full border border-white/[0.12] bg-[#0d0d0d] px-3 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:border-white/30 hover:bg-[#141414] hover:text-white"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Sliders className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
            <span className="hidden sm:inline">15 APIs</span>
            <span className="text-[10px] text-neutral-500 font-mono">READY</span>
          </button>

          {/* Judge Presentation HUD Button */}
          <button
            onClick={onOpenPitchModal}
            className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-white via-neutral-100 to-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-black shadow-sm transition-all hover:shadow-glow hover:opacity-95"
          >
            <Presentation className="h-3.5 w-3.5 text-black" />
            <span className="tracking-tight">Pitch HUD</span>
            <span className="hidden sm:inline-block rounded bg-black/10 px-1 text-[10px] font-mono">
              5m
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Track Bar */}
      <div className="flex md:hidden border-t border-white/[0.06] bg-black px-4 py-2 overflow-x-auto space-x-2">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setActiveTrack(track.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
              activeTrack === track.id
                ? "bg-white text-black font-semibold"
                : "text-neutral-400 border border-white/[0.08]"
            }`}
          >
            {track.label}
          </button>
        ))}
      </div>
    </header>
  );
}

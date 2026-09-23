"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Track1AISystems } from "@/components/tracks/Track1AISystems";
import { Track2ConsumerGrowth } from "@/components/tracks/Track2ConsumerGrowth";
import { Track3HealthTech } from "@/components/tracks/Track3HealthTech";
import { ApiSettingsModal } from "@/components/ApiSettingsModal";
import { PitchDrawer } from "@/components/PitchDrawer";
import { Sparkles, Terminal, Sliders, Presentation, ArrowUpRight } from "lucide-react";

export default function Home() {
  const [activeTrack, setActiveTrack] = useState<number>(1);
  const [activeProblem, setActiveProblem] = useState<string>("invisible_bottleneck");
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);

  // When track changes, update default active problem
  const handleTrackChange = (track: number) => {
    setActiveTrack(track);
    if (track === 1) setActiveProblem("invisible_bottleneck");
    if (track === 2) setActiveProblem("loyalty_illusion");
    if (track === 3) setActiveProblem("adherence_gap");
  };

  return (
    <div className="min-h-screen bg-black text-[#ededed] flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Sticky Vercel Navbar */}
      <Navbar
        activeTrack={activeTrack}
        setActiveTrack={handleTrackChange}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
      />

      {/* Hero Header with Active Problem Switcher */}
      <Hero
        activeTrack={activeTrack}
        setActiveTrack={handleTrackChange}
        activeProblem={activeProblem}
        setActiveProblem={setActiveProblem}
      />

      {/* Main Workbench Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {activeTrack === 1 && <Track1AISystems activeProblem={activeProblem} />}
        {activeTrack === 2 && <Track2ConsumerGrowth activeProblem={activeProblem} />}
        {activeTrack === 3 && <Track3HealthTech activeProblem={activeProblem} />}
      </main>

      {/* Vercel-Style Dark Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-black py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center space-x-3">
            {/* Iconic Triangle */}
            <svg
              className="h-3.5 w-3.5 fill-white"
              viewBox="0 0 115 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>
            <span className="text-neutral-400">EON 2.0 · Polymath Innovae × Eonexea AI</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              API Registry (15 Slots)
            </button>
            <button
              onClick={() => setIsPitchModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Judge Pitch HUD
            </button>
            <a
              href="https://github.com/naagasumukh8/EON-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* 15-API Configuration Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />

      {/* Pitch Presentation HUD Overlay */}
      <PitchDrawer
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        activeProblem={activeProblem}
      />
    </div>
  );
}

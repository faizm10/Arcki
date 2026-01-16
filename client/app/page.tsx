"use client";

import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const LandingGlobe = dynamic(() => import("@/components/LandingGlobe"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />,
});

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Globe Background - Centered */}
      <div className="absolute inset-0 z-0">
        <LandingGlobe />
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-transparent" style={{ height: '50%' }} />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-start pt-[12vh] md:pt-[15vh]">
        <div className="text-center max-w-4xl px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="text-white">Build Cities.</span>
            <br />
            <span className="text-white/80">Replace Buildings.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Edit layouts, swap structures, visualize changes in real-time.
          </p>
          <Button
            size="lg"
            className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-semibold px-8 sm:px-10 py-5 sm:py-6 rounded-full shadow-lg shadow-[#2dd4bf]/25 hover:shadow-xl hover:shadow-[#2dd4bf]/30 transition-all duration-300 text-base sm:text-lg"
            asChild
          >
            <a href="/map">Start Building</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

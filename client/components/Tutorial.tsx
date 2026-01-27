"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Cross2Icon,
  CursorArrowIcon,
  TrashIcon,
  CubeIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  MixerVerticalIcon,
  SunIcon,
  RocketIcon
} from "@radix-ui/react-icons";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Let's get you started with the essentials.",
    icon: <RocketIcon width={24} height={24} />,
    accent: "from-violet-500 to-fuchsia-500",
    position: "center",
  },
  {
    id: "toolbar-select",
    title: "Select",
    description: "Click any building to inspect its properties.",
    icon: <CursorArrowIcon width={24} height={24} />,
    accent: "from-blue-500 to-cyan-500",
    target: '[data-tutorial="toolbar-select"]',
    position: "bottom",
  },
  {
    id: "toolbar-delete",
    title: "Delete",
    description: "Draw around buildings to remove them.",
    icon: <TrashIcon width={24} height={24} />,
    accent: "from-red-500 to-orange-500",
    target: '[data-tutorial="toolbar-delete"]',
    position: "bottom",
  },
  {
    id: "toolbar-insert",
    title: "Insert",
    description: "Add models from the library or upload your own.",
    icon: <CubeIcon width={24} height={24} />,
    accent: "from-emerald-500 to-teal-500",
    target: '[data-tutorial="toolbar-insert"]',
    position: "bottom",
  },
  {
    id: "toolbar-generate",
    title: "Generate",
    description: "Describe anything. AI builds it for you.",
    icon: <MagicWandIcon width={24} height={24} />,
    accent: "from-purple-500 to-pink-500",
    target: '[data-tutorial="toolbar-generate"]',
    position: "bottom",
  },
  {
    id: "search-bar",
    title: "Search",
    description: "Find places or use natural language commands.",
    icon: <MagnifyingGlassIcon width={24} height={24} />,
    accent: "from-amber-500 to-yellow-500",
    target: '[data-tutorial="search-bar"]',
    position: "top",
  },
  {
    id: "map-controls",
    title: "Controls",
    description: "Zoom, rotate, and toggle 2D/3D views.",
    icon: <MixerVerticalIcon width={24} height={24} />,
    accent: "from-sky-500 to-blue-500",
    target: '[data-tutorial="map-controls"]',
    position: "left",
  },
  {
    id: "weather-panel",
    title: "Environment",
    description: "Set the time of day and weather.",
    icon: <SunIcon width={24} height={24} />,
    accent: "from-orange-500 to-amber-500",
    target: '[data-tutorial="weather-panel"]',
    position: "right",
  },
  {
    id: "complete",
    title: "Ready",
    description: "Go build something incredible.",
    icon: <RocketIcon width={24} height={24} />,
    accent: "from-green-500 to-emerald-500",
    position: "center",
  },
];

const STORAGE_KEY = "arcki_tutorial_completed";

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    if (!step.target) {
      setHighlightElement(null);
      setHighlightRect(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(step.target!) as HTMLElement;
      if (element) {
        setHighlightElement(element);
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setTimeout(findElement, 100);
      }
    };

    findElement();

    const updateRect = () => {
      if (highlightElement) {
        const rect = highlightElement.getBoundingClientRect();
        setHighlightRect(rect);
      }
    };

    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);

    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [step.target, currentStep, highlightElement]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onComplete();
  };

  const handleSkip = () => {
    onSkip();
  };

  const getTooltipPosition = () => {
    if (!highlightRect || !step.position || step.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 24;
    const tooltipWidth = 360;
    const tooltipHeight = 240;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top: string | number = "50%";
    let left: string | number = "50%";
    let transform = "translate(-50%, -50%)";

    switch (step.position) {
      case "top":
        const spaceAbove = highlightRect.top;
        if (spaceAbove < tooltipHeight + padding) {
          top = highlightRect.bottom + padding;
          left = Math.max(padding, Math.min(
            highlightRect.left + highlightRect.width / 2,
            viewportWidth - tooltipWidth / 2 - padding
          ));
          transform = "translate(-50%, 0)";
        } else {
          top = highlightRect.top - padding;
          left = Math.max(tooltipWidth / 2 + padding, Math.min(
            highlightRect.left + highlightRect.width / 2,
            viewportWidth - tooltipWidth / 2 - padding
          ));
          transform = "translate(-50%, -100%)";
        }
        break;
      case "bottom":
        const spaceBelow = viewportHeight - highlightRect.bottom;
        if (spaceBelow < tooltipHeight + padding) {
          top = highlightRect.top - padding;
          left = Math.max(padding, Math.min(
            highlightRect.left + highlightRect.width / 2,
            viewportWidth - tooltipWidth / 2 - padding
          ));
          transform = "translate(-50%, -100%)";
        } else {
          top = highlightRect.bottom + padding;
          left = Math.max(tooltipWidth / 2 + padding, Math.min(
            highlightRect.left + highlightRect.width / 2,
            viewportWidth - tooltipWidth / 2 - padding
          ));
          transform = "translate(-50%, 0)";
        }
        break;
      case "left":
        top = Math.max(padding, Math.min(
          highlightRect.top + highlightRect.height / 2,
          viewportHeight - tooltipHeight / 2 - padding
        ));
        left = Math.max(padding, highlightRect.left - padding);
        transform = "translate(-100%, -50%)";
        break;
      case "right":
        top = Math.max(padding, Math.min(
          highlightRect.top + highlightRect.height / 2,
          viewportHeight - tooltipHeight / 2 - padding
        ));
        left = Math.min(viewportWidth - tooltipWidth - padding, highlightRect.right + padding);
        transform = "translate(0, -50%)";
        break;
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Dark overlay with cutout */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] transition-all duration-500 pointer-events-none bg-black/60"
        style={highlightRect ? {
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            ${highlightRect.left - 12}px 100%,
            ${highlightRect.left - 12}px ${highlightRect.top - 12}px,
            ${highlightRect.right + 12}px ${highlightRect.top - 12}px,
            ${highlightRect.right + 12}px ${highlightRect.bottom + 12}px,
            ${highlightRect.left - 12}px ${highlightRect.bottom + 12}px,
            ${highlightRect.left - 12}px 100%,
            100% 100%,
            100% 0%
          )`,
        } : undefined}
      />

      {/* Animated highlight ring */}
      {highlightRect && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-2xl transition-all duration-500"
          style={{
            top: highlightRect.top - 12,
            left: highlightRect.left - 12,
            width: highlightRect.width + 24,
            height: highlightRect.height + 24,
          }}
        >
          {/* Gradient border */}
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.accent} opacity-60`}
            style={{
              padding: "2px",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          {/* Glow */}
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.accent} opacity-20 blur-xl`}
          />
        </div>
      )}

      {/* Main card */}
      <div
        className="fixed z-[10000] w-[360px] pointer-events-auto transition-all duration-500"
        style={tooltipStyle}
      >
        {/* Card with gradient border */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gradient border effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} opacity-50`} />

          {/* Inner card */}
          <div className="relative m-[1px] rounded-2xl bg-black/95 backdrop-blur-xl overflow-hidden">
            {/* Top accent line */}
            <div className={`h-1 w-full bg-gradient-to-r ${step.accent}`} />

            {/* Content */}
            <div className="p-6">
              {/* Icon and title row */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.accent} flex items-center justify-center text-white shadow-lg`}>
                  {step.icon}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-white font-bold text-2xl tracking-tight font-serif italic">{step.title}</h3>
                </div>
                <button
                  onClick={handleSkip}
                  className="flex-shrink-0 p-2 -mt-1 -mr-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Cross2Icon width={16} height={16} />
                </button>
              </div>

              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed mb-6 pl-16">
                {step.description}
              </p>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${step.accent} transition-all duration-500 rounded-full`}
                      style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-xs font-medium tabular-nums">
                    {currentStep + 1}/{TUTORIAL_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <ArrowLeftIcon width={14} height={14} />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r ${step.accent} text-white hover:opacity-90 transition-all text-sm font-semibold shadow-lg`}
                >
                  {isLastStep ? "Let's Go" : "Next"}
                  <ArrowRightIcon width={14} height={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function shouldShowTutorial(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "true";
}

export function resetTutorial() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

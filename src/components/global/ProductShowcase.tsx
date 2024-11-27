"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ProductShowcase = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const dashboardScreenshots = [
    {
      title: "AI-Powered Relationship Analytics",
      description:
        "Get deep insights into your relationship patterns with our advanced analytics dashboard",
      image: "/snapshots/1.png",
    },
    {
      title: "Interactive Connection Timeline",
      description:
        "Visualize your journey together with our beautiful timeline interface",
      image: "/snapshots/2.png",
    },
    {
      title: "Real-time Mood Tracking",
      description:
        "Stay connected with intelligent emotion tracking and suggestions",
      image: "/snapshots/3.png",
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-gray-50 to-rose-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-rose-300/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-700" />

          {/* Main showcase container */}
          <div className="relative">
            <div className="flex items-center justify-between mb-12">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {dashboardScreenshots[activeSlide].title}
                </h3>
                <p className="text-xl text-gray-600">
                  {dashboardScreenshots[activeSlide].description}
                </p>
              </div>
              <div className="flex gap-4 ml-8">
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() =>
                    setActiveSlide((prev) =>
                      prev === 0 ? dashboardScreenshots.length - 1 : prev - 1
                    )
                  }
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full p-3"
                  onClick={() =>
                    setActiveSlide((prev) =>
                      prev === dashboardScreenshots.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Screenshot showcase with floating animation and shimmer */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500"
              style={{
                animation: "floatAnimation 6s ease-in-out infinite",
              }}
            >
              <style jsx>{`
                @keyframes floatAnimation {
                  0% {
                    transform: translate(0, 0) rotate(0deg);
                  }
                  25% {
                    transform: translate(5px, 10px) rotate(0.5deg);
                  }
                  50% {
                    transform: translate(0, 0) rotate(0deg);
                  }
                  75% {
                    transform: translate(-5px, 8px) rotate(-0.5deg);
                  }
                  100% {
                    transform: translate(0, 0) rotate(0deg);
                  }
                }

                @keyframes shimmer {
                  0% {
                    background-position: -200% 0;
                  }
                  100% {
                    background-position: 200% 0;
                  }
                }

                @keyframes gradientAnimation {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }

                .shimmer-border {
                  position: absolute;
                  inset: 0;
                  padding: 1px; /* Default border thickness */
                  background: linear-gradient(
                    90deg,
                    hsl(var(--primary)) 0%,
                    hsl(var(--primary) / 0.3) 50%,
                    hsl(var(--primary)) 100%
                  );
                  background-size: 200% 100%;
                  animation: shimmer 3s linear infinite;
                  mask: linear-gradient(#fff 0 0) content-box,
                    linear-gradient(#fff 0 0);
                  mask-composite: exclude;
                }

                @media (max-width: 768px) {
                  .shimmer-border {
                    padding: 0.5px; /* Thinner border for mobile devices */
                  }
                }
                .gradient-bg {
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(
                    45deg,
                    rgba(244, 63, 94, 0.05) 0%,
                    rgba(168, 85, 247, 0.05) 30%,
                    rgba(244, 63, 94, 0.05) 70%,
                    rgba(168, 85, 247, 0.05) 100%
                  );
                  background-size: 400% 400%;
                  animation: gradientAnimation 15s ease infinite;
                }
              `}</style>
              {/* Layered background effects */}
              <div className="gradient-bg" />
              <div className="shimmer-border" />
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/10 to-purple-600/10 mix-blend-overlay" />

              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="absolute top-0 w-full h-8 bg-gray-900/5 backdrop-blur-sm" />
                <img
                  src={dashboardScreenshots[activeSlide].image}
                  alt={dashboardScreenshots[activeSlide].title}
                  className="w-full h-full object-cover p-10 transition-opacity duration-500"
                  style={{
                    opacity: 0.95,
                  }}
                />
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-8 gap-3">
              {dashboardScreenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? "bg-rose-600 w-12"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;

import React from "react";

interface HighlightCurveProps {
  children?: React.ReactNode;
  className?: string;
  svgClassName?: string;
}

export const HighlightCurve: React.FC<HighlightCurveProps> = ({
  children,
  className = "",
  svgClassName = "absolute -bottom-2 right-0 w-full h-4 text-primary pointer-events-none drop-shadow-sm",
}) => {
  // SVG paths for the sketchy, hand-drawn look from the image
  // It features a long top line and a slightly shorter bottom line.
  const svgContent = (
    <svg
      className={svgClassName}
      viewBox="0 0 200 24"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="roughpaper" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      
      {/* Top line - long */}
      <path
        d="M 5,8 C 45,6 145,10 195,6"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#roughpaper)"
        className="stroke-draw-1"
        style={{
          strokeDasharray: 250,
          strokeDashoffset: 250,
          animation: "drawSketch 1.2s cubic-bezier(0.2, 0.6, 0.3, 1) forwards",
        }}
      />
      {/* Bottom line - shorter */}
      <path
        d="M 35,16 C 85,18 125,14 165,16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#roughpaper)"
        className="stroke-draw-2"
        style={{
          strokeDasharray: 200,
          strokeDashoffset: 200,
          animation: "drawSketch 1s cubic-bezier(0.2, 0.6, 0.3, 1) 0.4s forwards",
        }}
      />
    </svg>
  );

  if (!children) {
    return svgContent;
  }

  return (
    <span className={`relative inline-block text-primary ${className}`}>
      {children}
      {svgContent}
    </span>
  );
};


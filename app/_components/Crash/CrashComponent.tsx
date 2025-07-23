"use client";

import { useEffect, useRef } from "react";
import { useCrashStore } from "@/app/_store/crashStore";

interface LimboComponentProps {
  onFinish?: (random: number, isWin: boolean) => void;
}

export default function LimboComponent({ onFinish }: LimboComponentProps) {
  const {
    isRunning,
    setIsRunning,
    displayMultiplier,
    recentWins,
    multiplier: targetMultiplier,
  } = useCrashStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
  };

  const boxMarkers = Array.from({ length: 5 }, (_, i) => ({
    label: `${5 - i}x`,
    value: 5 - i,
  }));

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 📏 Setup for high-DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);



    // 🎯 Left Side Boxes: 5x → 1x
    const isSmallScreen = window.innerWidth < 768;
    const xOffset = isSmallScreen ? 10 : 20;
    const numBoxes = 5;
    const paddingTop = isSmallScreen ? 18 : 40;
    const paddingBottom = paddingTop;
    const spacing = (height - paddingTop - paddingBottom) / (numBoxes - 1);

    const sideBoxWidth = isSmallScreen ? 24 : 60;
    const sideBoxHeight = isSmallScreen ? 16 : 30;
    const fontSize = isSmallScreen ? 8 : 16;
    const radius = isSmallScreen ? 5 : 8;

    for (let i = 0; i < boxMarkers.length; i++) {
      const { label } = boxMarkers[i];
      const y = paddingTop + i * spacing;

      ctx.fillStyle = "#253742";
      drawRoundedRect(ctx, xOffset, y - sideBoxHeight / 2, sideBoxWidth, sideBoxHeight, radius);

      ctx.fillStyle = "white";
      ctx.font = `${fontSize}px Outfit`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, xOffset + sideBoxWidth / 2, y + 1);
    }

  };


  useEffect(() => {
    drawCanvas();
    window.addEventListener("resize", drawCanvas);
    return () => window.removeEventListener("resize", drawCanvas);
  }, []);

  useEffect(()=>{
    drawCanvas();
  },[isRunning])

  useEffect(() => {
    if (isRunning) {
      setTimeout(()=>{
        setIsRunning(false);
        onFinish?.(displayMultiplier, displayMultiplier >= targetMultiplier);
      },2000)
        
    }
  }, [isRunning, onFinish, setIsRunning, targetMultiplier]);

  const resultColor =
    !isRunning && displayMultiplier >= targetMultiplier
      ? "text-success"
      : "text-white";

  return (
    <div className="w-full bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-3 md:p-6 lg:p-8 flex flex-col">
      <div className="flex flex-row-reverse items-center w-full justify-end gap-2 overflow-x-auto no-scrollbar">
        {recentWins.slice(-17).map((item, i) => (
          <div key={i} className="flex-shrink-0">
            <div
              className={`w-8 h-4 px-6 py-4 rounded-full flex items-center justify-center ${item.isWin ? "bg-success text-black" : "bg-neutral-700 text-white"
                }`}
            >
              <span className="text-xs font-bold">
                {item.randomNumber.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 w-full flex items-center justify-center mt-10">
        {/* 👇 Responsive Canvas with locked aspect ratio */}
        <div className="w-full aspect-[16/9]">
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-[#0F212E] rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

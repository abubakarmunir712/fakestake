"use client";

import { useEffect, useRef, useState } from "react";
import { useCrashStore } from "@/app/_store/crashStore";

interface LimboComponentProps {
  onFinish?: (random: number, isWin: boolean) => void;
}

export default function LimboComponent({ onFinish }: LimboComponentProps) {
  const {
    isRunning,
    displayMultiplier,
    recentWins,
    multiplier: targetMultiplier,
  } = useCrashStore();



  // Helper function to draw rounded rectangles on canvas
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


  const setupCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {

    // 📏 Setup for high-DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store animation id for requestAnimationFrame
  let animationId: number;


  // Initial curve of the graph
  let curviness = 0

  // Display multiplier 
  let screenMultiplier: number = 1

  let midXoffset = 0

  //X displacement for graph
  let xPos: number = 0;
  let yPos: number = 0;

  let divisionFactor = 400;
  let isFinished = false

  // Store Y markers
  const markersInfo: { label: string; value: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) {
    markersInfo.push({
      label: `${5 - i}x`,
      value: 5 - i,
      y: 0,
    });
  }

  const drawCanvas = () => {
    if (isRunning) {

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) {
        return
      }
      if (!canvas) {
        return
      }
      // Setup Canvas 
      setupCanvas(canvas, ctx)

      // Variables Declaration here 
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const isSmallScreen = window.innerWidth < 768;
      const xOffset = isSmallScreen ? 10 : 20;
      const paddingY = isSmallScreen ? 18 : 40;
      const numBoxes = 5;
      // Vertical Spacing between markers
      const spacing = (height - paddingY - paddingY) / (numBoxes - 1);

      // Optimize spacing based on device
      const sideBoxWidth = isSmallScreen ? 24 : 60;
      const sideBoxHeight = isSmallScreen ? 16 : 30;
      const fontSize = isSmallScreen ? 8 : 16;
      const radius = isSmallScreen ? 5 : 8;


      for (let i = 0; i < markersInfo.length; i++) {
        let { label } = markersInfo[i];
        const y = paddingY + i * spacing;
        const centerY = y; // already center since you're subtracting half height for drawing

        ctx.fillStyle = "#253742";
        drawRoundedRect(ctx, xOffset, y - sideBoxHeight / 2, sideBoxWidth, sideBoxHeight, radius);

        ctx.fillStyle = "white";
        ctx.font = `${fontSize}px Outfit`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (screenMultiplier > 5) {
          label = `${(screenMultiplier - i).toFixed()}x`
        }
        ctx.fillText(label, xOffset + sideBoxWidth / 2, centerY + 1);

        // store center position
        markersInfo[i].y = centerY;
      }

      if (screenMultiplier > 5) {
        isSmallScreen ? curviness += 0.1 : curviness += 0.1
      }
      else {
        if (yPos == 0 && xPos == 0) {
          yPos = markersInfo[4].y
          xPos = xOffset + sideBoxWidth * 1.5
        }
        else {
          yPos -= (height) / 400
          xPos += (width) / 400
          isSmallScreen ? curviness += 0.01 : curviness += 0.1
          if (curviness > 100) {
            midXoffset += 0.8
          }
        }
      }

      // Chnage division factor to increase speed as time passes
      if (screenMultiplier > 5) {
        if (screenMultiplier < 10) {
          divisionFactor = 360
        }
        else if (screenMultiplier > 10 && screenMultiplier < 20) {
          divisionFactor = 200
        }

        else if (screenMultiplier > 20 && screenMultiplier < 30) {
          divisionFactor = 100

        }

        else if (screenMultiplier > 30 && screenMultiplier < 40) {
          divisionFactor = 50

        }

        else if (screenMultiplier > 50 && screenMultiplier < 60) {
          divisionFactor = 30

        }
        else if (screenMultiplier > 70 && screenMultiplier < 80) {
          divisionFactor = 20

        }

        else if (screenMultiplier > 90 && screenMultiplier < 100) {
          divisionFactor = 10

        }

        else if (screenMultiplier > 100 && screenMultiplier < 110) {
          divisionFactor = 5

        }
      }
      // === 1. Fill under the curve ===
      ctx.beginPath();
      const startX = xOffset + sideBoxWidth * 1.5;
      const baseY = markersInfo[4].y;
      const midX = ((startX + xPos) / 2) + midXoffset;
      const midY = (baseY + yPos) / 2 + curviness;

      ctx.moveTo(startX, baseY); // left base point
      ctx.quadraticCurveTo(midX, midY, xPos, yPos); // curve
      ctx.lineTo(xPos, baseY); // right base
      ctx.lineTo(startX, baseY); // close back to start
      ctx.closePath();

      ctx.fillStyle = "#FF9D00";
      ctx.fill(); // fill first, no stroke here


      // === 2. Draw curve line on top ===
      ctx.beginPath();
      ctx.moveTo(startX, baseY);
      ctx.quadraticCurveTo(midX, midY, xPos, yPos);

      ctx.strokeStyle = "white";
      ctx.lineWidth = isSmallScreen ? 4 : 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(xPos, yPos,3, 0, 2 * Math.PI); // x=100, y=100, radius=50
      ctx.stroke();


      screenMultiplier += 5 / divisionFactor;


      if (!isFinished) {
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = `bold ${isSmallScreen ? '30' : '60'}px Outfit`;
        ctx.fillText(`${screenMultiplier.toFixed(2)}x`, canvas.width / 2, canvas.height / 2.4);
      }


      if (screenMultiplier < displayMultiplier && screenMultiplier < targetMultiplier) {
        // if (true){
        animationId = requestAnimationFrame(drawCanvas)
      }
      else if (!isFinished) {
        isFinished = true
        animationId = requestAnimationFrame(drawCanvas)
      }
      else {
        let didWin = displayMultiplier >= targetMultiplier;
        let color = didWin ? '#00C915' : '#EF4444'
        let finalvalue = didWin ? targetMultiplier : displayMultiplier
        let emoji = `${didWin ? '💵' : '💥'}`

        ctx.fillStyle = color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = `bold ${isSmallScreen ? '30' : '60'}px Outfit`;
        ctx.fillText(`${emoji} ${finalvalue}x`, canvas.width / 2, canvas.height / 2.4);
        cancelAnimationFrame(animationId)
        onFinish?.(displayMultiplier, didWin)
      }
    }
  }

  useEffect(() => {
    window.addEventListener("resize", () => drawCanvas());
    drawCanvas()
    return () => window.removeEventListener("resize", drawCanvas);
  }, [isRunning]);


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

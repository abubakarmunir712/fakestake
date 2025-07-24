"use client";
import React, { useState, useRef } from "react";
import CrashComponent from "./CrashComponent";
import CrashConfig from "./CrashConfig";
import { useCrashStore } from "@/app/_store/crashStore";
import { useAuthStore } from "@/app/_store/commonStore";

export default function CrashContainer() {
  const {
    setIsRunning,
    displayMultiplier,
    setDisplayMultiplier,
    recentWins,
    setRecentWins,
    multiplier,
  } = useCrashStore();
  const { user, token, fetchUser } = useAuthStore();

  // — remove setRecentWins from here —
  const handleBet = async (amount: number) => {
    if (!user || !token) return;
    const res = await fetch("/api/limbo/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        betAmount: amount,
        targetMultiplier: multiplier,
        username: user.username,
      }),
    });
    const data = await res.json();
    setDisplayMultiplier(data.randomMultiplier);
    setIsRunning(true);
    // 👉 no longer call setRecentWins here
  };

  // called by LimboComponent when spin finishes
  const handleFinish = (random: number, isWin: boolean) => {
    if (!user || !token) return;
    fetchUser(token);
    setRecentWins([
      ...recentWins,
      { isWin, randomNumber: random },
    ]);
    setIsRunning(false)
  };

  return (
    <div className="flex flex-col xl:flex-row bg-background gap-4 xl:gap-8 p-4 w-full max-w-[100%] xl:max-w-[90%] mx-auto">
      <div className="w-full xl:w-1/3 bg-primary">
        <CrashConfig onBet={handleBet} />
      </div>
      <div className="w-full xl:w-2/3 h-fit">
        <CrashComponent onFinish={handleFinish} />
      </div>
    </div>
  );
}
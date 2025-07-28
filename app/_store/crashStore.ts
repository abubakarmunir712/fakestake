import { create } from "zustand";

type CrashStore = {
    isRunning: boolean;
    setIsRunning: (value: boolean) => void;
    displayMultiplier: number; // Returned from server
    setDisplayMultiplier: (value: number) => void;
    multiplier: number; // User target multiplier
    setMultiplier: (value: number) => void;
    recentWins: { isWin: boolean; randomNumber: number }[];
    setRecentWins: (value: { isWin: boolean; randomNumber: number }[]) => void;
    betAmount: number;
    setBetAmount: (value: number) => void;
    screenMultiplierS: number;
    setScreenMultiplierS: (value: number) => void

};

export const useCrashStore = create<CrashStore>()((set) => ({
    isRunning: false,
    setIsRunning: (value) => set({ isRunning: value }),
    displayMultiplier: 1,
    setDisplayMultiplier: (value) => set({ displayMultiplier: value }),
    multiplier: 2,
    setMultiplier: (value) => set({ multiplier: value }),
    recentWins: [],
    setRecentWins: (value) => set({ recentWins: value }),
    betAmount: 0,
    setBetAmount: (value) => set({ betAmount: value }),
    screenMultiplierS: 1,
    setScreenMultiplierS: (value) => set({ screenMultiplierS: value }),

}));

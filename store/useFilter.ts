import { create } from "zustand";
import { persist } from "zustand/middleware";

export const RADIUS_OPTIONS = [5, 10, 20, 50] as const;
export type Radius = (typeof RADIUS_OPTIONS)[number];

export type WaterType = "alla" | "sjö" | "hav";

export const WATER_TYPE_IDS: Record<WaterType, number[] | null> = {
  alla: null,
  sjö: [3],
  hav: [1],
};

type FilterState = {
  radius: Radius;
  waterType: WaterType;
};

type FilterActions = {
  setRadius: (radius: Radius) => void;
  setWaterType: (waterType: WaterType) => void;
  reset: () => void;
};

const initialState: FilterState = {
  radius: 20,
  waterType: "alla",
};

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    (set) => ({
      ...initialState,
      setRadius: (radius) => set({ radius }),
      setWaterType: (waterType) => set({ waterType }),
      reset: () => set(initialState),
    }),
    { name: "filter-store" },
  ),
);

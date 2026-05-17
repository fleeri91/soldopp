import { MunicipalityName } from "@/constants/municipalities";
import { BathingWater } from "@/types/BathingWaters/BathingWaters";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MapFilterState = {
  municipality: MunicipalityName | null;
  selectedBathingWater: BathingWater | null;
};

type MapFilterActions = {
  setMunicipality: (value: MunicipalityName | null) => void;
  setBathingWater: (value: BathingWater | null) => void;
  reset: () => void;
};

type MapFilterStore = MapFilterState & MapFilterActions;

const initialState: MapFilterState = {
  municipality: null,
  selectedBathingWater: null,
};

export const useMapFilterStore = create<MapFilterStore>()(
  persist(
    (set) => ({
      ...initialState,
      setMunicipality: (value) => set({ municipality: value }),
      setBathingWater: (value) => set({ selectedBathingWater: value }),
      reset: () => set(initialState),
    }),
    {
      name: "map-filter-store",
      partialize: (state) => ({ municipality: state.municipality }),
    },
  ),
);

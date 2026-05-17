export interface BathingWaterResult {
  results: Result[];
}

export interface Result {
  algalId: number;
  algalIdText: string;
  escherichiaColiAssessId: number;
  escherichiaColiAssessIdText: string;
  escherichiaColiCount: number;
  escherichiaColiPrefix: string;
  intestinalEnterococciAssessId: number;
  intestinalEnterococciAssessIdText: string;
  intestinalEnterococciCount: number;
  intestinalEnterococciPrefix: string;
  sampleAssessId: number;
  sampleAssessIdText: string;
  sampleComplete: boolean;
  takenAt: string;
  waterTemp: string;
  weatherId?: number;
  weatherIdText?: string;
}

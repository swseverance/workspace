// Shared by the Angular app and the API handlers in src/server. Types only.

export type WeightEntry = {
  id: string;
  /** YYYY-MM-DD; also the entry's id. */
  date: string;
  weight: number;
};

export type ListWeightsResponseBody = {
  /** Newest first. */
  entries: WeightEntry[];
};

export type UpsertWeightRequestBody = {
  weight: number;
};

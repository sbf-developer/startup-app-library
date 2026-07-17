export type Stage = "Seed" | "Series A" | "Series B" | "Growth" | "Scaleup";

export interface Source {
  name: string;
  url: string;
  verified: boolean;
}

export interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  sector: string;
  stage: Stage;
  location: string;
  founded: number;
  website: string;
  founders: string[];
  team: string;
  score: number;
  source: Source;
  signals: string[];
  updatedAt: string;
}

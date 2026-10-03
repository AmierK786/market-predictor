import fs from "fs";
import path from "path";

export type Direction = "up" | "down" | "flat";

export type ModelMetrics = {
  mae: number | null;
  directionalAccuracy: number | null;
  rankCorrelation: number | null;
  n: number;
};

export type ModelName = "zero" | "momentum" | "ridge";

export type Metrics = Record<ModelName, ModelMetrics>;

export type ScorecardRow = {
  symbol: string;
  name: string;
  asOf: string;
  lastClose: number;
  forecastReturn: number;
  direction: Direction;
  metrics: Metrics;
  strategyMultiple: number;
  buyHoldMultiple: number;
};

export type TickerDetail = ScorecardRow & {
  coefficients: { feature: string; weight: number }[];
  prices: { date: string; close: number }[];
  equity: { date: string; model: number; buyHold: number }[];
};

export type Results = {
  generatedAt: string;
  horizonDays: number;
  trainDays: number;
  testDays: number;
  gapDays: number;
  costBps: number;
  universe: string[];
  scorecard: ScorecardRow[];
  tickers: Record<string, TickerDetail>;
};

export function loadResults(): Results | null {
  const file = path.join(process.cwd(), "data", "results.json");
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as Results;
}

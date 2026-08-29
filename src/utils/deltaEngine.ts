export type Tier = "Elite" | "Advanced" | "Intermediate" | "Beginner";

export interface NormalizedScore {
  rawDelta: number;
  multiplier: number;
  finalScore: number;
}

export function calculateNormalizedScore(
  baselineSeconds: number,
  currentSeconds: number
): NormalizedScore {
  // 1. Calculate raw percentage improvement
  const rawDelta = ((baselineSeconds - currentSeconds) / baselineSeconds) * 100;

  // 2. Apply physiological ceiling multiplier
  let multiplier = 1.0;
  if (baselineSeconds <= 390) multiplier = 10.0; // Elite (<= 6:30 min/mile)
  else if (baselineSeconds <= 540) multiplier = 3.5; // Advanced (6:31 - 9:00)
  else if (baselineSeconds <= 720) multiplier = 1.8; // Intermediate (9:01 - 12:00)
  else multiplier = 1.0; // Beginner (12:01+)

  // 3. Return final formatted score
  return {
    rawDelta: parseFloat(rawDelta.toFixed(2)),
    multiplier,
    finalScore: parseFloat((rawDelta * multiplier).toFixed(2)),
  };
}

export function multiplierFromBaseline(baselineSeconds: number): number {
  return calculateNormalizedScore(baselineSeconds, baselineSeconds).multiplier;
}

export function tierFromBaseline(baselineSeconds: number): Tier {
  if (baselineSeconds <= 390) return "Elite";
  if (baselineSeconds <= 540) return "Advanced";
  if (baselineSeconds <= 720) return "Intermediate";
  return "Beginner";
}

export function formatPace(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

// src/lib/winEngine.ts
export type Prize = {
  value: number;
  label: string;
  weight: number; // relative weight
  isBig?: boolean;
};

export type SpinConfig = {
  prizes: Prize[];
  bigWinEvery: number; // force big win after N non-big spins
};

export function pickWeighted(prizes: Prize[]) {
  const total = prizes.reduce((s, p) => s + p.weight, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const p of prizes) {
    acc += p.weight;
    if (r <= acc) return p;
  }
  return prizes[prizes.length - 1];
}

export function computeSpinResult(params: {
  config: SpinConfig;
  nonBigStreak: number; // how many spins since last big win
}) {
  const { config, nonBigStreak } = params;

  const bigPrize = config.prizes.find((p) => p.isBig);
  if (!bigPrize) {
    // fallback to normal weighted
    return pickWeighted(config.prizes);
  }

  // ✅ pity timer
  if (nonBigStreak >= config.bigWinEvery - 1) {
    return bigPrize;
  }

  return pickWeighted(config.prizes);
}

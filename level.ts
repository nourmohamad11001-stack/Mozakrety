export function levelInfo(points: number) {
  let level = 1;
  let cum = 0;
  let gap = 100;
  while (points >= cum + gap) {
    cum += gap;
    level++;
    gap += 50;
  }
  return {
    level,
    pointsInLevel: points - cum,
    neededForNext: gap,
    progress: Math.min(1, (points - cum) / gap),
  };
}

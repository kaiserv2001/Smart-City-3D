export function seededRand(seed) {
  const x = Math.sin(seed + 1) * 43758.5453
  return x - Math.floor(x)
}

export function generateBuildings() {
  const list = [], gridSize = 10, blockSpacing = 12
  for (let gx = -gridSize; gx <= gridSize; gx++) {
    for (let gz = -gridSize; gz <= gridSize; gz++) {
      if (gx % 4 === 0 || gz % 4 === 0) continue
      if (Math.abs(gx) < 2 && Math.abs(gz) < 2) continue

      const seed = gx * 100 + gz + 5000
      const r  = seededRand(seed)
      const r2 = seededRand(seed + 100)
      const r3 = seededRand(seed + 200)
      const r4 = seededRand(seed + 300)
      const r5 = seededRand(seed + 400)

      const x = gx * blockSpacing + (seededRand(gx * 31 + gz) - 0.5) * 3
      const z = gz * blockSpacing + (seededRand(gx * 17 + gz * 7) - 0.5) * 3

      const baseW  = 3 + r  * 6
      const baseD  = 3 + r2 * 6

      // Center-biased heights: downtown CBD is much taller than suburbs
      const distFromCenter = Math.sqrt(gx * gx + gz * gz)
      const heightBias     = Math.max(0.28, 1.0 - (distFromCenter / (gridSize * 1.5)) * 0.70)
      const totalH         = Math.max(5, (5 + r3 * 48) * heightBias)

      // Center-biased types: glass/corporate cluster downtown, brick/residential on outskirts
      const centerFactor = Math.max(0, 1.0 - distFromCenter / (gridSize * 1.05))
      const glassChance  = 0.13 + centerFactor * 0.34
      // 0=glass 1=concrete 2=corporate 3=brick 4=residential
      const typeIdx =
        r4 < glassChance                    ? 0 :
        r4 < glassChance + 0.20             ? 1 :
        r4 < glassChance + 0.20 + 0.24      ? 2 :
        r4 < glassChance + 0.20 + 0.24 + 0.21 ? 3 : 4
      const variantIdx = Math.floor(r5 * 5)

      const stepped = totalH > 18
      const t1H = stepped ? totalH * 0.45 : totalH
      const t2H = stepped ? totalH * 0.33 : 0
      const t3H = stepped ? totalH * 0.22 : 0
      const t2W = baseW * 0.72, t2D = baseD * 0.72
      const t3W = baseW * 0.48, t3D = baseD * 0.48

      list.push({ x, z, typeIdx, variantIdx, baseW, baseD, t1H, t2H, t3H, t2W, t2D, t3W, t3D, stepped, totalH })
    }
  }
  return list
}

import { DnaBase, Environment, OrganismStats, DnaCombo } from '../types';

// --- Combo Definitions ---
export const COMBOS: DnaCombo[] = [
  // Double Bonds (Strong elemental alignment)
  { name: '热能核心', sequence: 'AA', description: '大幅提升耐热性', effect: { heatRes: 25 }, color: 'text-red-400' },
  { name: '极寒晶格', sequence: 'TT', description: '大幅提升耐寒性', effect: { coldRes: 25 }, color: 'text-cyan-400' },
  { name: '酸性屏障', sequence: 'CC', description: '大幅提升抗毒性', effect: { toxinRes: 25 }, color: 'text-lime-400' },
  { name: '泰坦装甲', sequence: 'GG', description: '大幅提升物理防御', effect: { physicalStr: 25 }, color: 'text-orange-400' },
  
  // Functional Pairs
  { name: '温控循环', sequence: 'AT', description: '平衡耐热与耐寒', effect: { heatRes: 15, coldRes: 15 }, color: 'text-purple-400' },
  { name: '硬化薄膜', sequence: 'CG', description: '平衡抗毒与防御', effect: { toxinRes: 15, physicalStr: 15 }, color: 'text-yellow-400' },
  
  // Triplets (Advanced)
  { name: '太阳之心', sequence: 'AAA', description: '极致耐热', effect: { heatRes: 50 }, color: 'text-red-500' },
  { name: '绝对零度', sequence: 'TTT', description: '极致耐寒', effect: { coldRes: 50 }, color: 'text-cyan-500' },
  { name: '生化反应堆', sequence: 'GCG', description: '利用毒素强化防御', effect: { toxinRes: 30, physicalStr: 30 }, color: 'text-emerald-400' },
];

// --- Core Math ---

export const calculateStats = (dna: DnaBase[]): OrganismStats => {
  const stats: OrganismStats = {
    heatRes: 0,
    coldRes: 0,
    toxinRes: 0,
    physicalStr: 0,
  };

  // 1. Base Stats (Linear)
  // Scaled: Each base gives +12 (was 10) to help keep up with difficulty
  dna.forEach(base => {
    switch (base) {
      case DnaBase.A: stats.heatRes += 12; break;
      case DnaBase.T: stats.coldRes += 12; break;
      case DnaBase.C: stats.toxinRes += 12; break;
      case DnaBase.G: stats.physicalStr += 12; break;
    }
  });

  // 2. Combo Bonuses
  const dnaString = dna.join('');
  COMBOS.forEach(combo => {
    // Count occurrences (non-overlapping for simplicity, or we can use regex)
    // Using simple split for counting non-overlapping occurrences
    const count = dnaString.split(combo.sequence).length - 1;
    if (count > 0) {
      if (combo.effect.heatRes) stats.heatRes += combo.effect.heatRes * count;
      if (combo.effect.coldRes) stats.coldRes += combo.effect.coldRes * count;
      if (combo.effect.toxinRes) stats.toxinRes += combo.effect.toxinRes * count;
      if (combo.effect.physicalStr) stats.physicalStr += combo.effect.physicalStr * count;
    }
  });

  return stats;
};

export const calculateDamagePrediction = (stats: OrganismStats, env: Environment) => {
  let damage = 0;
  
  // Environment Threats vs Stats
  // Formula: Damage = (Threat - Resistance) * Multiplier
  // We clamp minimal damage to 0 if resistance > threat
  
  // 1. Heat Damage (Temp > 50 considered hot)
  if (env.temperature > 50) {
    const heatThreat = env.temperature; // 50-100
    const diff = Math.max(0, heatThreat - stats.heatRes);
    damage += diff * 1.2; 
  }

  // 2. Cold Damage (Temp < 50 considered cold)
  if (env.temperature <= 50) {
    const coldThreat = 100 - env.temperature; // 50-100
    const diff = Math.max(0, coldThreat - stats.coldRes);
    damage += diff * 1.2;
  }

  // 3. Toxin Damage
  if (env.toxicity > 0) {
    const diff = Math.max(0, env.toxicity - stats.toxinRes);
    damage += diff * 1.0;
  }

  // 4. Radiation/Physical Damage (Scarcity acts as physical stress/radiation)
  // We combine Radiation and Scarcity into "Physical/Armor" check
  const physicalThreat = Math.max(env.radiation, env.resourceScarcity);
  const diff = Math.max(0, physicalThreat - stats.physicalStr);
  damage += diff * 1.0;

  // Rounding
  return Math.ceil(damage);
};

export const findActiveCombos = (dna: DnaBase[]): DnaCombo[] => {
  const dnaString = dna.join('');
  return COMBOS.filter(combo => dnaString.includes(combo.sequence));
};

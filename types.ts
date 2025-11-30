export enum DnaBase {
  A = 'A', // Adenine - Heat/Fire Resistance
  T = 'T', // Thymine - Cold/Ice Resistance
  C = 'C', // Cytosine - Toxin/Acid Resistance
  G = 'G', // Guanine - Physical/Armor Strength
}

export interface Environment {
  name: string;
  description: string;
  temperature: number; // 0-100 (0=Freezing, 100=Inferno)
  toxicity: number;    // 0-100
  radiation: number;   // 0-100
  resourceScarcity: number; // 0-100
  imgPrompt: string;
}

export interface OrganismStats {
  heatRes: number;
  coldRes: number;
  toxinRes: number;
  physicalStr: number;
}

export interface DnaCombo {
  name: string;
  sequence: string;
  description: string;
  effect: Partial<OrganismStats>;
  color: string;
}

export interface EvolutionResult {
  survived: boolean; // True if HP > 0 after damage
  damageTaken: number;
  hpRemaining: number;
  organismName: string;
  description: string;
  narrative: string;
  acquiredTraits: string[];
  mutationFeedback: string;
}

export enum GamePhase {
  INTRO = 'INTRO',
  SELECT_SPECIES = 'SELECT_SPECIES',
  SCANNING = 'SCANNING', // Fetching environment
  ENGINEERING = 'ENGINEERING', // Player editing DNA
  EVOLVING = 'EVOLVING', // Processing with AI
  RESULT = 'RESULT',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER'
}

export interface SpeciesTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  initialDna: DnaBase[];
  color: string;
}

export interface GameState {
  phase: GamePhase;
  round: number;
  maxRounds: number;
  score: number;
  hp: number;
  maxHp: number;
  environment: Environment | null;
  dnaSequence: DnaBase[];
  confirmedDnaSequence: DnaBase[]; // The DNA state at the start of the round (for mutation limits)
  newSlotsCount: number; // How many slots are "new" this round (fully editable)
  lastResult: EvolutionResult | null;
  history: EvolutionResult[];
}
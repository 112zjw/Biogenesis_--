import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DnaBase, Environment, EvolutionResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// ------------------------------------------------------------------
// 1. Generate Environment
// ------------------------------------------------------------------

const environmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative name of the planet or biome in Chinese" },
    description: { type: Type.STRING, description: "Atmospheric and dangerous description in Chinese" },
    temperature: { type: Type.NUMBER, description: "0 to 100" },
    toxicity: { type: Type.NUMBER, description: "0 to 100" },
    radiation: { type: Type.NUMBER, description: "0 to 100" },
    resourceScarcity: { type: Type.NUMBER, description: "0 to 100" },
    imgPrompt: { type: Type.STRING, description: "A visual prompt for a background" }
  },
  required: ["name", "description", "temperature", "toxicity", "radiation", "resourceScarcity", "imgPrompt"]
};

export const generateEnvironment = async (round: number, maxRounds: number): Promise<Environment> => {
  try {
    // Calculate difficulty tier - INCREASED DIFFICULTY
    let minVal = 0;
    let maxVal = 100;

    if (round <= 2) {
      minVal = 20; maxVal = 50; // Tutorial/Easy (Harder start)
    } else if (round <= 5) {
      minVal = 40; maxVal = 80; // Medium
    } else {
      minVal = 70; maxVal = 100; // Hard/Extreme
    }

    const prompt = `
      Generate a sci-fi environment for a biological evolution game.
      Current Round: ${round} of ${maxRounds}.
      Target Difficulty Level: ${round <= 2 ? 'EASY' : round <= 5 ? 'MEDIUM' : 'HARD'}.
      
      STAT CONSTRAINTS:
      - Temperature, Toxicity, Radiation, Scarcity MUST be between ${minVal} and ${maxVal}.
      - Do NOT make everything maximum. Vary the threats.
      
      IMPORTANT:
      1. Provide 'name' and 'description' in Simplified Chinese (简体中文).
      2. 'name' should be evocative (e.g. "X-9 晶体荒原", "天蝎座 γ 熔岩海").
      3. 'description' should be descriptive and atmospheric in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: environmentSchema,
        temperature: 1.0
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Environment;
  } catch (error) {
    console.error("Environment Generation Error", error);
    return {
      name: "未知扇区 (数据恢复模式)",
      description: "传感器数据离线。已加载标准测试环境。",
      temperature: 30 + (round * 5),
      toxicity: 20 + (round * 5),
      radiation: 10 + (round * 5),
      resourceScarcity: 20,
      imgPrompt: "Abstract digital grid"
    };
  }
};

// ------------------------------------------------------------------
// 2. Evaluate Evolution
// ------------------------------------------------------------------

const resultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    organismName: { type: Type.STRING, description: "Sci-fi name in Chinese" },
    description: { type: Type.STRING, description: "Appearance description in Chinese" },
    narrative: { type: Type.STRING, description: "Short story of survival/death in Chinese" },
    acquiredTraits: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3 special abilities in Chinese"
    },
    mutationFeedback: { type: Type.STRING, description: "Advice on DNA in Chinese" }
  },
  required: ["organismName", "description", "narrative", "acquiredTraits", "mutationFeedback"]
};

// NOTE: We now calculate damage LOCALLY in gameLogic.ts to be deterministic.
// We pass the calculated damage to the AI so it generates a consistent story.
export const evaluateEvolution = async (
  dna: DnaBase[], 
  env: Environment,
  damageTaken: number, // Pre-calculated damage
  currentHp: number,
  maxHp: number
): Promise<EvolutionResult> => {
  try {
    const dnaString = dna.join("");
    
    const prompt = `
      Act as a biological simulation narrator.
      
      CONTEXT:
      - Environment: ${env.name} (${env.description})
      - Organism DNA: ${dnaString}
      - CALCULATED DAMAGE: ${damageTaken} (The organism lost this much HP)
      - HP Status: ${currentHp - damageTaken} / ${maxHp} remaining.
      
      TASK:
      Write a short, engaging result in Simplified Chinese (简体中文).
      
      GUIDELINES:
      - If Damage is 0 or low: Describe the organism perfectly adapting, thriving, and resisting the elements.
      - If Damage is high: Describe the organism suffering, parts of it freezing/burning/dissolving, barely surviving.
      - 'organismName': Give it a cool evolution name based on its DNA traits (A=Heat, T=Cold, etc).
      - 'narrative': A dramatic micro-story (2-3 sentences).
      - 'acquiredTraits': 3 short distinct features (e.g. "耐热甲壳", "酸性唾液").
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resultSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    const hpRemaining = Math.max(0, currentHp - damageTaken);

    return {
      survived: hpRemaining > 0,
      damageTaken: damageTaken,
      hpRemaining: hpRemaining,
      organismName: data.organismName,
      description: data.description,
      narrative: data.narrative,
      acquiredTraits: data.acquiredTraits,
      mutationFeedback: data.mutationFeedback
    };

  } catch (error) {
    console.error("Evolution Error", error);
    return {
      survived: true,
      damageTaken: damageTaken,
      hpRemaining: Math.max(0, currentHp - damageTaken),
      organismName: "未知生命体",
      description: "数据传输中断...",
      narrative: "模拟遭受干扰。伤害计算已应用。",
      acquiredTraits: ["数据恢复"],
      mutationFeedback: "保持信号连接。"
    };
  }
};
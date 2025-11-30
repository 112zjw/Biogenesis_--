import React, { useState, useCallback } from 'react';
import { GamePhase, GameState, DnaBase, SpeciesTemplate } from './types';
import { generateEnvironment, evaluateEvolution } from './services/geminiService';
import { calculateDamagePrediction, calculateStats } from './utils/gameLogic';
import DNAEditor from './components/DNAEditor';
import RadarStatChart from './components/RadarStatChart';
import SpeciesSelector from './components/SpeciesSelector';
import { ArrowRight, Activity, Zap, Shield, AlertTriangle, RefreshCcw, Dna, Info, X, Heart, Trophy, HelpCircle } from 'lucide-react';

// Game Constants
const START_DNA_LENGTH = 4;
const MAX_ROUNDS = 8;
const START_HP = 100;
const HP_GROWTH_PER_ROUND = 30;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.INTRO,
    round: 1,
    maxRounds: MAX_ROUNDS,
    score: 0,
    hp: START_HP,
    maxHp: START_HP,
    environment: null,
    dnaSequence: [],
    confirmedDnaSequence: [],
    newSlotsCount: 0,
    lastResult: null,
    history: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // --- Actions ---

  const goToSpeciesSelection = useCallback(() => {
    setGameState(prev => ({ ...prev, phase: GamePhase.SELECT_SPECIES }));
  }, []);

  const selectSpeciesAndStart = useCallback(async (species: SpeciesTemplate) => {
    setIsLoading(true);
    setGameState(prev => ({ ...prev, phase: GamePhase.SCANNING }));
    
    // Generate Initial Environment
    const env = await generateEnvironment(1, MAX_ROUNDS);
    
    // Initial State:
    // Species DNA (4) + 2 Extra Slots (As per request)
    // Confirmed DNA is the Species DNA (locked history) + 2 blanks?
    // User requested "First game has 2 extra BP".
    // Strategy: 
    // dnaSequence = [Template... , A, A]
    // confirmedDnaSequence = [Template... , A, A] (But we will treat the last 2 as 'new' via count)
    
    const initialDna = [...species.initialDna, DnaBase.A, DnaBase.A];
    
    setGameState({
      phase: GamePhase.ENGINEERING,
      round: 1,
      maxRounds: MAX_ROUNDS,
      score: 0,
      hp: START_HP,
      maxHp: START_HP,
      environment: env,
      dnaSequence: initialDna, 
      confirmedDnaSequence: initialDna, // Baseline for mutations
      newSlotsCount: 2, // The 2 extra BPs are "New" and fully editable
      lastResult: null,
      history: []
    });
    setIsLoading(false);
  }, []);

  const nextRound = useCallback(async () => {
    setIsLoading(true);
    setGameState(prev => ({ ...prev, phase: GamePhase.SCANNING }));
    
    const nextRoundNum = gameState.round + 1;
    const env = await generateEnvironment(nextRoundNum, MAX_ROUNDS);
    
    setGameState(prev => {
      const newMaxHp = prev.maxHp + HP_GROWTH_PER_ROUND;
      const healAmount = Math.floor(newMaxHp * 0.2); 
      const newHp = Math.min(newMaxHp, prev.hp + healAmount);
      
      // Grow DNA - Add 1 NEW slot
      // The previous 'dnaSequence' becomes the 'confirmedDnaSequence' for the new round.
      // All previous slots are now "Old".
      const currentDna = prev.dnaSequence;
      const nextDna = [...currentDna, DnaBase.A];

      return {
        ...prev,
        environment: env,
        phase: GamePhase.ENGINEERING,
        round: nextRoundNum,
        hp: newHp,
        maxHp: newMaxHp,
        dnaSequence: nextDna,
        confirmedDnaSequence: nextDna, // Baseline for mutation limits
        newSlotsCount: 1, // Only the 1 new slot is fully free
        lastResult: null 
      };
    });
    setIsLoading(false);
  }, [gameState.round]);

  const handleDnaChange = (index: number, newBase: DnaBase) => {
    if (gameState.phase !== GamePhase.ENGINEERING) return;
    
    const newSeq = [...gameState.dnaSequence];
    newSeq[index] = newBase;
    setGameState(prev => ({ ...prev, dnaSequence: newSeq }));
  };

  const evolveOrganism = async () => {
    if (!gameState.environment) return;
    
    setIsLoading(true);
    setGameState(prev => ({ ...prev, phase: GamePhase.EVOLVING }));

    // 1. Calculate Damage Deterministically
    const stats = calculateStats(gameState.dnaSequence);
    // Add some random variance (-10% to +10%) for excitement
    const rawDamage = calculateDamagePrediction(stats, gameState.environment);
    const variance = (Math.random() * 0.2) - 0.1; // -0.1 to 0.1
    const finalDamage = Math.floor(Math.max(0, rawDamage * (1 + variance)));

    // 2. Generate Narrative with AI
    const result = await evaluateEvolution(
      gameState.dnaSequence, 
      gameState.environment,
      finalDamage,
      gameState.hp,
      gameState.maxHp
    );
    
    setGameState(prev => {
      const isDead = result.hpRemaining <= 0;
      const isVictory = !isDead && prev.round >= prev.maxRounds;
      
      let nextPhase = GamePhase.RESULT;
      if (isDead) nextPhase = GamePhase.GAME_OVER;
      else if (isVictory) nextPhase = GamePhase.VICTORY;

      const roundScore = (isDead ? 0 : 100) + result.hpRemaining + (prev.round * 50);

      return {
        ...prev,
        phase: nextPhase,
        score: prev.score + roundScore,
        hp: result.hpRemaining,
        lastResult: result,
        history: [...prev.history, result]
      };
    });
    setIsLoading(false);
  };

  // --- Render Helpers ---

  const renderTutorial = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button 
          onClick={() => setShowTutorial(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          <Info className="w-6 h-6" /> 游戏说明 / INSTRUCTIONS
        </h2>
        
        <div className="space-y-6 text-slate-200">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🧬 突变规则 (Mutation Rules)</h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-slate-400 space-y-2">
              <li><strong className="text-yellow-400">新基因槽 (New Slots)</strong>: 每轮新增的基因槽是完全不稳定状态，可以<strong className="text-white">自由编辑</strong>。</li>
              <li><strong className="text-emerald-400">旧基因 (History)</strong>: 之前回合固定的基因趋于稳定。你每一轮只能<strong className="text-white">突变 (改变) 1 个</strong>旧基因位点。</li>
              <li><strong className="text-cyan-400">基因共鸣 (Combos)</strong>: 特定的基因排列 (如 AA, GCG) 会产生强大的共鸣属性加成！点击编辑器右上角的 <HelpCircle size={12} className="inline"/> 查看。</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🧪 基础属性</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong className="text-red-400">A</strong>: Heat Res (耐热)</div>
              <div><strong className="text-cyan-400">T</strong>: Cold Res (耐寒)</div>
              <div><strong className="text-lime-400">C</strong>: Toxin Res (抗毒)</div>
              <div><strong className="text-orange-400">G</strong>: Armor (防御)</div>
            </div>
          </div>

          <div className="pt-4 text-center">
             <button 
                onClick={() => setShowTutorial(false)}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
             >
               明白了 (UNDERSTOOD)
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto p-8 animate-fade-in z-10 relative">
      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping"></div>
        <Dna className="w-full h-full text-emerald-400 animate-spin-slow filter drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 neon-text">
        BIOGENESIS
      </h1>
      <h2 className="text-2xl md:text-3xl text-emerald-200/80 tracking-[0.5em] mb-8 font-light">
        进化工程师
      </h2>

      <p className="text-lg text-slate-400 mb-10 font-light tracking-wide max-w-md leading-relaxed">
        基因突变已被限制。寻找黄金组合，适应极恶环境。
        <br/><span className="text-xs opacity-50">v2.0: Mutation Limit & Combo System Loaded</span>
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <button
          onClick={goToSpeciesSelection}
          className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-sm border-l-4 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-w-[200px]"
        >
          开始模拟 <ArrowRight />
        </button>
        
        <button
          onClick={() => setShowTutorial(true)}
          className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-lg rounded-sm border-l-4 border-slate-500 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-w-[200px]"
        >
          玩法说明 <Info size={20} />
        </button>
      </div>
    </div>
  );

  const renderEnvironment = () => {
    if (!gameState.environment) return null;
    const { name, description, temperature, toxicity, radiation, resourceScarcity } = gameState.environment;

    return (
      <div className="w-full lg:w-1/3 p-4 animate-in slide-in-from-left duration-500">
        <div className="glass-panel p-6 rounded-xl h-full border-l-4 border-l-red-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={120} />
          </div>
          
          <div className="flex items-center gap-2 mb-2 text-red-400 font-mono text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            当前环境 (ENV) // ROUND {gameState.round}/{gameState.maxRounds}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">{name}</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed border-b border-slate-700/50 pb-4 h-24 overflow-y-auto custom-scrollbar">
            {description}
          </p>
          
          <div className="space-y-4">
            <StatBar label="温度 (Temp)" value={temperature} icon={<Zap size={14} />} color="bg-orange-500" />
            <StatBar label="毒性 (Toxicity)" value={toxicity} icon={<Activity size={14} />} color="bg-lime-500" />
            <StatBar label="辐射 (Radiation)" value={radiation} icon={<AlertTriangle size={14} />} color="bg-purple-500" />
            <StatBar label="匮乏 (Scarcity)" value={resourceScarcity} icon={<Shield size={14} />} color="bg-slate-500" />
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!gameState.lastResult) return null;
    
    // Determine type of result screen
    const phase = gameState.phase;
    const isVictory = phase === GamePhase.VICTORY;
    const isGameOver = phase === GamePhase.GAME_OVER;
    const isSurvival = phase === GamePhase.RESULT;

    // Colors & Titles
    let title = "存活确认 (SURVIVED)";
    let titleColor = "text-emerald-400";
    let borderColor = "border-emerald-500";
    
    if (isGameOver) {
        title = "物种灭绝 (EXTINCTION)";
        titleColor = "text-red-500";
        borderColor = "border-red-500";
    } else if (isVictory) {
        title = "星球霸主 (DOMINATOR)";
        titleColor = "text-yellow-400";
        borderColor = "border-yellow-500";
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
        <div className={`max-w-3xl w-full bg-slate-900 border-2 ${borderColor} rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col max-h-[90vh]`}>
          
          {/* Header */}
          <div className="p-8 pb-4 flex-shrink-0">
            <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-4">
              <div>
                <h2 className={`text-4xl font-bold mb-2 tracking-tighter neon-text ${titleColor}`}>
                  {isVictory && <Trophy className="inline-block mr-3 mb-2 w-10 h-10" />}
                  {title}
                </h2>
                <h3 className="text-2xl text-white font-mono">{gameState.lastResult.organismName}</h3>
              </div>
              
              <div className="flex gap-4">
                 <div className="text-center bg-slate-800 p-3 rounded border border-slate-700">
                    <div className="text-xs text-slate-400 uppercase">HP Remaining</div>
                    <div className={`text-2xl font-mono font-bold ${isGameOver ? 'text-red-500' : 'text-emerald-400'}`}>
                      {gameState.hp} <span className="text-sm text-slate-500">/ {gameState.maxHp}</span>
                    </div>
                 </div>
                 <div className="text-center bg-slate-800 p-3 rounded border border-slate-700">
                    <div className="text-xs text-slate-400 uppercase">Damage</div>
                    <div className="text-2xl font-mono font-bold text-red-400">
                      -{gameState.lastResult.damageTaken}
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Progress Bar for Victory */}
            {isSurvival && (
                <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-yellow-500 h-full transition-all duration-1000" style={{width: `${(gameState.round / MAX_ROUNDS) * 100}%`}}></div>
                </div>
            )}
          </div>

          {/* Body Content - Scrollable */}
          <div className="px-8 py-4 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-800/30 p-5 rounded-lg border border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={14}/> 进化日志
                </h4>
                <p className="text-slate-200 leading-relaxed mb-4 text-justify indent-4">{gameState.lastResult.narrative}</p>
                <p className="text-slate-400 text-sm italic border-l-2 border-emerald-500/30 pl-3">
                  "{gameState.lastResult.description}"
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                  <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">获得性状 (Traits)</h4>
                  <div className="flex flex-wrap gap-2">
                    {gameState.lastResult.acquiredTraits.map((trait, i) => (
                      <span key={i} className="px-3 py-1 bg-cyan-900/40 text-cyan-200 border border-cyan-700/30 rounded-full text-xs font-mono">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {!isGameOver && !isVictory && (
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                       <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">基因反馈 (Analysis)</h4>
                       <p className="text-yellow-200/80 text-sm">{gameState.lastResult.mutationFeedback}</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 pt-6 border-t border-slate-800 flex justify-end gap-4 flex-shrink-0 bg-slate-900/90">
               {isSurvival && (
                 <button
                   onClick={nextRound}
                   className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95"
                 >
                   下一代：进化 (NEXT GEN) <ArrowRight size={20} />
                 </button>
               )}
               
               {(isGameOver || isVictory) && (
                 <button
                   onClick={() => setGameState(prev => ({ ...prev, phase: GamePhase.INTRO }))}
                   className={`px-8 py-3 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg hover:scale-105 active:scale-95 ${isVictory ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}
                 >
                   {isVictory ? '荣誉归来 (MAIN MENU)' : '重新开始 (RESTART)'} <RefreshCcw size={20} />
                 </button>
               )}
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  if (gameState.phase === GamePhase.INTRO) {
    return (
      <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        {renderIntro()}
        {showTutorial && renderTutorial()}
      </div>
    );
  }

  if (gameState.phase === GamePhase.SELECT_SPECIES) {
    return (
      <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed"></div>
        <SpeciesSelector onSelect={selectSpeciesAndStart} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 flex flex-col overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-slate-900/50 backdrop-blur-sm z-10 relative flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setGameState(prev => ({...prev, phase: GamePhase.INTRO}))}>
          <Dna className="text-emerald-400 group-hover:animate-spin-slow" />
          <span className="font-bold tracking-wider text-emerald-400 neon-text hidden md:inline font-mono">BIOGENESIS</span>
        </div>
        
        {/* HP Bar in Header */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-12 flex flex-col justify-center">
            <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono uppercase">
                <span>Organism Integrity</span>
                <span className={gameState.hp < gameState.maxHp * 0.3 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}>
                    {gameState.hp} / {gameState.maxHp} HP
                </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                    className={`h-full transition-all duration-500 ease-out ${gameState.hp < gameState.maxHp * 0.3 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                    style={{ width: `${Math.max(0, (gameState.hp / gameState.maxHp) * 100)}%` }}
                ></div>
            </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6 font-mono text-sm">
          <div className="hidden sm:block">ROUND: <span className="text-white font-bold text-lg">{gameState.round}/{gameState.maxRounds}</span></div>
          <div className="hidden sm:block">SCORE: <span className="text-emerald-400 font-bold text-lg">{gameState.score}</span></div>
          <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            <Info size={16}/>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row p-4 gap-4 max-w-7xl mx-auto w-full relative z-0">
        
        {/* Environment Panel */}
        {isLoading && gameState.phase === GamePhase.SCANNING ? (
             <div className="w-full lg:w-1/3 glass-panel p-6 rounded-xl flex items-center justify-center animate-pulse">
                 <div className="text-center">
                     <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                     <p className="text-emerald-400 font-mono text-xl tracking-widest">扫描星区中...</p>
                     <p className="text-slate-500 text-xs mt-2 font-mono">GENERATING SECTOR {gameState.round}</p>
                 </div>
             </div>
        ) : renderEnvironment()}

        {/* Gameplay Area */}
        <div className="flex-1 flex flex-col gap-4 animate-in slide-in-from-right duration-500 delay-100 min-h-0">
            {/* Visualizer */}
            <div className="flex-[0.8] glass-panel rounded-xl p-4 flex items-center justify-center relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 min-h-[250px]">
               <div className="absolute top-4 left-4 text-xs font-mono text-emerald-500/70 border border-emerald-500/30 px-2 py-1 rounded z-10">
                 模拟预览 // SIMULATION PREVIEW
               </div>
               <RadarStatChart environment={gameState.environment} dna={gameState.dnaSequence} />
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col min-h-0">
                <DNAEditor 
                  sequence={gameState.dnaSequence} 
                  initialSequence={gameState.confirmedDnaSequence}
                  newSlotsCount={gameState.newSlotsCount}
                  environment={gameState.environment}
                  onChange={handleDnaChange} 
                  locked={gameState.phase !== GamePhase.ENGINEERING} 
                />
                
                <div className="mt-4 flex justify-end flex-shrink-0">
                    <button
                        onClick={evolveOrganism}
                        disabled={gameState.phase !== GamePhase.ENGINEERING || isLoading}
                        className={`
                          px-8 py-4 rounded-lg font-bold text-lg tracking-widest transition-all
                          flex items-center gap-3 border-2
                          ${gameState.phase === GamePhase.ENGINEERING 
                            ? 'bg-emerald-500 border-emerald-400 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1 active:scale-95' 
                            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}
                        `}
                    >
                        {isLoading && gameState.phase === GamePhase.EVOLVING ? (
                          <>
                             <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                             DNA 编译中...
                          </>
                        ) : (
                          <>进化 (EVOLVE) <Activity /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
      </main>

      {/* Overlays */}
      {showTutorial && renderTutorial()}
      {(gameState.phase === GamePhase.RESULT || gameState.phase === GamePhase.GAME_OVER || gameState.phase === GamePhase.VICTORY) && renderResult()}
    </div>
  );
};

// --- Subcomponent: StatBar ---
const StatBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1 text-xs uppercase tracking-wider font-semibold text-slate-400">
      <div className="flex items-center gap-2">{icon} {label}</div>
      <span className="font-mono">{value}</span>
    </div>
    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

export default App;
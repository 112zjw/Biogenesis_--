import React, { useState, useMemo } from 'react';
import { DnaBase, DnaCombo } from '../types';
import { COMBOS, calculateStats, calculateDamagePrediction } from '../utils/gameLogic';
import { Info, Lock, Zap, AlertCircle, X, HelpCircle } from 'lucide-react';
import { Environment } from '../types';

interface Props {
  sequence: DnaBase[];
  initialSequence: DnaBase[]; // The state at start of round
  newSlotsCount: number; // How many slots at the end are "New" (free to edit)
  environment: Environment | null;
  onChange: (index: number, newBase: DnaBase) => void;
  locked?: boolean;
}

const BaseColors: Record<DnaBase, string> = {
  [DnaBase.A]: "bg-red-500/20 border-red-500 text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]",
  [DnaBase.T]: "bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]",
  [DnaBase.C]: "bg-lime-500/20 border-lime-500 text-lime-400 hover:shadow-[0_0_15px_rgba(132,204,22,0.5)]",
  [DnaBase.G]: "bg-orange-500/20 border-orange-500 text-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]",
};

const DNAEditor: React.FC<Props> = ({ sequence, initialSequence, newSlotsCount, environment, onChange, locked }) => {
  const [showComboModal, setShowComboModal] = useState(false);

  // --- Logic: Mutation Limits ---
  // History indices are 0 to (Length - newSlotsCount - 1)
  const historyLength = initialSequence.length - newSlotsCount; 
  // Wait, if we added slots, the initialSequence might be shorter than current sequence?
  // Let's assume initialSequence passed from App is the *Full* sequence including the default new slots before user edits.
  // Actually, App logic: confirmDna is previous round's finalized DNA.
  // Current sequence is confirmDna + new slots.
  // Let's rely on indices. 
  // "New Slots" are the last N indices.
  // "Old Slots" are indices 0 to Length - N - 1.
  
  const isOldSlot = (index: number) => index < (sequence.length - newSlotsCount);
  
  // Count how many Old Slots have been changed
  const mutationCount = sequence.reduce((acc, base, idx) => {
    if (isOldSlot(idx) && base !== initialSequence[idx]) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const canMutateOld = mutationCount < 1;

  const cycleBase = (current: DnaBase): DnaBase => {
    switch (current) {
      case DnaBase.A: return DnaBase.T;
      case DnaBase.T: return DnaBase.C;
      case DnaBase.C: return DnaBase.G;
      case DnaBase.G: return DnaBase.A;
    }
  };

  const handleSlotClick = (index: number) => {
    if (locked) return;

    if (!isOldSlot(index)) {
      // New slots are always free
      onChange(index, cycleBase(sequence[index]));
    } else {
      // Old slot logic
      const isCurrentlyChanged = sequence[index] !== initialSequence[index];
      
      if (isCurrentlyChanged) {
        // We are reverting a change, always allowed
        // But cycleBase doesn't revert, it cycles. 
        // If we want to allow 'Changing' the mutated slot, that's allowed.
        onChange(index, cycleBase(sequence[index]));
      } else {
        // Trying to mutate a fresh old slot
        if (canMutateOld) {
          onChange(index, cycleBase(sequence[index]));
        } else {
          // Shake effect or feedback?
          alert("本轮只能突变 1 个旧基因位点！(Mutation Limit Reached)");
        }
      }
    }
  };

  // --- Prediction ---
  const stats = useMemo(() => calculateStats(sequence), [sequence]);
  const predictedDamage = useMemo(() => 
    environment ? calculateDamagePrediction(stats, environment) : 0
  , [stats, environment]);

  const minDmg = Math.floor(predictedDamage * 0.9);
  const maxDmg = Math.ceil(predictedDamage * 1.1);

  return (
    <div className="w-full p-4 lg:p-6 glass-panel rounded-xl neon-border flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <div>
          <h3 className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-2">
             DNA 编辑器 <span className="text-xs bg-slate-800 px-2 py-1 text-slate-400 rounded">GENE EDITOR</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            旧基因突变: <span className={mutationCount > 0 ? "text-orange-400" : "text-emerald-400"}>{mutationCount}/1</span> 
            <span className="mx-2">|</span> 
            新基因槽: <span className="text-yellow-400">{newSlotsCount}</span>
          </p>
        </div>
        <button 
          onClick={() => setShowComboModal(true)}
          className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1 rounded border border-cyan-900 transition-colors"
        >
          <HelpCircle size={12} /> 基因组合表 (COMBOS)
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-[120px] custom-scrollbar mb-4">
        <div className="flex flex-wrap justify-center gap-3 pb-2 content-start">
          {sequence.map((base, idx) => {
            const isNew = !isOldSlot(idx);
            const isMutated = isOldSlot(idx) && base !== initialSequence[idx];
            const lockedState = isOldSlot(idx) && !isMutated && !canMutateOld;

            return (
              <div key={idx} className="relative group animate-in zoom-in duration-300">
                {/* Status Indicators */}
                {isNew && <div className="absolute -top-2 -right-2 z-10 text-yellow-400 bg-black rounded-full"><Zap size={12} fill="currentColor"/></div>}
                {isMutated && <div className="absolute -top-2 -right-2 z-10 text-orange-500 bg-black rounded-full"><AlertCircle size={12} fill="currentColor"/></div>}
                {lockedState && !locked && <div className="absolute inset-0 bg-black/40 rounded-lg pointer-events-none flex items-center justify-center z-10"><Lock size={16} className="text-slate-500"/></div>}

                <button
                  disabled={locked}
                  onClick={() => handleSlotClick(idx)}
                  className={`
                    w-10 h-14 md:w-12 md:h-16 
                    border-2 rounded-lg 
                    flex items-center justify-center 
                    text-2xl font-bold font-mono transition-all duration-200
                    ${BaseColors[base]}
                    ${isNew ? 'border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : ''}
                    ${isMutated ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)] ring-1 ring-orange-400' : ''}
                    ${locked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95 hover:-translate-y-1'}
                    ${lockedState && !locked ? 'grayscale opacity-50' : ''}
                  `}
                >
                  {base}
                </button>
                
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-mono">
                  {idx + 1}
                </div>
                
                {/* Connector */}
                {idx < sequence.length - 1 && (
                  <div className="absolute top-1/2 -right-4 w-5 h-0.5 bg-slate-700 -z-10"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prediction Footer */}
      <div className="mt-auto border-t border-slate-800 pt-4">
          <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-700/50">
             <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-sm text-slate-400 font-bold uppercase">预计受到伤害 (EST. DAMAGE)</span>
             </div>
             <div className="text-right">
                <span className={`text-xl font-mono font-bold ${minDmg > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {minDmg} - {maxDmg}
                </span>
                <span className="text-xs text-slate-500 ml-2">HP</span>
             </div>
          </div>
      </div>

      {/* Combo Modal */}
      {showComboModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm p-4 flex flex-col rounded-xl animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
             <h4 className="text-white font-bold flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> 基因共鸣 (Combos)</h4>
             <button onClick={() => setShowComboModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2">
             <p className="text-xs text-slate-400 mb-2">相邻的基因序列可产生共鸣，提供额外属性加成。</p>
             {COMBOS.map((combo, i) => (
               <div key={i} className="bg-slate-800 p-2 rounded border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-lg ${combo.color}`}>{combo.sequence}</span>
                      <span className="text-sm text-slate-200">{combo.name}</span>
                    </div>
                    <div className="text-xs text-slate-500">{combo.description}</div>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    {Object.entries(combo.effect).map(([k,v]) => `+${v} `)}
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DNAEditor;
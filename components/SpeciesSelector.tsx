import React from 'react';
import { DnaBase, SpeciesTemplate } from '../types';
import SpeciesVisual from './SpeciesVisual';
import { Check } from 'lucide-react';

interface Props {
  onSelect: (species: SpeciesTemplate) => void;
}

export const SPECIES_OPTIONS: SpeciesTemplate[] = [
  {
    id: 'pyro',
    name: '炎魔原型',
    nameEn: 'PYRO-GENESIS',
    description: '这种生物诞生于地幔热柱附近。它们拥有高度活跃的代谢系统，能够吸收极端热能转化为动力。',
    initialDna: [DnaBase.A, DnaBase.A, DnaBase.A, DnaBase.G], // High Heat, Some Armor
    color: 'border-red-500 shadow-red-900/40'
  },
  {
    id: 'cryo',
    name: '极寒囊体',
    nameEn: 'CRYO-POD',
    description: '在被冰封的卫星深海中演化而来。其细胞壁能像晶体一样硬化，不仅耐寒，还能提供物理防御。',
    initialDna: [DnaBase.T, DnaBase.T, DnaBase.G, DnaBase.T], // High Cold, Some Armor
    color: 'border-cyan-500 shadow-cyan-900/40'
  },
  {
    id: 'toxin',
    name: '生化畸变体',
    nameEn: 'BIO-HAZARD',
    description: '在酸性沼泽中繁衍生息。它们不仅免疫大部分毒素，甚至将环境毒素作为自身生化反应的催化剂。',
    initialDna: [DnaBase.C, DnaBase.C, DnaBase.C, DnaBase.A], // High Toxin, Some Heat
    color: 'border-lime-500 shadow-lime-900/40'
  },
  {
    id: 'balanced',
    name: '泛用型水熊虫',
    nameEn: 'TARDIGRADE-PRIME',
    description: '经过基因工程改造的标准型生物模板。没有突出的特长，但也没有明显的短板，适合应对多变的环境。',
    initialDna: [DnaBase.A, DnaBase.T, DnaBase.C, DnaBase.G], // Perfectly Balanced
    color: 'border-slate-400 shadow-slate-700/40'
  }
];

const SpeciesSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 neon-text">选择初始物种</h2>
        <p className="text-emerald-400 font-mono tracking-widest text-sm md:text-base">INITIATE SPECIES SELECTION // SEQUENCE START</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl w-full">
        {SPECIES_OPTIONS.map((species) => (
          <div 
            key={species.id}
            onClick={() => onSelect(species)}
            className={`
              relative group cursor-pointer 
              bg-slate-900/50 backdrop-blur-md 
              border-2 ${species.color} 
              rounded-2xl overflow-hidden 
              transition-all duration-300 
              hover:scale-105 hover:-translate-y-2 hover:bg-slate-800
              flex flex-col
            `}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">{species.name}</h3>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">{species.nameEn}</div>
            </div>

            {/* Visual */}
            <div className="h-48 p-4 flex items-center justify-center bg-gradient-to-b from-transparent to-black/30 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
               <SpeciesVisual type={species.id as any} className="w-32 h-32" />
            </div>

            {/* Stats Preview */}
            <div className="px-4 py-2 flex justify-center gap-1 bg-black/40 border-y border-white/5">
                {species.initialDna.map((base, idx) => (
                    <span 
                        key={idx} 
                        className={`
                            w-6 h-6 flex items-center justify-center rounded text-xs font-bold font-mono
                            ${base === 'A' ? 'bg-red-900/60 text-red-300' : ''}
                            ${base === 'T' ? 'bg-cyan-900/60 text-cyan-300' : ''}
                            ${base === 'C' ? 'bg-lime-900/60 text-lime-300' : ''}
                            ${base === 'G' ? 'bg-orange-900/60 text-orange-300' : ''}
                        `}
                    >
                        {base}
                    </span>
                ))}
            </div>

            {/* Description */}
            <div className="p-4 flex-1">
              <p className="text-sm text-slate-300 leading-relaxed text-justify">
                {species.description}
              </p>
            </div>

            {/* Action */}
            <div className="p-4 pt-0">
               <button className="w-full py-3 bg-white/5 hover:bg-emerald-600 border border-white/10 hover:border-emerald-500 rounded text-slate-300 hover:text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  确认选择 <Check size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeciesSelector;
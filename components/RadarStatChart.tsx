import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Environment, DnaBase } from '../types';
import { calculateStats } from '../utils/gameLogic';

interface Props {
  environment: Environment | null;
  dna: DnaBase[];
}

const RadarStatChart: React.FC<Props> = ({ environment, dna }) => {
  // Use centralized logic to include Combos
  const stats = useMemo(() => calculateStats(dna), [dna]);

  // Normalize for chart: 100 is "High", but stats can go over 100 with combos.
  // We cap visual at 150 for the chart domain.
  
  const data = [
    {
      subject: '耐热性', // Heat
      A: stats.heatRes,
      B: environment ? environment.temperature : 0,
      fullMark: 100,
    },
    {
      subject: '耐寒性', // Cold
      A: stats.coldRes,
      B: environment ? (100 - environment.temperature) : 0, // Inverted for cold threat
      fullMark: 100,
    },
    {
      subject: '抗毒性', // Toxin
      A: stats.toxinRes,
      B: environment ? environment.toxicity : 0,
      fullMark: 100,
    },
    {
      subject: '防御/抗辐', // Armor/Rad
      A: stats.physicalStr,
      B: environment ? environment.radiation : 0, // Simplified to Radiation for visual
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
          
          {/* Organism Stats */}
          <Radar
            name="生物属性"
            dataKey="A"
            stroke="#10b981"
            strokeWidth={3}
            fill="#10b981"
            fillOpacity={0.5}
          />
          
          {/* Environment Threats */}
          <Radar
            name="环境威胁"
            dataKey="B"
            stroke="#ef4444"
            strokeWidth={2}
            fill="#ef4444"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="absolute bottom-0 right-0 text-[10px] md:text-xs text-slate-400 flex flex-col gap-1 p-2 bg-slate-900/50 rounded border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span>生物抗性 (Res)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          <span>环境威胁 (Threat)</span>
        </div>
      </div>
    </div>
  );
};

export default RadarStatChart;
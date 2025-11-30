import React from 'react';

interface Props {
  type: 'pyro' | 'cryo' | 'toxin' | 'balanced';
  className?: string;
}

const SpeciesVisual: React.FC<Props> = ({ type, className = "" }) => {
  // Common SVG settings
  const size = 200;
  const center = size / 2;

  if (type === 'pyro') {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className={`w-full h-full ${className} drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]`}>
        <defs>
          <radialGradient id="grad-pyro" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        <g className="animate-[pulse_3s_ease-in-out_infinite]">
            {/* Core Body */}
            <circle cx={center} cy={center} r="40" fill="url(#grad-pyro)">
               <animate attributeName="r" values="38;42;38" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Spikes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
               <path 
                 key={i} 
                 d={`M ${center} ${center} L ${center + 60} ${center} L ${center} ${center + 10} Z`} 
                 fill="#ef4444" 
                 transform={`rotate(${angle} ${center} ${center})`}
                 className="origin-center animate-[spin_10s_linear_infinite]"
                 style={{ animationDuration: '20s', animationDirection: i % 2 ? 'reverse' : 'normal' }}
               />
            ))}
            {/* Particle Effects */}
            <circle cx={center + 50} cy={center - 50} r="5" fill="#fca5a5" className="animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <circle cx={center - 50} cy={center + 50} r="3" fill="#fca5a5" className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        </g>
      </svg>
    );
  }

  if (type === 'cryo') {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className={`w-full h-full ${className} drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]`}>
        <defs>
          <radialGradient id="grad-cryo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="70%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#164e63" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        <g>
            {/* Crystalline Core */}
            <rect x={center - 30} y={center - 30} width="60" height="60" rx="10" fill="url(#grad-cryo)" className="animate-[spin_8s_linear_infinite] origin-center" />
            <rect x={center - 30} y={center - 30} width="60" height="60" rx="10" fill="none" stroke="#22d3ee" strokeWidth="2" className="animate-[spin_12s_linear_infinite_reverse] origin-center opacity-70" />
            
            {/* Floating Shards */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <path
                    key={i}
                    d={`M ${center} ${center - 50} L ${center + 10} ${center - 70} L ${center} ${center - 90} L ${center - 10} ${center - 70} Z`}
                    fill="#06b6d4"
                    opacity="0.8"
                    transform={`rotate(${angle} ${center} ${center})`}
                    className="origin-center"
                >
                  <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" additive="sum" />
                  <animateTransform attributeName="transform" type="rotate" values={`${angle} ${center} ${center}`} repeatCount="indefinite" additive="sum" />
                </path>
            ))}
        </g>
      </svg>
    );
  }

  if (type === 'toxin') {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className={`w-full h-full ${className} drop-shadow-[0_0_15px_rgba(132,204,22,0.6)]`}>
         <defs>
          <radialGradient id="grad-toxin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d9f99d" />
            <stop offset="50%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#365314" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        <g>
           {/* Blobby Shape */}
           <path 
             d={`M ${center} ${center - 40} Q ${center + 50} ${center - 40} ${center + 40} ${center} Q ${center + 50} ${center + 50} ${center} ${center + 40} Q ${center - 50} ${center + 50} ${center - 40} ${center} Q ${center - 50} ${center - 40} ${center} ${center - 40}`} 
             fill="url(#grad-toxin)"
             className="animate-[pulse_4s_ease-in-out_infinite]"
           >
             <animate attributeName="d" 
                values={`M ${center} ${center - 40} Q ${center + 50} ${center - 40} ${center + 40} ${center} Q ${center + 50} ${center + 50} ${center} ${center + 40} Q ${center - 50} ${center + 50} ${center - 40} ${center} Q ${center - 50} ${center - 40} ${center} ${center - 40};
                         M ${center} ${center - 45} Q ${center + 45} ${center - 35} ${center + 45} ${center} Q ${center + 45} ${center + 45} ${center} ${center + 45} Q ${center - 45} ${center + 45} ${center - 45} ${center} Q ${center - 45} ${center - 35} ${center} ${center - 45};
                         M ${center} ${center - 40} Q ${center + 50} ${center - 40} ${center + 40} ${center} Q ${center + 50} ${center + 50} ${center} ${center + 40} Q ${center - 50} ${center + 50} ${center - 40} ${center} Q ${center - 50} ${center - 40} ${center} ${center - 40}`}
                dur="3s"
                repeatCount="indefinite"
             />
           </path>
           {/* Bubbles */}
           <circle cx={center + 20} cy={center - 20} r="5" fill="#bef264" opacity="0.6">
               <animate attributeName="cy" values={`${center - 20}; ${center - 60}`} dur="2s" repeatCount="indefinite" />
               <animate attributeName="opacity" values="0.6; 0" dur="2s" repeatCount="indefinite" />
           </circle>
           <circle cx={center - 15} cy={center + 10} r="3" fill="#bef264" opacity="0.6">
               <animate attributeName="cy" values={`${center + 10}; ${center - 30}`} dur="2.5s" repeatCount="indefinite" />
               <animate attributeName="opacity" values="0.6; 0" dur="2.5s" repeatCount="indefinite" />
           </circle>
        </g>
      </svg>
    );
  }

  // Balanced / Tardigrade
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`w-full h-full ${className} drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]`}>
      <defs>
        <radialGradient id="grad-bal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <g>
        {/* Ring Structure */}
        <circle cx={center} cy={center} r="45" stroke="#cbd5e1" strokeWidth="4" fill="transparent" className="animate-[spin_10s_linear_infinite]" strokeDasharray="10 5" />
        <circle cx={center} cy={center} r="30" fill="url(#grad-bal)" className="animate-[pulse_3s_ease-in-out_infinite]" />
        
        {/* Orbiting Elements */}
        <circle cx={center} cy={center - 45} r="6" fill="#ef4444">
           <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx={center} cy={center + 45} r="6" fill="#06b6d4">
           <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx={center - 45} cy={center} r="6" fill="#84cc16">
           <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" begin="2s" />
        </circle>
        <circle cx={center + 45} cy={center} r="6" fill="#f97316">
           <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" begin="3s" />
        </circle>
      </g>
    </svg>
  );
};

export default SpeciesVisual;
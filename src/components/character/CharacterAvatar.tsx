import React from 'react';
import { motion } from 'motion/react';
import { CharacterId } from '../../types';

interface CharacterAvatarProps {
  id: CharacterId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  isListening?: boolean;
  isCelebrating?: boolean;
  showShadow?: boolean;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  id,
  size = 'md',
  isSpeaking = false,
  isListening = false,
  isCelebrating = false,
  showShadow = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-64 h-64 md:w-72 md:h-72',
  };

  const getCharacterSvg = () => {
    switch (id) {
      case 'zoe':
        return (
          // Zoe the Monkey (Playful, golden/amber, lively ears, curly tail)
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Background sparkle if celebrating */}
            {isCelebrating && (
              <g className="animate-spin origin-center text-yellow-300">
                <circle cx="20" cy="40" r="6" fill="#FBBF24" />
                <circle cx="180" cy="50" r="7" fill="#F59E0B" />
                <circle cx="100" cy="15" r="5" fill="#FCD34D" />
              </g>
            )}
            {/* Monkey Ears */}
            <circle cx="45" cy="95" r="28" fill="#B45309" />
            <circle cx="45" cy="95" r="18" fill="#FDE68A" />
            <circle cx="155" cy="95" r="28" fill="#B45309" />
            <circle cx="155" cy="95" r="18" fill="#FDE68A" />

            {/* Head Base */}
            <circle cx="100" cy="100" r="60" fill="#D97706" />

            {/* Hair tuft */}
            <path d="M 90 40 Q 100 25 106 38 Q 112 28 116 42 Z" fill="#B45309" />

            {/* Face mask / Heart shape */}
            <path
              d="M 60 90 C 60 70, 85 65, 100 80 C 115 65, 140 70, 140 90 C 140 120, 100 145, 100 145 C 100 145, 60 120, 60 90 Z"
              fill="#FEF3C7"
            />

            {/* Cheeks */}
            <circle cx="75" cy="115" r="8" fill="#FCA5A5" opacity="0.6" />
            <circle cx="125" cy="115" r="8" fill="#FCA5A5" opacity="0.6" />

            {/* Eyes */}
            <g className="animate-pulse">
              <circle cx="82" cy="92" r="7" fill="#1F2937" />
              <circle cx="84" cy="90" r="2.5" fill="#FFFFFF" />
              <circle cx="118" cy="92" r="7" fill="#1F2937" />
              <circle cx="116" cy="90" r="2.5" fill="#FFFFFF" />
            </g>

            {/* Nose */}
            <ellipse cx="100" cy="108" rx="5" ry="4" fill="#92400E" />

            {/* Mouth */}
            {isSpeaking ? (
              <motion.ellipse
                cx="100"
                cy="124"
                rx="10"
                ry="8"
                fill="#DC2626"
                animate={{ ry: [4, 9, 4], rx: [8, 11, 8] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
            ) : (
              <path d="M 90 120 Q 100 130 110 120" stroke="#92400E" strokeWidth="4" strokeLinecap="round" fill="none" />
            )}
          </svg>
        );

      case 'leo':
        return (
          // Leo the Lion (Brave, fluffy mane, royal crown badge)
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Mane */}
            <g fill="#D97706">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const x = 100 + 58 * Math.cos(rad);
                const y = 100 + 58 * Math.sin(rad);
                return <circle key={i} cx={x} cy={y} r="25" fill="#EA580C" />;
              })}
            </g>
            <circle cx="100" cy="100" r="68" fill="#F59E0B" />

            {/* Ears */}
            <circle cx="58" cy="55" r="18" fill="#D97706" />
            <circle cx="58" cy="55" r="10" fill="#FEF3C7" />
            <circle cx="142" cy="55" r="18" fill="#D97706" />
            <circle cx="142" cy="55" r="10" fill="#FEF3C7" />

            {/* Head */}
            <circle cx="100" cy="105" r="48" fill="#FBBF24" />

            {/* Cute Crown Badge */}
            <polygon points="90,48 95,58 100,44 105,58 110,48 108,62 92,62" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />

            {/* Cheeks & Whiskers */}
            <circle cx="72" cy="118" r="8" fill="#FDBA74" opacity="0.6" />
            <circle cx="128" cy="118" r="8" fill="#FDBA74" opacity="0.6" />

            {/* Eyes */}
            <circle cx="84" cy="98" r="6.5" fill="#1F2937" />
            <circle cx="86" cy="96" r="2.5" fill="#FFFFFF" />
            <circle cx="116" cy="98" r="6.5" fill="#1F2937" />
            <circle cx="114" cy="96" r="2.5" fill="#FFFFFF" />

            {/* Muzzle */}
            <ellipse cx="100" cy="120" rx="16" ry="12" fill="#FEF3C7" />
            {/* Heart Nose */}
            <path d="M 96 112 C 96 109, 100 109, 100 113 C 100 109, 104 109, 104 112 C 104 116, 100 118, 100 118 C 100 118, 96 116, 96 112 Z" fill="#78350F" />

            {/* Mouth */}
            {isSpeaking ? (
              <motion.ellipse
                cx="100"
                cy="126"
                rx="8"
                ry="6"
                fill="#DC2626"
                animate={{ ry: [3, 8, 3] }}
                transition={{ repeat: Infinity, duration: 0.35 }}
              />
            ) : (
              <path d="M 94 122 Q 100 128 106 122" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}
          </svg>
        );

      case 'pia':
        return (
          // Pia the Panda (Gentle, patient, sweet eye patches, bamboo leaf)
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Black Ears */}
            <circle cx="52" cy="56" r="22" fill="#1E293B" />
            <circle cx="148" cy="56" r="22" fill="#1E293B" />

            {/* White Head */}
            <circle cx="100" cy="108" r="62" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

            {/* Bamboo leaf hair clip */}
            <path d="M 125 50 Q 145 40 148 55 Q 135 60 125 50 Z" fill="#10B981" />
            <path d="M 130 52 Q 145 62 135 70 Q 128 62 130 52 Z" fill="#059669" />

            {/* Dark Eye Patches */}
            <ellipse cx="74" cy="100" rx="17" ry="14" fill="#1E293B" transform="rotate(-15 74 100)" />
            <ellipse cx="126" cy="100" rx="17" ry="14" fill="#1E293B" transform="rotate(15 126 100)" />

            {/* Eyes */}
            <circle cx="75" cy="100" r="5" fill="#FFFFFF" />
            <circle cx="77" cy="99" r="2" fill="#1E293B" />
            <circle cx="125" cy="100" r="5" fill="#FFFFFF" />
            <circle cx="123" cy="99" r="2" fill="#1E293B" />

            {/* Pink Cheeks */}
            <circle cx="62" cy="122" r="9" fill="#F472B6" opacity="0.6" />
            <circle cx="138" cy="122" r="9" fill="#F472B6" opacity="0.6" />

            {/* Nose */}
            <ellipse cx="100" cy="116" rx="7" ry="5" fill="#1E293B" />

            {/* Mouth */}
            {isSpeaking ? (
              <motion.ellipse
                cx="100"
                cy="128"
                rx="8"
                ry="6"
                fill="#F43F5E"
                animate={{ ry: [3, 7, 3] }}
                transition={{ repeat: Infinity, duration: 0.35 }}
              />
            ) : (
              <path d="M 92 125 Q 100 133 108 125" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}
          </svg>
        );

      case 'finn':
        return (
          // Finn the Wolf (Clever, curious, pointed ears, fluffy cheeks)
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Pointed Ears */}
            <polygon points="50,90 40,25 90,65" fill="#4F46E5" />
            <polygon points="54,85 48,38 82,68" fill="#C7D2FE" />
            <polygon points="150,90 160,25 110,65" fill="#4F46E5" />
            <polygon points="146,85 152,38 118,68" fill="#C7D2FE" />

            {/* Head Base */}
            <circle cx="100" cy="110" r="58" fill="#6366F1" />

            {/* Fluffy Cheeks */}
            <path d="M 45 115 Q 30 125 48 135 Q 38 145 60 148 Z" fill="#6366F1" />
            <path d="M 155 115 Q 170 125 152 135 Q 162 145 140 148 Z" fill="#6366F1" />

            {/* Inner Face Mask */}
            <path d="M 70 95 Q 100 80 130 95 Q 140 130 100 152 Q 60 130 70 95 Z" fill="#EEF2FF" />

            {/* Clever Eyes */}
            <circle cx="80" cy="102" r="7" fill="#1E1B4B" />
            <circle cx="83" cy="99" r="2.5" fill="#FFFFFF" />
            <circle cx="120" cy="102" r="7" fill="#1E1B4B" />
            <circle cx="117" cy="99" r="2.5" fill="#FFFFFF" />

            {/* Blue star on forehead */}
            <polygon points="100,75 102,80 107,81 103,85 104,90 100,87 96,90 97,85 93,81 98,80" fill="#FBBF24" />

            {/* Nose */}
            <ellipse cx="100" cy="122" rx="6" ry="4" fill="#312E81" />

            {/* Mouth */}
            {isSpeaking ? (
              <motion.ellipse
                cx="100"
                cy="133"
                rx="8"
                ry="6"
                fill="#EF4444"
                animate={{ ry: [3, 8, 3] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
            ) : (
              <path d="M 93 130 Q 100 138 107 130" stroke="#312E81" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}
          </svg>
        );

      case 'kai':
        return (
          // Kai the Shark (Adventurous, friendly, ocean blue, smiling fin)
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Top Dorsal Fin */}
            <path d="M 92 65 Q 100 20 125 45 Q 110 65 104 70 Z" fill="#0891B2" />

            {/* Shark Body/Head */}
            <ellipse cx="100" cy="115" rx="64" ry="54" fill="#06B6D4" />

            {/* Side Flippers */}
            <path d="M 40 125 Q 15 135 30 150 Q 48 140 45 125 Z" fill="#0891B2" />
            <path d="M 160 125 Q 185 135 170 150 Q 152 140 155 125 Z" fill="#0891B2" />

            {/* Belly / Jaw */}
            <path d="M 60 115 Q 100 155 140 115 Q 100 168 60 115 Z" fill="#CFFAFE" />

            {/* Bubbles */}
            <circle cx="35" cy="50" r="7" fill="#67E8F9" opacity="0.7" />
            <circle cx="48" cy="35" r="4" fill="#67E8F9" opacity="0.6" />
            <circle cx="165" cy="45" r="6" fill="#67E8F9" opacity="0.7" />

            {/* Big Friendly Eyes */}
            <circle cx="76" cy="98" r="8" fill="#083344" />
            <circle cx="79" cy="95" r="3" fill="#FFFFFF" />
            <circle cx="124" cy="98" r="8" fill="#083344" />
            <circle cx="121" cy="95" r="3" fill="#FFFFFF" />

            {/* Blushing Cheeks */}
            <circle cx="64" cy="114" r="8" fill="#38BDF8" opacity="0.6" />
            <circle cx="136" cy="114" r="8" fill="#38BDF8" opacity="0.6" />

            {/* Broad Shark Smile */}
            {isSpeaking ? (
              <motion.ellipse
                cx="100"
                cy="126"
                rx="12"
                ry="8"
                fill="#EF4444"
                animate={{ ry: [4, 10, 4] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
            ) : (
              <path d="M 85 122 Q 100 138 115 122" stroke="#083344" strokeWidth="4" strokeLinecap="round" fill="none" />
            )}
          </svg>
        );

      case 'luna':
        return (
          // Luna the Dog (Cheerful, loyal puppy, floppy ears, heart collar)
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Floppy Ears */}
            <path d="M 45 75 C 20 90, 20 140, 48 140 C 65 140, 60 100, 52 75 Z" fill="#BE185D" />
            <path d="M 155 75 C 180 90, 180 140, 152 140 C 135 140, 140 100, 148 75 Z" fill="#BE185D" />

            {/* Puppy Head */}
            <circle cx="100" cy="102" r="54" fill="#F472B6" />

            {/* Cute forehead spot */}
            <ellipse cx="100" cy="74" rx="14" ry="18" fill="#FCE7F3" />

            {/* Puppy Eyes */}
            <circle cx="80" cy="96" r="7.5" fill="#1F2937" />
            <circle cx="83" cy="93" r="3" fill="#FFFFFF" />
            <circle cx="80" cy="99" r="1.5" fill="#FFFFFF" />
            <circle cx="120" cy="96" r="7.5" fill="#1F2937" />
            <circle cx="117" cy="93" r="3" fill="#FFFFFF" />
            <circle cx="120" cy="99" r="1.5" fill="#FFFFFF" />

            {/* Muzzle */}
            <ellipse cx="100" cy="118" rx="18" ry="14" fill="#FFF1F2" />
            {/* Heart Nose */}
            <path d="M 95 110 C 95 106, 100 106, 100 110 C 100 106, 105 106, 105 110 C 105 115, 100 117, 100 117 C 100 117, 95 115, 95 110 Z" fill="#831843" />

            {/* Cheeks */}
            <circle cx="70" cy="116" r="7" fill="#FB7185" opacity="0.6" />
            <circle cx="130" cy="116" r="7" fill="#FB7185" opacity="0.6" />

            {/* Tongue out / Speaking mouth */}
            {isSpeaking ? (
              <motion.g
                animate={{ y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              >
                <ellipse cx="100" cy="126" rx="9" ry="7" fill="#9F1239" />
                <path d="M 96 128 Q 100 138 104 128 Z" fill="#FB7185" />
              </motion.g>
            ) : (
              <path d="M 93 120 Q 100 128 107 120" stroke="#831843" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}

            {/* Collar & Heart Tag */}
            <path d="M 75 148 Q 100 156 125 148" stroke="#DB2777" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 97 154 C 97 151, 100 151, 100 154 C 100 151, 103 151, 103 154 C 103 158, 100 160, 100 160 C 100 160, 97 158, 97 154 Z" fill="#FBBF24" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Dynamic Motion Wrapper */}
      <motion.div
        className={`${sizeMap[size]} relative flex items-center justify-center`}
        animate={{
          y: isCelebrating ? [-8, 0, -12, 0] : isSpeaking ? [-3, 2, -3] : [0, -3, 0],
          rotate: isListening ? [-4, 4, -4] : isCelebrating ? [-3, 3, -3] : 0,
          scale: isCelebrating ? 1.08 : 1,
        }}
        transition={{
          repeat: Infinity,
          duration: isCelebrating ? 0.6 : isSpeaking ? 0.4 : 3,
          ease: 'easeInOut',
        }}
      >
        {getCharacterSvg()}

        {/* Listening Ear Waves */}
        {isListening && (
          <motion.div
            className="absolute -top-3 -right-2 bg-yellow-400 text-yellow-950 text-xs px-2 py-0.5 rounded-full font-bold shadow-md flex items-center gap-1"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <span>👂 J’écoute !</span>
          </motion.div>
        )}

        {/* Celebrating Star Particles */}
        {isCelebrating && (
          <motion.div
            className="absolute -top-5 text-2xl"
            animate={{ y: [-10, -25], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            ✨⭐✨
          </motion.div>
        )}
      </motion.div>

      {/* Soft Ground Shadow */}
      {showShadow && (
        <motion.div
          className="w-2/3 h-3 bg-black/10 rounded-full blur-[2px] mt-1"
          animate={{
            scaleX: isCelebrating ? [0.8, 1, 0.7, 1] : isSpeaking ? [0.95, 1, 0.95] : [1, 0.9, 1],
          }}
          transition={{ repeat: Infinity, duration: isCelebrating ? 0.6 : 3 }}
        />
      )}
    </div>
  );
};

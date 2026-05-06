import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AvatarProps {
  isSpeaking: boolean;
  audioLevel: number;
  className?: string;
}

export function Avatar({ isSpeaking, audioLevel, className }: AvatarProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Glow Rings */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.2 + (audioLevel * 0.5), 1] : 1,
          opacity: isSpeaking ? [0.2, 0.4 + (audioLevel * 0.3), 0.2] : 0.1,
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute w-48 h-48 rounded-full bg-blue-400 blur-2xl"
      />
      
      {/* Main Avatar Body */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300"
          alt="Clinical AI Assistant"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Speaking Overlay */}
        {isSpeaking && (
          <motion.div 
            className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px]"
            animate={{ opacity: [0.1, 0.2 + (audioLevel * 0.4), 0.1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Audio Visualization Waves */}
      {isSpeaking && (
        <div className="absolute -bottom-8 flex items-end gap-1 h-12">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-blue-500 rounded-full"
              animate={{
                height: [8, Math.max(12, audioLevel * 60 * (0.5 + Math.sin(i * 0.5) * 0.5)), 8]
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                delay: i * 0.02
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

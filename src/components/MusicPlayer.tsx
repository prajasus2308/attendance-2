import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MusicPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(() => {
        const saved = localStorage.getItem('music_isPlaying');
        return saved ? JSON.parse(saved) : false;
    });
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('music_isMuted');
        return saved ? JSON.parse(saved) : false;
    });
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.3; // Subtle volume
            audio.muted = isMuted;
            if (isPlaying) {
                audio.play().catch(e => {
                    console.log("Autoplay blocked, waiting for interaction");
                    setIsPlaying(false);
                });
            } else {
                audio.pause();
            }
        }
    }, [isPlaying, isMuted]);

    useEffect(() => {
        localStorage.setItem('music_isPlaying', JSON.stringify(isPlaying));
        localStorage.setItem('music_isMuted', JSON.stringify(isMuted));
    }, [isPlaying, isMuted]);

    const fade = (targetVolume: number, duration: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        const startVolume = audio.volume;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            audio.volume = startVolume + (targetVolume - startVolume) * progress;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            fade(0, 500);
            setTimeout(() => audio.pause(), 500);
        } else {
            audio.volume = 0;
            audio.play();
            fade(0.3, 500);
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
            <audio 
                ref={audioRef} 
                loop 
                src="https://actions.google.com/sounds/v1/nature/rain.ogg" 
            />
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className={`p-3 rounded-full shadow-lg ${isPlaying ? 'bg-[#2563EB] text-white' : 'bg-white text-[#2563EB] border border-[#2563EB]'}`}
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-white text-[#2563EB] border border-[#2563EB] rounded-full shadow-lg"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>
        </div>
    );
};

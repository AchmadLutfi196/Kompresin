import { useState, useEffect, useCallback } from 'react';

interface UseScrambleOptions {
    speed?: number;
    scrambleSpeed?: number;
    characters?: string;
    playOnMount?: boolean;
    delay?: number;
}

export const useScramble = (
    text: string,
    options: UseScrambleOptions = {}
) => {
    const {
        speed = 50,
        scrambleSpeed = 30,
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
        playOnMount = true,
        delay = 0
    } = options;

    const [displayText, setDisplayText] = useState(text);
    const [isScrambling, setIsScrambling] = useState(false);

    const scramble = useCallback(() => {
        if (isScrambling) return;

        setIsScrambling(true);
        let iteration = 0;
        const targetLength = text.length;

        const scrambleInterval = setInterval(() => {
            setDisplayText(prevText => {
                return text
                    .split('')
                    .map((char, index) => {
                        // If we've revealed this character, keep it
                        if (index < iteration) {
                            return text[index];
                        }
                        
                        // If it's a space, keep it as space
                        if (text[index] === ' ') {
                            return ' ';
                        }
                        
                        // Otherwise scramble it
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('');
            });

            // Reveal one more character
            if (iteration < targetLength) {
                iteration += 1 / 3;
            }

            // Stop when all characters are revealed
            if (iteration >= targetLength) {
                clearInterval(scrambleInterval);
                setDisplayText(text);
                setIsScrambling(false);
            }
        }, scrambleSpeed);

        return () => clearInterval(scrambleInterval);
    }, [text, characters, scrambleSpeed, isScrambling]);

    const replay = useCallback(() => {
        if (!isScrambling) {
            scramble();
        }
    }, [scramble, isScrambling]);

    useEffect(() => {
        if (playOnMount) {
            const timer = setTimeout(() => {
                scramble();
            }, delay);
            
            return () => clearTimeout(timer);
        }
    }, [text, playOnMount, delay, scramble]);

    return {
        displayText,
        isScrambling,
        replay
    };
};

export default useScramble;
import { useState, useEffect, useRef } from 'react';

interface ScrambleProps {
    text: string;
    speed?: number;
    scrambleSpeed?: number;
    characters?: string;
    className?: string;
    trigger?: boolean;
    delay?: number;
}

const Scramble: React.FC<ScrambleProps> = ({
    text,
    speed = 50,
    scrambleSpeed = 30,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
    className = '',
    trigger = true,
    delay = 0
}) => {
    const [displayText, setDisplayText] = useState(text);
    const [isScrambling, setIsScrambling] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scramble = () => {
        if (isScrambling) return;
        
        setIsScrambling(true);
        let iteration = 0;
        const targetLength = text.length;

        const scrambleInterval = setInterval(() => {
            setDisplayText(prevText => {
                return prevText
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
                iteration += 1 / 3; // Slower reveal
            }

            // Stop when all characters are revealed
            if (iteration >= targetLength) {
                clearInterval(scrambleInterval);
                setDisplayText(text);
                setIsScrambling(false);
            }
        }, scrambleSpeed);

        intervalRef.current = scrambleInterval;
    };

    useEffect(() => {
        if (trigger) {
            if (delay > 0) {
                timeoutRef.current = setTimeout(() => {
                    scramble();
                }, delay);
            } else {
                scramble();
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [trigger, text, delay]);

    return (
        <span 
            className={`inline-block font-mono ${className}`}
            style={{ minWidth: `${text.length}ch` }}
        >
            {displayText}
        </span>
    );
};

export default Scramble;
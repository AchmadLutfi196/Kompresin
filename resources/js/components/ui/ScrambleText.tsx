import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ScrambleTextProps {
    children: string;
    trigger?: boolean;
    delay?: number;
    speed?: number;
    className?: string;
    scrambleChars?: string;
    revealDelay?: number;
    onComplete?: () => void;
}

const ScrambleText: React.FC<ScrambleTextProps> = ({
    children,
    trigger = true,
    delay = 0,
    speed = 50,
    className = '',
    scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
    revealDelay = 100,
    onComplete
}) => {
    const [scrambledText, setScrambledText] = useState(children);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scramble = () => {
        let iteration = 0;
        const originalText = children;
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
            setScrambledText(prevText => {
                return originalText
                    .split('')
                    .map((char, index) => {
                        // Keep spaces as spaces
                        if (char === ' ') return ' ';
                        
                        // If this character should be revealed
                        if (index < iteration) {
                            return originalText[index];
                        }
                        
                        // Otherwise, scramble it
                        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    })
                    .join('');
            });

            if (iteration >= originalText.length) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                setIsComplete(true);
                onComplete?.();
            }

            iteration += 1 / 3; // Control reveal speed
        }, speed);
    };

    useEffect(() => {
        if (trigger) {
            setIsComplete(false);
            if (delay > 0) {
                timeoutRef.current = setTimeout(scramble, delay);
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
    }, [trigger, children, delay]);

    return (
        <motion.span
            className={`font-mono ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {scrambledText}
        </motion.span>
    );
};

export default ScrambleText;
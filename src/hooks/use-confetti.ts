'use client';
import { useState, useCallback } from 'react';

export const useConfetti = (triggerCondition: boolean) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenTriggered, setHasBeenTriggered] = useState(false);

  const confettiTrigger = useCallback(() => {
    if (triggerCondition && !hasBeenTriggered) {
      setShowConfetti(true);
      setHasBeenTriggered(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // Hide confetti after 5 seconds
    } else if (!triggerCondition && hasBeenTriggered) {
      // Reset if the condition is no longer met
      setHasBeenTriggered(false);
    }
  }, [triggerCondition, hasBeenTriggered]);

  return { showConfetti, confettiTrigger };
};

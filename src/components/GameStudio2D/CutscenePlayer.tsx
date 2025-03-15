import React, { useState, useEffect, useRef } from 'react';
import { RPGEvent } from './types';

interface CutscenePlayerProps {
  event: RPGEvent;
  onComplete: () => void;
  onSkip: () => void;
  characters: Record<string, any>;
  backgrounds: Record<string, string>;
}

const CutscenePlayer: React.FC<CutscenePlayerProps> = ({ 
  event, 
  onComplete, 
  onSkip,
  characters,
  backgrounds 
}) => {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [currentDialog, setCurrentDialog] = useState<string | null>(null);
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [visibleCharacters, setVisibleCharacters] = useState<Record<string, { position: string }>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDialogTyping, setIsDialogTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  
  const dialogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Reset the player when a new cutscene is provided
  useEffect(() => {
    setCurrentActionIndex(0);
    setCurrentDialog(null);
    setCurrentBackground(null);
    setVisibleCharacters({});
    setIsAnimating(false);
    setIsDialogTyping(false);
    setTypedText('');
    
    // Start the cutscene
    if (event.actions && event.actions.length > 0) {
      executeAction(0);
    } else {
      onComplete();
    }
    
    return () => {
      if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [event]);
  
  // Handle user input to advance the cutscene
  const handleInput = () => {
    if (isDialogTyping) {
      // Complete the currently typing dialog immediately
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (currentDialog) {
        setTypedText(currentDialog);
        setIsDialogTyping(false);
      }
    } else if (!isAnimating) {
      // Move to the next action
      const nextIndex = currentActionIndex + 1;
      if (nextIndex < event.actions.length) {
        executeAction(nextIndex);
      } else {
        onComplete();
      }
    }
  };
  
  // Execute a single action in the cutscene
  const executeAction = (index: number) => {
    if (!event.actions[index]) return;
    
    setCurrentActionIndex(index);
    const action = event.actions[index];
    
    switch (action.type) {
      case 'message':
        showMessage(action.params.text);
        break;
        
      case 'wait':
        wait(action.params.duration);
        break;
        
      case 'changeBackground':
        changeBackground(action.params.image);
        break;
        
      case 'showCharacter':
        showCharacter(action.params.character, action.params.position);
        break;
        
      case 'hideCharacter':
        hideCharacter(action.params.character);
        break;
        
      case 'moveCharacter':
        moveCharacter(
          action.params.character, 
          action.params.direction, 
          action.params.steps
        );
        break;
        
      default:
        // If we don't recognize the action type, just move to the next action
        const nextIndex = index + 1;
        if (nextIndex < event.actions.length) {
          executeAction(nextIndex);
        } else {
          onComplete();
        }
    }
  };
  
  // Show a dialog message with typewriter effect
  const showMessage = (text: string) => {
    setCurrentDialog(text);
    setTypedText('');
    setIsDialogTyping(true);
    
    let currentChar = 0;
    typingIntervalRef.current = setInterval(() => {
      if (currentChar < text.length) {
        setTypedText(text.substring(0, currentChar + 1));
        currentChar++;
      } else {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;
        setIsDialogTyping(false);
      }
    }, 30); // typing speed
  };
  
  // Wait for a specified duration before moving to the next action
  const wait = (duration: number) => {
    setIsAnimating(true);
    
    dialogTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      const nextIndex = currentActionIndex + 1;
      if (nextIndex < event.actions.length) {
        executeAction(nextIndex);
      } else {
        onComplete();
      }
    }, duration);
  };
  
  // Change the background image
  const changeBackground = (imageKey: string) => {
    setCurrentBackground(backgrounds[imageKey] || null);
    
    // Move to the next action immediately
    const nextIndex = currentActionIndex + 1;
    if (nextIndex < event.actions.length) {
      executeAction(nextIndex);
    } else {
      onComplete();
    }
  };
  
  // Show a character at a specified position
  const showCharacter = (characterKey: string, position: string) => {
    setVisibleCharacters(prev => ({
      ...prev,
      [characterKey]: { position }
    }));
    
    // Move to the next action immediately
    const nextIndex = currentActionIndex + 1;
    if (nextIndex < event.actions.length) {
      executeAction(nextIndex);
    } else {
      onComplete();
    }
  };
  
  // Hide a character
  const hideCharacter = (characterKey: string) => {
    setVisibleCharacters(prev => {
      const newCharacters = { ...prev };
      delete newCharacters[characterKey];
      return newCharacters;
    });
    
    // Move to the next action immediately
    const nextIndex = currentActionIndex + 1;
    if (nextIndex < event.actions.length) {
      executeAction(nextIndex);
    } else {
      onComplete();
    }
  };
  
  // Move a character in a direction
  const moveCharacter = (characterKey: string, direction: string, steps: number) => {
    // In a real implementation, this would animate a character moving
    // For simplicity, we'll just wait a moment to simulate movement
    setIsAnimating(true);
    
    dialogTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      const nextIndex = currentActionIndex + 1;
      if (nextIndex < event.actions.length) {
        executeAction(nextIndex);
      } else {
        onComplete();
      }
    }, steps * 300); // 300ms per step
  };
  
  return (
    <div className="cutscene-player" onClick={handleInput}>
      {/* Background */}
      {currentBackground && (
        <div 
          className="cutscene-background" 
          style={{ backgroundImage: `url(${currentBackground})` }}
        />
      )}
      
      {/* Characters */}
      {Object.entries(visibleCharacters).map(([key, { position }]) => (
        <div 
          key={key}
          className={`cutscene-character ${position}`}
          style={{ 
            backgroundImage: characters[key] ? `url(${characters[key]})` : undefined
          }}
        />
      ))}
      
      {/* Dialog box */}
      {currentDialog && (
        <div className="cutscene-dialog-box">
          {typedText}
          {isDialogTyping && <span className="dialog-cursor">▎</span>}
        </div>
      )}
      
      {/* Skip button */}
      <div className="cutscene-controls">
        <button className="cutscene-skip-button" onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}>
          Skip
        </button>
      </div>
    </div>
  );
};

export default CutscenePlayer; 
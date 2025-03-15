/**
 * ScriptIntegration.ts
 * 
 * This file provides integration between the Visual Scripting system and the 2D GameStudio.
 * It allows scripts created in the Visual Scripting system to be used in 2D games.
 */

import { RPGEvent, RPGGameState, ScriptLibrary } from './types';

// Interface for the script execution context
export interface ScriptExecutionContext {
  gameState: RPGGameState;
  eventId: string;
  playerPosition: { x: number, y: number };
  triggerType: 'auto' | 'action' | 'touch';
  variables: Record<string, any>;
  switches: Record<string, boolean>;
}

// Interface for script execution result
export interface ScriptExecutionResult {
  success: boolean;
  updatedGameState?: Partial<RPGGameState>;
  message?: string;
  actions?: any[];
}

/**
 * Class to handle integration with the Visual Scripting system
 */
class ScriptIntegration {
  private scriptLibrary: ScriptLibrary = { scripts: [] };
  private isInitialized: boolean = false;

  /**
   * Initialize the script integration
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if the Visual Scripting API is available
      if (window.VisualScriptingAPI) {
        // Load available scripts
        this.scriptLibrary = await window.VisualScriptingAPI.getAvailableScripts();
        this.isInitialized = true;
        console.log(`📜 Script Integration: Initialized with ${this.scriptLibrary.scripts.length} scripts`);
        return true;
      } else {
        console.warn('📜 Script Integration: Visual Scripting API not available');
        return false;
      }
    } catch (error) {
      console.error('📜 Script Integration: Failed to initialize', error);
      return false;
    }
  }

  /**
   * Get all available scripts
   */
  getAvailableScripts(): ScriptLibrary {
    return this.scriptLibrary;
  }

  /**
   * Execute a script for an event
   */
  async executeScript(
    scriptId: string, 
    context: ScriptExecutionContext
  ): Promise<ScriptExecutionResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (window.VisualScriptingAPI) {
        const result = await window.VisualScriptingAPI.executeScript(scriptId, context);
        return {
          success: true,
          ...result
        };
      } else {
        return {
          success: false,
          message: 'Visual Scripting API not available'
        };
      }
    } catch (error) {
      console.error('📜 Script Integration: Failed to execute script', error);
      return {
        success: false,
        message: `Error executing script: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Import a script from the Visual Scripting system
   */
  async importScript(scriptId: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (window.VisualScriptingAPI) {
        return await window.VisualScriptingAPI.importScript(scriptId);
      } else {
        throw new Error('Visual Scripting API not available');
      }
    } catch (error) {
      console.error('📜 Script Integration: Failed to import script', error);
      throw error;
    }
  }

  /**
   * Create a new event with a visual script
   */
  createScriptEvent(
    scriptId: string,
    trigger: 'auto' | 'action' | 'touch' = 'action'
  ): RPGEvent {
    // Find the script in the library
    const script = this.scriptLibrary.scripts.find(s => s.id === scriptId);
    
    if (!script) {
      throw new Error(`Script with ID ${scriptId} not found`);
    }

    // Create a new event with the script
    return {
      id: `script_event_${Date.now()}`,
      trigger,
      actions: [
        {
          type: 'message',
          params: { text: `Running script: ${script.name}` }
        }
      ],
      visualScript: {
        scriptId: script.id,
        name: script.name,
        nodes: script.nodes,
        edges: script.edges,
        active: true
      }
    };
  }

  /**
   * Check if an event has a visual script
   */
  hasVisualScript(event: RPGEvent): boolean {
    return !!event.visualScript && event.visualScript.active;
  }

  /**
   * Process an event with a visual script
   */
  async processScriptEvent(
    event: RPGEvent,
    gameState: RPGGameState,
    playerPosition: { x: number, y: number }
  ): Promise<ScriptExecutionResult> {
    if (!this.hasVisualScript(event)) {
      return {
        success: false,
        message: 'Event does not have an active visual script'
      };
    }

    const context: ScriptExecutionContext = {
      gameState,
      eventId: event.id,
      playerPosition,
      triggerType: event.trigger,
      variables: gameState.variables,
      switches: gameState.switches
    };

    return await this.executeScript(event.visualScript!.scriptId, context);
  }
}

// Export a singleton instance
export default new ScriptIntegration(); 
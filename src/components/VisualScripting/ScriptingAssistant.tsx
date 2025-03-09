import React, { useState, useRef, useEffect } from 'react';
import './ScriptingAssistant.css';

// Extend window interface to allow for global node tracking
declare global {
  interface Window {
    createdNodes?: string[];
    pendingConnections?: Array<{fromId: string, toId: string}>;
  }
}

interface Button {
  label: string;
  action: () => void;
}

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  buttons?: Button[];
}

interface ScriptingAssistantProps {
  onClose: () => void;
  onCreateNode: (nodeType: string, position: {x: number, y: number}) => void;
  onConnectNodes: (fromId: string, toId: string) => void;
  availableNodes: string[];
  currentNodes: any[];
}

const ScriptingAssistant: React.FC<ScriptingAssistantProps> = ({
  onClose, 
  onCreateNode, 
  onConnectNodes, 
  availableNodes, 
  currentNodes
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi, I'm your Visual Scripting Assistant. I can help you build scripts using nodes. What would you like to create?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Common script templates for quick access
  const SCRIPT_TEMPLATES = {
    "character_movement": [
      { type: "OnGameStart", position: { x: 100, y: 100 } },
      { type: "OnKeyPress", position: { x: 100, y: 250 } },
      { type: "Branch", position: { x: 350, y: 250 } },
      { type: "MoveCharacter", position: { x: 600, y: 200 } },
      { type: "PlayAnimation", position: { x: 850, y: 200 } },
      { type: "PlayAnimation", position: { x: 600, y: 350 }, params: { animation: "idle" } },
      { connections: [
        { from: "OnGameStart", to: "Branch" },
        { from: "OnKeyPress", to: "Branch" },
        { from: "Branch", to: "MoveCharacter", fromHandle: "true" },
        { from: "MoveCharacter", to: "PlayAnimation" },
        { from: "Branch", to: "PlayAnimation", fromHandle: "false" }
      ]}
    ],
    "collision_detection": [
      { type: "OnCollisionEnter", position: { x: 100, y: 100 } },
      { type: "GetCollidingObject", position: { x: 350, y: 100 } },
      { type: "Branch", position: { x: 600, y: 100 } },
      { type: "PlaySound", position: { x: 850, y: 50 } },
      { type: "DestroyObject", position: { x: 850, y: 150 } },
      { connections: [
        { from: "OnCollisionEnter", to: "GetCollidingObject" },
        { from: "GetCollidingObject", to: "Branch" },
        { from: "Branch", to: "PlaySound", fromHandle: "true" },
        { from: "Branch", to: "DestroyObject", fromHandle: "true" }
      ]}
    ],
    "ai_patrol": [
      { type: "OnGameStart", position: { x: 100, y: 100 } },
      { type: "WhileLoop", position: { x: 350, y: 100 } },
      { type: "GetWaypoint", position: { x: 600, y: 50 } },
      { type: "MoveToPosition", position: { x: 850, y: 50 } },
      { type: "Wait", position: { x: 1100, y: 50 } },
      { connections: [
        { from: "OnGameStart", to: "WhileLoop" },
        { from: "WhileLoop", to: "GetWaypoint", fromHandle: "loopBody" },
        { from: "GetWaypoint", to: "MoveToPosition" },
        { from: "MoveToPosition", to: "Wait" },
        { from: "Wait", to: "WhileLoop" }
      ]}
    ]
  };
  
  // Node categories for organizing suggestions
  const NODE_CATEGORIES = {
    "Events": ["OnGameStart", "OnKeyPress", "OnCollisionEnter", "OnTriggerEnter", "OnMouseClick"],
    "Logic": ["Branch", "ForLoop", "WhileLoop", "Compare", "SetVariable", "GetVariable"],
    "Movement": ["MoveCharacter", "MoveToPosition", "SetVelocity", "LookAt", "FollowPath"],
    "Animation": ["PlayAnimation", "StopAnimation", "SetAnimationSpeed", "CrossFadeAnimation"],
    "Physics": ["ApplyForce", "SetGravity", "RayCast", "GetCollidingObject"],
    "Audio": ["PlaySound", "StopSound", "SetVolume", "PlayMusic"],
    "Game Objects": ["CreateObject", "DestroyObject", "FindObject", "GetComponent", "SetActive"]
  };
  
  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        text: input,
        sender: 'user',
        timestamp: new Date()
      }
    ]);
    
    const userPrompt = input;
    setInput('');
    setIsLoading(true);
    
    // Check for template requests
    if (userPrompt.toLowerCase().includes('template') || 
        userPrompt.toLowerCase().includes('example') ||
        userPrompt.toLowerCase().includes('sample')) {
      handleTemplateRequest(userPrompt);
      setIsLoading(false);
      return;
    }
    
    // Check for specific script creation requests
    if (isScriptCreationRequest(userPrompt)) {
      handleScriptCreation(userPrompt);
      setIsLoading(false);
      return;
    }
    
    // Check for node suggestions
    if (userPrompt.toLowerCase().includes('node') ||
        userPrompt.toLowerCase().includes('how to')) {
      suggestNodes(userPrompt);
      setIsLoading(false);
      return;
    }
    
    // Default response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: "I can help you build visual scripts. Try asking for a specific script template or node suggestion. For example: 'Create a character movement script' or 'How do I detect collisions?'",
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle template requests (show available templates or create a specific one)
  const handleTemplateRequest = (prompt: string) => {
    // Check if user is requesting a specific template
    for (const [templateName, template] of Object.entries(SCRIPT_TEMPLATES)) {
      if (prompt.toLowerCase().includes(templateName.toLowerCase().replace('_', ' '))) {
        createTemplate(templateName);
        return;
      }
    }
    
    // Show available templates
    setMessages(prev => [
      ...prev,
      {
        text: "I have the following script templates available:\n\n" +
              "• Character Movement - Basic WASD movement with animation\n" +
              "• Collision Detection - Detect and respond to collisions\n" +
              "• AI Patrol - Create an AI that patrols between waypoints\n\n" +
              "Which would you like to create?",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
  };
  
  // Create a script from template
  const createTemplate = (templateName: string) => {
    const template = SCRIPT_TEMPLATES[templateName as keyof typeof SCRIPT_TEMPLATES];
    if (!template) return;
    
    setMessages(prev => [
      ...prev,
      {
        text: `Creating a ${templateName.replace('_', ' ')} script template. This includes the following nodes:\n\n` +
              template.slice(0, -1).map((node: any) => `• ${node.type}`).join('\n'),
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
    
    try {
      // Actually create the nodes in the editor
      const nodes = template.slice(0, -1);
      const connectionsObj = template[template.length - 1];
      const connections = connectionsObj && connectionsObj.connections ? connectionsObj.connections : [];
      
      // Clear any existing tracking
      if (window.createdNodes) {
        window.createdNodes = [];
      }
      
      // Initialize or clear pending connections
      if (!window.pendingConnections) {
        window.pendingConnections = [];
      } else {
        window.pendingConnections = [];
      }
      
      // Create a map of template node types to indexes
      const nodeTypeToIndexMap: {[key: string]: number} = {};
      
      // Create each node
      console.log("Creating template nodes for:", templateName);
      nodes.forEach((node: any, index) => {
        // Track which index each node type is at
        nodeTypeToIndexMap[node.type] = index;
        
        // Create the node in the editor with some spacing
        const adjustedPosition = {
          x: node.position.x * 1.2, // Add more spacing horizontally
          y: node.position.y
        };
        onCreateNode(node.type, adjustedPosition);
      });
      
      // Wait for nodes to be created
      setTimeout(() => {
        // Get the actual created node IDs
        const createdNodeIds = [...(window.createdNodes || [])];
        console.log("Created node IDs for template:", createdNodeIds);
        
        if (createdNodeIds.length >= 2 && connections.length > 0) {
          // Queue each connection with the connection handler
          connections.forEach((connection: any) => {
            // Find the corresponding node indexes
            const fromIndex = nodeTypeToIndexMap[connection.from];
            const toIndex = nodeTypeToIndexMap[connection.to];
            
            if (fromIndex !== undefined && toIndex !== undefined && 
                fromIndex < createdNodeIds.length && toIndex < createdNodeIds.length) {
              
              const fromId = createdNodeIds[fromIndex];
              const toId = createdNodeIds[toIndex];
              console.log(`Queueing template connection: ${connection.from}(${fromId}) → ${connection.to}(${toId})`);
              
              // Add to the pending connections queue via the connection handler
              onConnectNodes(fromId, toId);
            }
          });
          
          // Send success message after all connections are queued
          setMessages(prev => [
            ...prev,
            {
              text: `The ${templateName.replace('_', ' ')} template has been created! All nodes have been placed and connected in the editor. Would you like me to explain what each node does?`,
              sender: 'assistant',
              timestamp: new Date()
            }
          ]);
        } else {
          // Just place the nodes without connections
          setMessages(prev => [
            ...prev,
            {
              text: `I've created the ${templateName.replace('_', ' ')} template nodes, but couldn't automatically connect them. The nodes have been placed in the editor, but you'll need to connect them manually.`,
              sender: 'assistant',
              timestamp: new Date()
            }
          ]);
        }
      }, 2000); // Shorter timeout since we're just queueing connections
    } catch (error) {
      console.error("Error creating template:", templateName, error);
      setMessages(prev => [
        ...prev,
        {
          text: `There was an error creating the ${templateName.replace('_', ' ')} template. Please check the browser console for details.`,
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Check if the prompt is asking to create a specific script
  const isScriptCreationRequest = (prompt: string): boolean => {
    const creationKeywords = ['create', 'make', 'build', 'script for', 'implement'];
    return creationKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  };
  
  // Handle script creation requests
  const handleScriptCreation = (prompt: string) => {
    // Extract what kind of script the user wants
    let scriptType = '';
    
    if (prompt.toLowerCase().includes('movement') || prompt.toLowerCase().includes('character control')) {
      scriptType = 'character_movement';
    } else if (prompt.toLowerCase().includes('collision')) {
      scriptType = 'collision_detection';
    } else if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('patrol')) {
      scriptType = 'ai_patrol';
    } else if (prompt.toLowerCase().includes('game start') || prompt.toLowerCase().includes('start script') || 
               prompt.toLowerCase().includes('initialization')) {
      // Create a custom game start script
      createGameStartScript();
      return;
    } else {
      // Custom script request, suggest starting nodes
      suggestCustomScript(prompt);
      return;
    }
    
    // Use a template if we identified the script type
    if (scriptType) {
      createTemplate(scriptType);
    }
  };
  
  // Create a custom game start script
  const createGameStartScript = () => {
    setMessages(prev => [
      ...prev,
      {
        text: "Creating a game start script that initializes the player in the game. This will include:\n\n" +
              "• OnGameStart - Triggers when the game begins\n" +
              "• LoadPlayerCharacter - Loads the player character model\n" +
              "• SetPosition - Places the player at the starting position\n" +
              "• EnablePlayerControls - Allows player input\n" +
              "• SetupCamera - Configures the camera to follow the player",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
    
    try {
      // Define nodes for the game start script
      const nodeTypes = [
        "OnGameStart", 
        "LoadPlayerCharacter", 
        "SetPosition", 
        "EnablePlayerControls", 
        "SetupCamera"
      ];
      
      // Create positions spaced out horizontally with more spacing
      const positions = nodeTypes.map((_, index) => ({
        x: 100 + (index * 300), // Increase horizontal spacing
        y: 200
      }));
      
      // Clear any existing tracking
      if (window.createdNodes) {
        window.createdNodes = [];
      }
      
      // Initialize or clear pending connections
      if (!window.pendingConnections) {
        window.pendingConnections = [];
      } else {
        window.pendingConnections = [];
      }
      
      // First, create all the nodes
      console.log("Creating nodes for game start script");
      nodeTypes.forEach((nodeType, index) => {
        onCreateNode(nodeType, positions[index]);
      });
      
      // Then wait for a shorter time before attempting to connect
      setTimeout(() => {
        // Force refresh of our access to the created nodes
        const createdNodeIds = [...(window.createdNodes || [])];
        console.log("Node IDs created:", createdNodeIds);
        
        if (createdNodeIds.length >= 2) {
          // Queue up all connections to be made
          for (let i = 0; i < createdNodeIds.length - 1; i++) {
            const fromId = createdNodeIds[i];
            const toId = createdNodeIds[i + 1];
            console.log(`Queueing connection from ${i} to ${i+1}: ${fromId} → ${toId}`);
            
            // Add to the pending connections queue
            // This will be processed by the connection interval
            onConnectNodes(fromId, toId);
          }
          
          // Success message after all connections are queued
          setMessages(prev => [
            ...prev,
            {
              text: "I've created your game start script and connected all the nodes! This script will run when the game begins, load the player character, place it at the starting position, enable controls, and set up the camera to follow the player.",
              sender: 'assistant',
              timestamp: new Date()
            }
          ]);
        } else {
          // Fallback if node creation didn't work properly
          console.warn("Not enough nodes created to form connections:", createdNodeIds);
          setMessages(prev => [
            ...prev,
            {
              text: "I've created your game start script nodes but couldn't automatically connect them all. The nodes have been placed in the editor, but you'll need to connect them manually by dragging from the output of one node to the input of the next.",
              sender: 'assistant',
              timestamp: new Date()
            }
          ]);
        }
      }, 2000); // Shorter delay since we're only queueing connections, not creating them directly
    } catch (error) {
      console.error("Error creating game start script:", error);
      
      setMessages(prev => [
        ...prev,
        {
          text: "There was an error creating the game start script. Please check the browser console for details.",
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Suggest a custom script based on the user's request
  const suggestCustomScript = (prompt: string) => {
    // Analyze prompt to determine potential nodes needed
    const relevantCategories = [];
    
    for (const [category, nodes] of Object.entries(NODE_CATEGORIES)) {
      if (nodes.some(node => 
        prompt.toLowerCase().includes(node.toLowerCase()) ||
        node.toLowerCase().includes(prompt.toLowerCase().replace(/script|create|make|build|for/g, '').trim())
      )) {
        relevantCategories.push(category);
      }
    }
    
    // If we found relevant categories, suggest nodes from them
    if (relevantCategories.length > 0) {
      const suggestedNodes: string[] = [];
      
      relevantCategories.forEach(category => {
        // @ts-ignore (category string indexing)
        const nodes = NODE_CATEGORIES[category as keyof typeof NODE_CATEGORIES];
        nodes.slice(0, 2).forEach(node => suggestedNodes.push(`${node} (${category})`));
      });
      
      // Always suggest some starting nodes
      if (!suggestedNodes.includes('OnGameStart (Events)')) {
        suggestedNodes.unshift('OnGameStart (Events)');
      }
      
      const suggestedNodesText = suggestedNodes.map(node => `• ${node}`).join('\n');
      
      setMessages(prev => [
        ...prev,
        {
          text: `I'll help you create a custom script based on your request. Here are some nodes you might want to use:\n\n${suggestedNodesText}\n\nClick one of the buttons below to add a node to your script:`,
          sender: 'assistant',
          timestamp: new Date(),
          buttons: suggestedNodes.map(node => {
            const nodeName = node.split(' (')[0];
            return {
              label: `Add ${nodeName}`,
              action: () => handleAddNode(nodeName)
            };
          })
        }
      ]);
    } else {
      // No specific matches, offer general guidance
      const commonNodes = [
        'OnGameStart',
        'OnKeyPress',
        'OnCollisionEnter',
        'Branch',
        'SetVariable',
        'GetVariable'
      ];
      
      setMessages(prev => [
        ...prev,
        {
          text: "I'd be happy to help you create a custom script. To get started, we'll need some event nodes to trigger your script and logic nodes to define its behavior.\n\n" +
                "Common starting points include:\n" +
                "• OnGameStart - Triggers when the game begins\n" +
                "• OnKeyPress - Responds to keyboard input\n" +
                "• OnCollisionEnter - Detects when objects collide\n\n" +
                "Click one of the buttons below to add a node to your script:",
          sender: 'assistant',
          timestamp: new Date(),
          buttons: commonNodes.map(nodeName => ({
            label: `Add ${nodeName}`,
            action: () => handleAddNode(nodeName)
          }))
        }
      ]);
    }
  };
  
  // Suggest relevant nodes based on the user's query
  const suggestNodes = (prompt: string) => {
    const relevantNodes: string[] = [];
    
    // Look for category matches
    for (const [category, nodes] of Object.entries(NODE_CATEGORIES)) {
      if (prompt.toLowerCase().includes(category.toLowerCase())) {
        // @ts-ignore (category string indexing)
        nodes.forEach(node => relevantNodes.push(`${node} (${category})`));
      } else {
        // Look for specific node matches
        nodes.forEach(node => {
          if (prompt.toLowerCase().includes(node.toLowerCase()) ||
              node.toLowerCase().includes(prompt.toLowerCase().replace(/node|how|to|do i/g, '').trim())) {
            relevantNodes.push(`${node} (${category})`);
          }
        });
      }
    }
    
    if (relevantNodes.length > 0) {
      setMessages(prev => [
        ...prev,
        {
          text: `Here are some nodes that might help with your request:\n\n` +
                relevantNodes.slice(0, 5).map(node => `• ${node}`).join('\n') + 
                (relevantNodes.length > 5 ? `\n\n...and ${relevantNodes.length - 5} more.` : ''),
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    } else {
      // No specific matches, show general node categories
      setMessages(prev => [
        ...prev,
        {
          text: "I can suggest nodes from these categories:\n\n" +
                Object.keys(NODE_CATEGORIES).map(category => `• ${category}`).join('\n') + 
                "\n\nWhich category are you interested in?",
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Handle adding a node through the assistant
  const handleAddNode = (nodeType: string) => {
    // Calculate position based on existing nodes
    const offsetX = 200;
    const offsetY = 200;
    let position = { x: 100, y: 100 };
    
    // If there are existing nodes, place the new one relative to them
    if (currentNodes.length > 0) {
      // Find the rightmost node to place this one after it
      const rightmostNode = currentNodes.reduce((prev, curr) => {
        return (curr.position.x > prev.position.x) ? curr : prev;
      });
      
      position = {
        x: rightmostNode.position.x + offsetX,
        y: rightmostNode.position.y
      };
    }
    
    // Create the node
    onCreateNode(nodeType, position);
    
    // Confirm node creation to the user
    setMessages(prev => [
      ...prev,
      {
        text: `I've added a ${nodeType} node to your script. What would you like to add next?`,
        sender: 'assistant',
        timestamp: new Date(),
        buttons: [
          {
            label: "Connect to Another Node",
            action: () => suggestConnections(nodeType)
          },
          {
            label: "Add Another Node",
            action: () => suggestAdditionalNodes(nodeType)
          }
        ]
      }
    ]);
  };
  
  // Suggest nodes that would commonly follow the specified node
  const suggestAdditionalNodes = (previousNodeType: string) => {
    const suggestions: string[] = [];
    
    // Suggest based on the previous node type
    if (previousNodeType.includes("Start") || previousNodeType.includes("Event")) {
      suggestions.push("Branch", "SetVariable", "GetVariable", "LoadPlayerCharacter");
    } else if (previousNodeType.includes("Branch")) {
      suggestions.push("MoveCharacter", "PlayAnimation", "PlaySound");
    } else if (previousNodeType.includes("Move") || previousNodeType.includes("Position")) {
      suggestions.push("PlayAnimation", "SetupCamera", "CheckCollision");
    } else if (previousNodeType.includes("Animation")) {
      suggestions.push("Wait", "PlaySound", "SetVariable");
    } else {
      // Default suggestions
      suggestions.push("Branch", "SetVariable", "PlayAnimation", "MoveCharacter");
    }
    
    setMessages(prev => [
      ...prev,
      {
        text: `After a ${previousNodeType} node, you might want to add one of these nodes:`,
        sender: 'assistant',
        timestamp: new Date(),
        buttons: suggestions.map(node => ({
          label: `Add ${node}`,
          action: () => handleAddNode(node)
        }))
      }
    ]);
  };
  
  // Suggest connections to existing nodes
  const suggestConnections = (nodeType: string) => {
    if (currentNodes.length <= 1) {
      setMessages(prev => [
        ...prev,
        {
          text: "You need at least two nodes in your script to create connections. Let's add another node first.",
          sender: 'assistant',
          timestamp: new Date(),
          buttons: [
            {
              label: "Add Another Node",
              action: () => suggestAdditionalNodes(nodeType)
            }
          ]
        }
      ]);
      return;
    }
    
    // Get other nodes to potentially connect to
    const otherNodes = currentNodes.filter(node => node.data.label !== nodeType);
    const recentNodes = otherNodes.slice(0, Math.min(otherNodes.length, 3));
    
    setMessages(prev => [
      ...prev,
      {
        text: "Which node would you like to connect to?",
        sender: 'assistant',
        timestamp: new Date(),
        buttons: recentNodes.map(node => ({
          label: `Connect to ${node.data.label}`,
          action: () => {
            // Use node IDs to create the connection
            onConnectNodes(
              currentNodes.find(n => n.data.label === nodeType)?.id || "",
              node.id
            );
            
            setMessages(prev => [
              ...prev,
              {
                text: `Connected ${nodeType} to ${node.data.label}. Your script is taking shape!`,
                sender: 'assistant',
                timestamp: new Date()
              }
            ]);
          }
        }))
      }
    ]);
  };
  
  return (
    <div className="scripting-assistant">
      <div className="scripting-assistant-header">
        <h3>AI Script Helper</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="scripting-assistant-content">
        <div className="scripting-assistant-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}>
              <div className="message-content">
                {message.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
                
                {/* Render buttons if present */}
                {message.buttons && message.buttons.length > 0 && (
                  <div className="message-buttons">
                    {message.buttons.map((btn, btnIndex) => (
                      <button 
                        key={btnIndex} 
                        className="action-button"
                        onClick={btn.action}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-content">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="quick-actions">
          <div className="quick-actions-title">Quick Templates</div>
          <div className="quick-actions-buttons">
            <button onClick={() => createTemplate('character_movement')}>Character Movement</button>
            <button onClick={() => createTemplate('collision_detection')}>Collision Detection</button>
            <button onClick={() => createGameStartScript()}>Game Start</button>
          </div>
        </div>
        
        <div className="scripting-assistant-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ask for help or request a script..."
            disabled={isLoading}
          />
          <button onClick={handleSubmit} disabled={isLoading || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ScriptingAssistant; 
import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';
import { 
  ALL_NODE_TYPES, 
  EVENT_NODES, 
  ACTION_NODES, 
  AI_NODES, 
  LOGIC_NODES,
  MATH_NODES,
  MODEL_NODES,
  NodeType, 
  NodeCategory, 
  getNodesByCategory,
  searchNodes,
  PortType
} from './NodeTypes';
import ScriptNode from './ScriptNode';
import Documentation from './Documentation';
import { FaQuestion, FaSave, FaFolderOpen, FaFileExport, FaPlay, FaPlus } from 'react-icons/fa';
import './VisualScriptEditor.css';
import { GeneratedScript } from '../AIAssistant/ScriptGenerator';
import ScriptingAssistant from './ScriptingAssistant';

// Define node types for ReactFlow
const nodeTypes = {
  scriptNode: ScriptNode,
};

// Initial examples of nodes and edges
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'scriptNode',
    position: { x: 100, y: 100 },
    data: {
      ...EVENT_NODES.START_GAME,
      type: NodeType.EVENT,
    },
  },
  {
    id: '2',
    type: 'scriptNode',
    position: { x: 400, y: 100 },
    data: {
      ...ACTION_NODES.MOVE_OBJECT,
      type: NodeType.ACTION,
    },
  },
  {
    id: '3',
    type: 'scriptNode',
    position: { x: 400, y: 300 },
    data: {
      ...AI_NODES.GENERATE_TEXT,
      type: NodeType.AI,
    },
  },
  {
    id: '4',
    type: 'scriptNode',
    position: { x: 100, y: 300 },
    data: {
      ...LOGIC_NODES.BRANCH,
      type: NodeType.CONDITION,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'trigger',
    targetHandle: 'trigger',
    animated: true,
  },
];

// Enhanced node selector with categories and search
const NodeSelector: React.FC<{
  onAddNode: (nodeTemplate: any) => void;
}> = ({ onAddNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(NodeCategory.COMMON);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  // Get nodes based on selected category or search
  const filteredNodes = useMemo(() => {
    if (searchQuery.trim()) {
      // Search across all nodes
      return searchNodes(searchQuery).filter(([_, node]) => showAdvanced || !(node?.isAdvanced));
    } else {
      // Filter by category
      return getNodesByCategory(selectedCategory as NodeCategory)
        .filter(([_, node]) => showAdvanced || !(node?.isAdvanced));
    }
  }, [selectedCategory, searchQuery, showAdvanced]);
  
  // Categories for the tabs
  const categories = Object.values(NodeCategory);
  
  return (
    <div className="node-selector">
      <div className="node-selector-search">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <label className="show-advanced-toggle">
          <input
            type="checkbox"
            checked={showAdvanced}
            onChange={() => setShowAdvanced(!showAdvanced)}
          />
          Show Advanced
        </label>
      </div>
      
      <div className="node-selector-tabs">
        {categories.map((category) => (
          <button 
            key={category}
            className={`tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="node-list">
        {filteredNodes.length === 0 ? (
          <div className="no-nodes-found">No nodes found</div>
        ) : (
          filteredNodes.map(([key, nodeTemplate]) => (
            <div 
              key={key} 
              className={`node-template ${nodeTemplate.isAdvanced ? 'advanced' : ''}`}
              onClick={() => onAddNode(nodeTemplate)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/reactflow', key);
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <div className="node-template-header">
                <span className="node-template-title">{nodeTemplate.label}</span>
                {nodeTemplate.isAdvanced && <span className="advanced-badge">Advanced</span>}
              </div>
              {nodeTemplate.description && (
                <div className="node-template-description">{nodeTemplate.description}</div>
              )}
              {nodeTemplate.tags && (
                <div className="node-template-tags">
                  {nodeTemplate.tags.map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="node-content-section">
        <h4>Logic Nodes</h4>
        <div className="node-grid">
          {Object.entries(LOGIC_NODES)
            .filter(([_, node]) => showAdvanced || !(node?.isAdvanced))
            .map(([nodeType, node]) => (
              <div
                key={nodeType}
                className="node-item"
                onClick={() => onAddNode(node)}
              >
                <div className="node-item-label">{node.label}</div>
                {node.description && (
                  <div className="node-item-description">{node.description}</div>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="node-content-section">
        <h4>Math Nodes</h4>
        <div className="node-grid">
          {Object.entries(MATH_NODES)
            .filter(([_, node]) => showAdvanced || !(node?.isAdvanced))
            .map(([nodeType, node]) => (
              <div
                key={nodeType}
                className="node-item"
                onClick={() => onAddNode(node)}
              >
                <div className="node-item-label">{node.label}</div>
                {node.description && (
                  <div className="node-item-description">{node.description}</div>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="node-content-section">
        <h4>Character Model Nodes</h4>
        <div className="node-grid">
          {Object.entries(MODEL_NODES)
            .filter(([_, node]) => showAdvanced || !(node?.isAdvanced))
            .map(([nodeType, node]) => (
              <div
                key={nodeType}
                className="node-item"
                onClick={() => onAddNode(node)}
              >
                <div className="node-item-label">{node.label}</div>
                {node.description && (
                  <div className="node-item-description">{node.description}</div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced QuickActions component
const QuickActions: React.FC<{
  onNewScript: () => void;
  onSaveScript: () => void;
  onLoadScript: () => void;
  onExportScript: () => void;
  onRunSimulation: () => void;
  onOpenHelp: () => void;
}> = ({ onNewScript, onSaveScript, onLoadScript, onExportScript, onRunSimulation, onOpenHelp }) => {
  return (
    <div className="quick-actions">
      <button 
        className="action-button" 
        onClick={onNewScript}
        title="Create a new script"
      >
        <FaPlus /> New
      </button>
      <button 
        className="action-button" 
        onClick={onSaveScript}
        title="Save script"
      >
        <FaSave /> Save
      </button>
      <button 
        className="action-button" 
        onClick={onLoadScript}
        title="Load script"
      >
        <FaFolderOpen /> Load
      </button>
      <button 
        className="action-button" 
        onClick={onExportScript}
        title="Export script as JSON"
      >
        <FaFileExport /> Export
      </button>
      <button 
        className="action-button play-button" 
        onClick={onRunSimulation}
        title="Run simulation"
      >
        <FaPlay /> Run
      </button>
      <button 
        className="action-button help-button" 
        onClick={onOpenHelp}
        title="Open documentation"
      >
        <FaQuestion /> Help
      </button>
    </div>
  );
};

// The main visual scripting editor component
const VisualScriptEditorContent: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [scriptName, setScriptName] = useState<string>("New Script");
  const [isModified, setIsModified] = useState<boolean>(false);
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const { project, getNodes } = useReactFlow();
  
  // Add state for AI-generated scripts
  const [lastAIScriptTimestamp, setLastAIScriptTimestamp] = useState<number>(0);
  
  // Add state for showing/hiding the scripting assistant
  const [showScriptingAssistant, setShowScriptingAssistant] = useState<boolean>(false);
  
  // Update the selected node when node selection changes
  useEffect(() => {
    const onNodeSelectionChange = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode) {
          setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
          setSelectedNode(null);
        }
      }
    };
    
    document.addEventListener('keydown', onNodeSelectionChange);
    
    return () => {
      document.removeEventListener('keydown', onNodeSelectionChange);
    };
  }, [selectedNode, setNodes]);
  
  // Add effect to listen for AI script events
  useEffect(() => {
    // Event listener for AI-generated scripts
    const handleAIGeneratedScript = (event: CustomEvent) => {
      const { script, timestamp } = event.detail;
      
      // Make sure we don't process the same script twice
      if (timestamp && timestamp === lastAIScriptTimestamp) {
        return;
      }
      
      if (script && script.nodes && script.edges) {
        // Set the timestamp to prevent duplicate processing
        setLastAIScriptTimestamp(timestamp);
        
        // If there are existing nodes and edges, ask for confirmation
        if (nodes.length > 0 || edges.length > 0) {
          const confirmReplace = window.confirm(
            "Do you want to replace the current script with the AI-generated one? \n\n" +
            "Click 'OK' to replace the current script, or 'Cancel' to add the AI-generated script to the current one."
          );
          
          if (confirmReplace) {
            // Replace current script with the AI-generated one
            setNodes(script.nodes);
            setEdges(script.edges);
          } else {
            // Add the AI-generated script to the current one
            // Adjust node positions for better layout
            const offsetX = 300;
            const offsetY = 200;
            
            const offsetNodes = script.nodes.map((node: any) => ({
              ...node,
              id: `ai_${node.id}`, // Prefix with 'ai_' to avoid ID conflicts
              position: {
                x: node.position.x + offsetX,
                y: node.position.y + offsetY
              }
            }));
            
            // Update edge references to match the new node IDs
            const offsetEdges = script.edges.map((edge: any) => ({
              ...edge,
              id: `ai_${edge.id}`, // Prefix edge IDs with 'ai_'
              source: `ai_${edge.source}`,
              target: `ai_${edge.target}`
            }));
            
            // Add the new nodes and edges to the existing ones
            setNodes(prevNodes => [...prevNodes, ...offsetNodes]);
            setEdges(prevEdges => [...prevEdges, ...offsetEdges]);
          }
          
          // Show a notification
          alert(`AI-generated script "${script.name}" has been added to the editor.`);
        } else {
          // There are no existing nodes or edges, so just set the AI-generated ones
          setNodes(script.nodes);
          setEdges(script.edges);
          
          // Show a notification
          alert(`AI-generated script "${script.name}" has been loaded into the editor.`);
        }
      }
    };
    
    // Add event listener for AI-generated scripts
    window.addEventListener('apply-ai-generated-script', handleAIGeneratedScript as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('apply-ai-generated-script', handleAIGeneratedScript as EventListener);
    };
  }, [nodes, edges, lastAIScriptTimestamp]);
  
  // Handle new connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      // Check if connection types are compatible
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      
      if (!sourceNode || !targetNode) return;
      
      const sourceOutput = sourceNode.data.outputs?.find((output: any) => output.id === connection.sourceHandle);
      const targetInput = targetNode.data.inputs?.find((input: any) => input.id === connection.targetHandle);
      
      if (!sourceOutput || !targetInput) return;
      
      // Check if connection types are compatible
      // For now, trigger can connect to trigger, and any can connect to any
      // In a more robust implementation, we would have more sophisticated type checking
      const isCompatible = 
        sourceOutput.type === targetInput.type || 
        sourceOutput.type === PortType.ANY || 
        targetInput.type === PortType.ANY;
      
      if (!isCompatible) {
        console.warn(`Cannot connect ${sourceOutput.type} to ${targetInput.type}`);
        return;
      }
      
      // Add the edge if compatible
      setEdges((eds) => addEdge({
        ...connection,
        animated: sourceOutput.type === PortType.TRIGGER,
      }, eds));
      
      setIsModified(true);
    },
    [nodes, setEdges]
  );
  
  // Add new node to the canvas
  const onAddNode = useCallback(
    (nodeTemplate: any) => {
      if (!reactFlowWrapper.current) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Calculate position in the center of the viewport
      const position = project({
        x: (reactFlowBounds.width / 2) - reactFlowBounds.left,
        y: (reactFlowBounds.height / 2) - reactFlowBounds.top,
      });
      
      const newNode = {
        id: nanoid(),
        type: 'scriptNode',
        position,
        data: {
          ...nodeTemplate,
          type: nodeTemplate.type,
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
      setIsModified(true);
    },
    [project, setNodes]
  );
  
  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);
  
  // Handle drag over for drag and drop
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Handle drop for drag and drop
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeType) return;
      
      const nodeTemplate = ALL_NODE_TYPES[nodeType as keyof typeof ALL_NODE_TYPES];
      if (!nodeTemplate) return;
      
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode = {
        id: nanoid(),
        type: 'scriptNode',
        position,
        data: {
          ...nodeTemplate,
          type: nodeTemplate.type,
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
      setIsModified(true);
    },
    [project, setNodes]
  );
  
  // Quick action handlers
  const handleNewScript = () => {
    if (isModified && !window.confirm("You have unsaved changes. Create a new script anyway?")) {
      return;
    }
    
    setNodes([]);
    setEdges([]);
    setScriptName("New Script");
    setIsModified(false);
  };
  
  const handleSaveScript = () => {
    // In a real app, this would save to a database or file
    const scriptData = {
      name: scriptName,
      nodes: nodes,
      edges: edges,
      lastSaved: new Date().toISOString()
    };
    
    console.log("Saving script:", scriptData);
    localStorage.setItem('savedScript', JSON.stringify(scriptData));
    setIsModified(false);
    alert("Script saved successfully!");
  };
  
  const handleLoadScript = () => {
    if (isModified && !window.confirm("You have unsaved changes. Load a different script anyway?")) {
      return;
    }
    
    // In a real app, this would load from a database or file
    const savedScriptJson = localStorage.getItem('savedScript');
    if (savedScriptJson) {
      try {
        const savedScript = JSON.parse(savedScriptJson);
        setNodes(savedScript.nodes || []);
        setEdges(savedScript.edges || []);
        setScriptName(savedScript.name || "Loaded Script");
        setIsModified(false);
        alert("Script loaded successfully!");
      } catch (e) {
        console.error("Failed to load script", e);
        alert("Failed to load script: " + (e as Error).message);
      }
    } else {
      alert("No saved script found");
    }
  };
  
  const handleExportScript = () => {
    // Export as JSON
    const scriptData = {
      name: scriptName,
      nodes: nodes,
      edges: edges,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    const dataStr = JSON.stringify(scriptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${scriptName.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleRunSimulation = () => {
    // In a real app, this would execute the visual script
    alert("Script simulation started!");
    console.log("Running script simulation with:", nodes, edges);
  };
  
  // Open documentation
  const handleOpenHelp = useCallback(() => {
    setShowDocs(true);
  }, []);
  
  // Close documentation
  const handleCloseHelp = useCallback(() => {
    setShowDocs(false);
  }, []);
  
  // Add function to create a node from the assistant
  const createNodeFromAssistant = (nodeType: string, position: {x: number, y: number}) => {
    console.log(`Creating node: ${nodeType} at position`, position);
    
    // Find the node template
    let nodeTemplate;
    for (const category of Object.values(NodeCategory)) {
      const nodes = getNodesByCategory(category as NodeCategory);
      for (const [key, node] of nodes) {
        if (key === nodeType || node.label === nodeType) {
          nodeTemplate = node;
          break;
        }
      }
      if (nodeTemplate) break;
    }
    
    if (!nodeTemplate) {
      console.error(`Node type ${nodeType} not found`);
      
      // Fall back to creating a generic node if specific type not found
      nodeTemplate = {
        type: NodeType.ACTION,
        label: nodeType,
        description: "Auto-generated node",
        category: NodeCategory.COMMON,
        inputs: [{ id: "input", label: "Input", type: PortType.TRIGGER, required: true }],
        outputs: [{ id: "output", label: "Output", type: PortType.TRIGGER }],
        values: {}
      };
    }
    
    // Generate a unique ID for the node
    const nodeId = nanoid();
    console.log(`Node ID generated: ${nodeId}`);
    
    // Create the node
    const newNode: Node = {
      id: nodeId,
      type: 'scriptNode',
      position,
      data: {
        ...nodeTemplate,
        type: nodeTemplate.type || NodeType.ACTION,
        label: nodeTemplate.label || nodeType,
      },
    };
    
    console.log("Adding node to flow:", newNode);
    
    // Add the node to the flow
    setNodes((nds) => {
      console.log("Current nodes:", nds.length);
      return [...nds, newNode];
    });
    
    // Return the node ID for connections
    return nodeId;
  };
  
  // Add function to connect nodes from the assistant
  const connectNodesFromAssistant = (fromId: string, toId: string) => {
    const fromNode = nodes.find(node => node.id === fromId);
    const toNode = nodes.find(node => node.id === toId);
    
    if (!fromNode || !toNode) {
      console.error(`Cannot connect nodes: ${fromId} -> ${toId}`);
      return;
    }
    
    // Determine which handles to connect
    let sourceHandle = 'output';
    let targetHandle = 'input';
    
    // For "Branch" nodes, use the "true" output by default
    if (fromNode.data.label === 'Branch') {
      sourceHandle = 'true';
    }
    
    const newEdge: Edge = {
      id: `e${fromId}-${toId}`,
      source: fromId,
      target: toId,
      sourceHandle,
      targetHandle,
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  };
  
  // Toggle the scripting assistant visibility
  const toggleScriptingAssistant = () => {
    console.log("Toggling AI Script Helper visibility, current state:", showScriptingAssistant);
    setShowScriptingAssistant(!showScriptingAssistant);
  };
  
  // Create a button to toggle the scripting assistant
  const scriptingAssistantButton = (
    <button 
      className="assistant-button" 
      onClick={toggleScriptingAssistant}
      style={{
        backgroundColor: '#8a2be2',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginLeft: 'auto',
        border: '1px solid #9b4ddb',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      {showScriptingAssistant ? 'Close AI Helper' : '🧠 AI Script Helper'}
    </button>
  );
  
  return (
    <>
      <div className="visual-script-editor">
        <div className="visual-script-toolbar">
          <QuickActions
            onNewScript={handleNewScript}
            onSaveScript={handleSaveScript}
            onLoadScript={handleLoadScript}
            onExportScript={handleExportScript}
            onRunSimulation={handleRunSimulation}
            onOpenHelp={handleOpenHelp}
          />
          {scriptingAssistantButton}
        </div>
        
        <div className="visual-script-content">
          <NodeSelector onAddNode={onAddNode} />
          
          <div className="react-flow-container">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedNode(null)}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
              <Background />
              <Controls />
              <MiniMap 
                nodeStrokeWidth={3}
                nodeColor={(node) => {
                  switch (node.data.type) {
                    case NodeType.EVENT:
                      return '#ffcc00';
                    case NodeType.ACTION:
                      return '#00ccff';
                    case NodeType.CONDITION:
                      return '#ff6666';
                    case NodeType.AI:
                      return '#ff9900';
                    default:
                      return '#999999';
                  }
                }}
              />
              <Panel position="top-left">
                <h3>New Script</h3>
                <p>Drag nodes from the left panel to create your script.</p>
                <p>Connect nodes by dragging from outputs to inputs.</p>
              </Panel>
            </ReactFlow>
          </div>
          
          {selectedNode && (
            <div className="node-properties">
              <h3>Node Properties</h3>
              <div className="node-properties-content">
                <div className="property-group">
                  <div className="property-label">Type</div>
                  <div className="property-value">{selectedNode.data.label}</div>
                </div>
                {selectedNode.data.description && (
                  <div className="property-group">
                    <div className="property-label">Description</div>
                    <div className="property-value">{selectedNode.data.description}</div>
                  </div>
                )}
                {selectedNode.data.inputs && selectedNode.data.inputs.length > 0 && (
                  <div className="property-group">
                    <div className="property-label">Inputs</div>
                    <div className="property-value">
                      {selectedNode.data.inputs.map((input: PortType) => (
                        <div key={input.id} className="port-info">
                          <span className="port-name">{input.label}</span>
                          <span className="port-type">{input.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedNode.data.outputs && selectedNode.data.outputs.length > 0 && (
                  <div className="property-group">
                    <div className="property-label">Outputs</div>
                    <div className="property-value">
                      {selectedNode.data.outputs.map((output: PortType) => (
                        <div key={output.id} className="port-info">
                          <span className="port-name">{output.label}</span>
                          <span className="port-type">{output.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedNode.data.parameters && selectedNode.data.parameters.length > 0 && (
                  <div className="property-group">
                    <div className="property-label">Parameters</div>
                    <div className="property-value">
                      {selectedNode.data.parameters.map((param: any) => (
                        <div key={param.id} className="parameter">
                          <label>{param.label}</label>
                          {renderParameterInput(param, selectedNode.id)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showDocs && <Documentation onClose={handleCloseHelp} />}
      
      {/* Add the ScriptingAssistant component */}
      {showScriptingAssistant && (
        <ScriptingAssistant 
          onClose={toggleScriptingAssistant}
          onCreateNode={createNodeFromAssistant}
          onConnectNodes={connectNodesFromAssistant}
          availableNodes={Object.keys(ALL_NODE_TYPES)}
          currentNodes={nodes}
        />
      )}
    </>
  );
};

// Update CSS for the Scripting Assistant button
// Add to the stylesheet or inline styles
const additionalStyles = `
  .assistant-button {
    background-color: #8a2be2;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  
  .assistant-button:hover {
    background-color: #9b4ddb;
  }
`;

// Wrap with ReactFlowProvider
const VisualScriptEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <style>{additionalStyles}</style>
      <VisualScriptEditorContent />
    </ReactFlowProvider>
  );
};

export default VisualScriptEditor; 
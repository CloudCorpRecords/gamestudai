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
  
  return (
    <div className="visual-script-editor">
      <div className="editor-header">
        <div className="script-info">
          <input 
            type="text" 
            className="script-name-input" 
            value={scriptName}
            onChange={(e) => {
              setScriptName(e.target.value);
              setIsModified(true);
            }}
          />
          {isModified && <span className="modified-indicator">*</span>}
        </div>
        
        <QuickActions
          onNewScript={handleNewScript}
          onSaveScript={handleSaveScript}
          onLoadScript={handleLoadScript}
          onExportScript={handleExportScript}
          onRunSimulation={handleRunSimulation}
          onOpenHelp={handleOpenHelp}
        />
      </div>
      
      <div className="editor-content">
        <NodeSelector onAddNode={onAddNode} />
        
        <div className="flow-container" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            attributionPosition="bottom-right"
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
            
            <Panel position="top-right" className="flow-info-panel">
              <div className="info-panel-content">
                <div className="node-count">{nodes.length} Nodes</div>
                <div className="edge-count">{edges.length} Connections</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
      
      {showDocs && (
        <Documentation onClose={handleCloseHelp} />
      )}
    </div>
  );
};

// Wrap with ReactFlowProvider
const VisualScriptEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <VisualScriptEditorContent />
    </ReactFlowProvider>
  );
};

export default VisualScriptEditor; 
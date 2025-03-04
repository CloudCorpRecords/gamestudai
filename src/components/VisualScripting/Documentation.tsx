import React, { useState } from 'react';
import { FaTimes, FaQuestion, FaBook, FaPlus, FaLink, FaTrash, FaPlay } from 'react-icons/fa';
import './Documentation.css';

const Documentation: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [activePage, setActivePage] = useState<string>('getting-started');

  return (
    <div className="documentation-panel">
      <div className="documentation-header">
        <h2>Visual Scripting Documentation</h2>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="documentation-content">
        <div className="documentation-sidebar">
          <div 
            className={`sidebar-item ${activePage === 'getting-started' ? 'active' : ''}`}
            onClick={() => setActivePage('getting-started')}
          >
            Getting Started
          </div>
          <div 
            className={`sidebar-item ${activePage === 'node-types' ? 'active' : ''}`}
            onClick={() => setActivePage('node-types')}
          >
            Node Types
          </div>
          <div 
            className={`sidebar-item ${activePage === 'connections' ? 'active' : ''}`}
            onClick={() => setActivePage('connections')}
          >
            Making Connections
          </div>
          <div 
            className={`sidebar-item ${activePage === 'properties' ? 'active' : ''}`}
            onClick={() => setActivePage('properties')}
          >
            Node Properties
          </div>
          <div 
            className={`sidebar-item ${activePage === 'saving' ? 'active' : ''}`}
            onClick={() => setActivePage('saving')}
          >
            Saving & Loading
          </div>
          <div 
            className={`sidebar-item ${activePage === 'advanced' ? 'active' : ''}`}
            onClick={() => setActivePage('advanced')}
          >
            Advanced Features
          </div>
        </div>

        <div className="documentation-page">
          {activePage === 'getting-started' && (
            <div className="page-content">
              <h3>Getting Started with Visual Scripting</h3>
              
              <p>
                Visual Scripting allows you to create game behaviors without writing code.
                Instead, you connect nodes that represent events, actions, and logic to create a flow.
              </p>

              <div className="documentation-section">
                <h4>Basic Concepts</h4>
                <p>
                  <strong>Nodes</strong> represent specific functions or events in your game.
                  <strong>Connections</strong> determine the flow of execution between nodes.
                  <strong>Properties</strong> are settings that customize how a node behaves.
                </p>
              </div>

              <div className="documentation-section">
                <h4>Creating Your First Script</h4>
                <ol>
                  <li>
                    <strong>Add an Event Node</strong> - Start with an event like "Game Start" or "On Click" from the Events category
                    <div className="doc-image-placeholder">
                      <FaPlus /> Adding an event node
                    </div>
                  </li>
                  <li>
                    <strong>Add an Action Node</strong> - Choose an action to perform when the event triggers
                    <div className="doc-image-placeholder">
                      <FaPlus /> Adding an action node
                    </div>
                  </li>
                  <li>
                    <strong>Connect the Nodes</strong> - Click and drag from an output port to an input port
                    <div className="doc-image-placeholder">
                      <FaLink /> Connecting nodes
                    </div>
                  </li>
                  <li>
                    <strong>Configure Properties</strong> - Set the properties of your nodes
                  </li>
                  <li>
                    <strong>Run the Simulation</strong> - Press the Play button to test your script
                    <div className="doc-image-placeholder">
                      <FaPlay /> Running the script
                    </div>
                  </li>
                </ol>
              </div>

              <div className="documentation-tips">
                <h4>Tips:</h4>
                <ul>
                  <li>Use the search bar to quickly find nodes</li>
                  <li>Hover over ports to see what type of data they expect</li>
                  <li>You can only connect compatible port types</li>
                  <li>Right-click on the canvas for additional options</li>
                </ul>
              </div>
            </div>
          )}

          {activePage === 'node-types' && (
            <div className="page-content">
              <h3>Node Types</h3>
              
              <p>
                Nodes are categorized by their function in the game. Understanding 
                these categories helps you create more organized and effective scripts.
              </p>

              <div className="node-category">
                <div className="node-category-header event-color">
                  <h4>Event Nodes</h4>
                </div>
                <p>
                  Event nodes are the starting points of your scripts. They trigger when 
                  specific events occur in your game.
                </p>
                <div className="node-examples">
                  <div className="node-example">
                    <strong>Game Start</strong> - Triggers when the game begins
                  </div>
                  <div className="node-example">
                    <strong>On Click</strong> - Triggers when an object is clicked
                  </div>
                  <div className="node-example">
                    <strong>On Collision</strong> - Triggers when objects collide
                  </div>
                </div>
              </div>

              <div className="node-category">
                <div className="node-category-header action-color">
                  <h4>Action Nodes</h4>
                </div>
                <p>
                  Action nodes perform operations that change the game state, like moving 
                  objects or playing sounds.
                </p>
                <div className="node-examples">
                  <div className="node-example">
                    <strong>Move Object</strong> - Changes an object's position
                  </div>
                  <div className="node-example">
                    <strong>Play Sound</strong> - Plays an audio clip
                  </div>
                  <div className="node-example">
                    <strong>Set Property</strong> - Changes a property of an object
                  </div>
                </div>
              </div>

              <div className="node-category">
                <div className="node-category-header condition-color">
                  <h4>Logic/Condition Nodes</h4>
                </div>
                <p>
                  Logic nodes control the flow of execution based on conditions or manipulate data.
                </p>
                <div className="node-examples">
                  <div className="node-example">
                    <strong>Branch</strong> - Takes different paths based on a condition
                  </div>
                  <div className="node-example">
                    <strong>Compare</strong> - Compares two values
                  </div>
                </div>
              </div>

              <div className="node-category">
                <div className="node-category-header math-color">
                  <h4>Math Nodes</h4>
                </div>
                <p>
                  Math nodes perform mathematical operations on values.
                </p>
                <div className="node-examples">
                  <div className="node-example">
                    <strong>Add</strong> - Adds two or more values
                  </div>
                  <div className="node-example">
                    <strong>Random</strong> - Generates a random value
                  </div>
                </div>
              </div>

              <div className="node-category">
                <div className="node-category-header ai-color">
                  <h4>AI Nodes</h4>
                </div>
                <p>
                  AI nodes provide artificial intelligence capabilities.
                </p>
                <div className="node-examples">
                  <div className="node-example">
                    <strong>Generate Text</strong> - Creates text using AI
                  </div>
                  <div className="node-example">
                    <strong>Pathfinding</strong> - Finds paths for characters
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'connections' && (
            <div className="page-content">
              <h3>Making Connections</h3>
              
              <p>
                Connections determine how data and execution flow between nodes.
                Understanding port types is key to making proper connections.
              </p>

              <div className="documentation-section">
                <h4>Connection Basics</h4>
                <p>
                  To create a connection, click on an output port (right side) of one node and 
                  drag to an input port (left side) of another node. Compatible ports will 
                  highlight when you hover over them.
                </p>
                <div className="doc-image-placeholder">
                  <FaLink /> Creating a connection
                </div>
              </div>

              <div className="documentation-section">
                <h4>Port Types</h4>
                <div className="port-type-list">
                  <div className="port-type">
                    <div className="port-color trigger"></div>
                    <div className="port-info">
                      <strong>Trigger</strong> - Controls execution flow
                    </div>
                  </div>
                  <div className="port-type">
                    <div className="port-color boolean"></div>
                    <div className="port-info">
                      <strong>Boolean</strong> - True/False values
                    </div>
                  </div>
                  <div className="port-type">
                    <div className="port-color number"></div>
                    <div className="port-info">
                      <strong>Number</strong> - Numeric values
                    </div>
                  </div>
                  <div className="port-type">
                    <div className="port-color string"></div>
                    <div className="port-info">
                      <strong>String</strong> - Text values
                    </div>
                  </div>
                  <div className="port-type">
                    <div className="port-color vector"></div>
                    <div className="port-info">
                      <strong>Vector3</strong> - 3D position/rotation values
                    </div>
                  </div>
                  <div className="port-type">
                    <div className="port-color color"></div>
                    <div className="port-info">
                      <strong>Color</strong> - Color values
                    </div>
                  </div>
                  <div className="port-type">
                    <div className="port-color object"></div>
                    <div className="port-info">
                      <strong>Object</strong> - References to game objects
                    </div>
                  </div>
                </div>
              </div>

              <div className="documentation-section">
                <h4>Connection Rules</h4>
                <ul>
                  <li>You can only connect compatible port types</li>
                  <li>Trigger ports (execution flow) can only connect to other trigger ports</li>
                  <li>Data ports must match types (e.g., number to number)</li>
                  <li>Some ports accept multiple connections, others only one</li>
                  <li>Required input ports are marked with an asterisk (*)</li>
                </ul>
              </div>

              <div className="documentation-section">
                <h4>Managing Connections</h4>
                <p>
                  To delete a connection, click on it and press delete, or right-click 
                  and select "Delete" from the context menu.
                </p>
                <div className="doc-image-placeholder">
                  <FaTrash /> Deleting a connection
                </div>
              </div>
            </div>
          )}

          {activePage === 'properties' && (
            <div className="page-content">
              <h3>Node Properties</h3>
              
              <p>
                Properties allow you to customize the behavior of nodes.
                Each node type has different properties that you can adjust.
              </p>

              <div className="documentation-section">
                <h4>Property Types</h4>

                <div className="property-type">
                  <h5>Basic Input Types</h5>
                  <ul>
                    <li>
                      <strong>Text</strong> - For entering text strings
                    </li>
                    <li>
                      <strong>Number</strong> - For entering numeric values
                    </li>
                    <li>
                      <strong>Checkbox</strong> - For boolean (true/false) values
                    </li>
                    <li>
                      <strong>Dropdown</strong> - For selecting from predefined options
                    </li>
                  </ul>
                </div>

                <div className="property-type">
                  <h5>Advanced Input Types</h5>
                  <ul>
                    <li>
                      <strong>Slider</strong> - For adjusting a value within a range
                    </li>
                    <li>
                      <strong>Color Picker</strong> - For selecting colors
                    </li>
                    <li>
                      <strong>Vector3</strong> - For entering 3D positions or rotations (X, Y, Z)
                    </li>
                    <li>
                      <strong>Text Area</strong> - For entering multi-line text
                    </li>
                  </ul>
                </div>
              </div>

              <div className="documentation-section">
                <h4>Advanced Properties</h4>
                <p>
                  Some nodes have advanced properties that are hidden by default to keep the 
                  interface clean. Click the gear icon (⚙️) in the node header to show or hide 
                  advanced properties.
                </p>
                <div className="doc-image-placeholder">
                  Advanced properties toggle
                </div>
              </div>

              <div className="documentation-section">
                <h4>Tips for Working with Properties</h4>
                <ul>
                  <li>Hover over property labels to see descriptions</li>
                  <li>Use default values as a starting point</li>
                  <li>Connect data ports to override property values dynamically</li>
                  <li>You can reset properties to defaults by right-clicking them</li>
                </ul>
              </div>
            </div>
          )}

          {activePage === 'saving' && (
            <div className="page-content">
              <h3>Saving & Loading Scripts</h3>
              
              <p>
                Managing your scripts effectively is essential for organizing your game's behaviors
                and sharing them across projects.
              </p>

              <div className="documentation-section">
                <h4>Saving Scripts</h4>
                <p>
                  Click the "Save" button in the toolbar to save your current script.
                  You'll be prompted to name your script if it's new.
                </p>
                <p>
                  Scripts with unsaved changes display an asterisk (*) next to their name.
                </p>
              </div>

              <div className="documentation-section">
                <h4>Loading Scripts</h4>
                <p>
                  Click the "Load" button to open a script browser where you can select 
                  a previously saved script to edit.
                </p>
              </div>

              <div className="documentation-section">
                <h4>Exporting and Importing</h4>
                <p>
                  Use "Export" to save your script as a JSON file that can be shared or backed up.
                  Use "Import" to load a script from a JSON file.
                </p>
              </div>

              <div className="documentation-section">
                <h4>Script Templates</h4>
                <p>
                  Browse pre-built script templates to jumpstart your development. Templates
                  provide common behaviors that you can customize for your needs.
                </p>
              </div>
            </div>
          )}

          {activePage === 'advanced' && (
            <div className="page-content">
              <h3>Advanced Features</h3>
              
              <p>
                Once you're comfortable with the basics, explore these advanced features
                to create more sophisticated game behaviors.
              </p>

              <div className="documentation-section">
                <h4>Variables</h4>
                <p>
                  Create variables to store and reuse values across your script.
                  Variables can be global (across all scripts) or local (to the current script).
                </p>
              </div>

              <div className="documentation-section">
                <h4>Subgraphs</h4>
                <p>
                  Organize complex scripts by creating subgraphs, which are reusable mini-scripts
                  that you can include in other scripts.
                </p>
              </div>

              <div className="documentation-section">
                <h4>Custom Nodes</h4>
                <p>
                  Create your own nodes that encapsulate complex behaviors. Custom nodes
                  can be shared across projects and with other team members.
                </p>
              </div>

              <div className="documentation-section">
                <h4>Debugging Tools</h4>
                <p>
                  Use the built-in debugging tools to track the execution of your scripts:
                </p>
                <ul>
                  <li>
                    <strong>Execution Highlighting</strong> - See which nodes are currently executing
                  </li>
                  <li>
                    <strong>Breakpoints</strong> - Pause execution at specific nodes
                  </li>
                  <li>
                    <strong>Value Inspection</strong> - Hover over ports to see their current values
                  </li>
                </ul>
              </div>

              <div className="documentation-section">
                <h4>Performance Optimization</h4>
                <p>
                  Tips for optimizing your scripts for better performance:
                </p>
                <ul>
                  <li>Avoid unnecessary trigger connections</li>
                  <li>Use events rather than continuous polling when possible</li>
                  <li>Consider caching values that don't change frequently</li>
                  <li>Break complex scripts into smaller, more manageable subgraphs</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documentation; 
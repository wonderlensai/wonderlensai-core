import React, { useState, useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

// Define types for our network data
interface NodeObject {
  id: string;
  name: string;
  group: string;
  color: string;
  val: number;
  x?: number;
  y?: number;
  z?: number;
  pulsating?: boolean; // New field for pulsating effect
  highlightedNode?: boolean; // New field for highlight effect
}

interface LinkObject {
  id: string;
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

interface GroupColor {
  color: string;
  glowColor?: string; // New field for glow color
}

// Improved colors with modern gradient-ready palettes and glow colors
const generateNetworkData = (): GraphData => {
  // Categories with specific colors - updated with more futuristic palette
  const groups: Record<string, GroupColor> = {
    user: { color: '#5EC6FF', glowColor: '#5EC6FF80' },      // Bright Blue
    history: { color: '#FF757D', glowColor: '#FF757D80' },    // Coral Pink
    science: { color: '#FFE26A', glowColor: '#FFE26A80' },    // Vibrant Yellow
    math: { color: '#6BEE90', glowColor: '#6BEE9080' },       // Neon Green
    geography: { color: '#AD98FF', glowColor: '#AD98FF80' },  // Lavender Purple
    art: { color: '#FF9CA2', glowColor: '#FF9CA280' },        // Soft Pink
    language: { color: '#8DD5FF', glowColor: '#8DD5FF80' },   // Sky Blue
    literature: { color: '#E15E65', glowColor: '#E15E6580' }  // Deep Red
  };

  // User names
  const userNames = [
    'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'William', 'Sophia', 'Mason',
    'Isabella', 'James', 'Mia', 'Benjamin', 'Charlotte', 'Jacob', 'Amelia',
    'Michael', 'Harper', 'Elijah', 'Evelyn', 'Ethan'
  ];

  // Topic names by category
  const topics: Record<string, string[]> = {
    history: ['Ancient Egypt', 'World War II', 'Renaissance', 'Civil Rights', 'Industrial Revolution', 'Ancient Greece'],
    science: ['Solar System', 'Human Body', 'Ecosystems', 'Chemistry', 'Physics', 'Genetics'],
    math: ['Fractions', 'Geometry', 'Algebra', 'Statistics', 'Calculus', 'Trigonometry'],
    geography: ['Continents', 'Oceans', 'Countries', 'Climate', 'Mountains', 'Rivers'],
    art: ['Painting', 'Sculpture', 'Photography', 'Architecture', 'Digital Art'],
    language: ['Spanish', 'French', 'Mandarin', 'Japanese', 'German'],
    literature: ['Poetry', 'Fiction', 'Drama', 'Myths', 'Fables']
  };

  // Generate nodes
  const nodes: NodeObject[] = [];
  let nodeId = 1;

  // Add user nodes
  userNames.forEach(name => {
    nodes.push({
      id: `user${nodeId}`,
      name,
      group: 'user',
      color: groups.user.color,
      val: 5 + Math.random() * 8,
      pulsating: Math.random() > 0.7, // Some nodes will pulsate
      highlightedNode: Math.random() > 0.9 // A few nodes will be highlighted
    });
    nodeId++;
  });

  // Add topic nodes
  Object.entries(topics).forEach(([category, categoryTopics]) => {
    categoryTopics.forEach(topic => {
      if (nodes.length < 50) {
        nodes.push({
          id: `${category}${nodeId}`,
          name: topic,
          group: category,
          color: groups[category as keyof typeof groups].color,
          val: 8 + Math.random() * 10,
          pulsating: Math.random() > 0.8, // Some nodes will pulsate
          highlightedNode: Math.random() > 0.9 // A few nodes will be highlighted
        });
        nodeId++;
      }
    });
  });

  // Ensure exactly 50 nodes
  while (nodes.length < 50) {
    const randomGroupKey = Object.keys(groups)[Math.floor(Math.random() * Object.keys(groups).length)];
    if (randomGroupKey === 'user') {
      const randomIdx = Math.floor(Math.random() * userNames.length);
      nodes.push({
        id: `user${nodeId}`,
        name: `${userNames[randomIdx]}_${nodeId}`,
        group: 'user',
        color: groups.user.color,
        val: 5 + Math.random() * 8,
        pulsating: Math.random() > 0.8,
        highlightedNode: Math.random() > 0.9
      });
    } else {
      const topicsInGroup = topics[randomGroupKey] || [];
      if (topicsInGroup.length > 0) {
        const randomTopic = topicsInGroup[Math.floor(Math.random() * topicsInGroup.length)];
        nodes.push({
          id: `${randomGroupKey}${nodeId}`,
          name: `${randomTopic}_${nodeId}`,
          group: randomGroupKey,
          color: groups[randomGroupKey as keyof typeof groups].color,
          val: 8 + Math.random() * 10,
          pulsating: Math.random() > 0.8,
          highlightedNode: Math.random() > 0.9
        });
      }
    }
    nodeId++;
  }

  // Generate links - each node will connect to 2-6 other nodes
  const links: LinkObject[] = [];
  nodes.forEach(node => {
    // Users connect to content, content connects to related content
    const isUser = node.group === 'user';
    const connectionCount = Math.floor(Math.random() * 4) + 2; // 2-6 connections
    
    // Create a pool of potential target nodes
    const potentialTargets = nodes.filter(target => {
      // Users connect to content only
      if (isUser && target.group === 'user') return false;
      // Content connects to users or related content
      if (!isUser && target.group !== 'user' && target.group !== node.group) return false;
      // Don't connect to self
      if (target.id === node.id) return false;
      return true;
    });
    
    // Create connections
    for (let i = 0; i < Math.min(connectionCount, potentialTargets.length); i++) {
      // Pick a random target that hasn't been connected yet
      const randomIndex = Math.floor(Math.random() * potentialTargets.length);
      const target = potentialTargets.splice(randomIndex, 1)[0];
      
      if (target) {
        links.push({
          id: `${node.id}-${target.id}`,
          source: node.id,
          target: target.id,
          value: 1 + Math.random() * 5
        });
      }
    }
  });

  return { nodes, links };
};

// Generate the data
const data = generateNetworkData();

interface SocialGraphProps {
  width?: number;
  height?: number;
}

const SocialGraph: React.FC<SocialGraphProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: width || 350, height: height || 95 });
  const [time, setTime] = useState(0); // State to track animation time
  const navigate = useNavigate();
  
  useEffect(() => {
    if (width && height) {
      setDimensions({ width, height });
      return;
    }

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: containerWidth || 350,
          height: containerHeight || 320 // Increased default height for better visualization
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [width, height]);

  // Create animation effect for pulsating nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Set initial zoom level and animation when the graph is loaded
  useEffect(() => {
    if (graphRef.current) {
      // Wait a bit for the graph to initialize
      const timer = setTimeout(() => {
        const distance = 200; // Adjusted distance for better view
        const cameraPosition = graphRef.current.cameraPosition();
        
        if (cameraPosition) {
          const { x, y } = cameraPosition;
          graphRef.current.cameraPosition(
            { x, y, z: distance },  // New position
            { x: 0, y: 0, z: 0 },   // Look-at position (center of the graph)
            1000                    // Transition duration (ms)
          );
        }
        
        // Start auto-rotation for more dynamic view
        graphRef.current.controls().autoRotate = true;
        graphRef.current.controls().autoRotateSpeed = 0.5;
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [dimensions]);

  // Set auto-rotation for dynamic view
  useEffect(() => {
    const animateGraph = () => {
      if (graphRef.current && graphRef.current.controls()) {
        graphRef.current.controls().update();
      }
      requestAnimationFrame(animateGraph);
    };
    
    // Start animation
    const animationId = requestAnimationFrame(animateGraph);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleClick = () => {
    navigate("/shared");
  };

  // This creates a glow effect sphere around nodes
  const createGlowEffect = (node: NodeObject) => {
    const group = new THREE.Group();
    
    // Main sphere
    const { val, color, pulsating, highlightedNode } = node;
    const radius = Math.sqrt(val) * 1.5;
    const sphereGeometry = new THREE.SphereGeometry(radius, 24, 24);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color || '#ff7700'),
      transparent: true,
      opacity: 0.9,
      shininess: 90,
      specular: new THREE.Color(0xffffff)
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);
    
    // Add glow effect for highlighted nodes
    if (highlightedNode) {
      const glowGeometry = new THREE.SphereGeometry(radius * 1.4, 24, 24);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color || '#ff7700'),
        transparent: true,
        opacity: 0.2,
      });
      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glowSphere);
    }
    
    // Add pulsating effect
    if (pulsating) {
      // Use the time state to create a pulsation
      const pulseFactor = 1 + 0.15 * Math.sin(time * 0.1 + Math.random() * 10);
      sphere.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
    
    return group;
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleClick} 
      style={{ 
        cursor: "pointer", 
        width: "100%", 
        height: "100%",
        borderRadius: '16px', // Rounded corners
        overflow: 'hidden', // Ensure content doesn't overflow rounded corners
        background: 'linear-gradient(to bottom right, #F8FBFF, #EEFAFF)' // Subtle gradient background
      }}
      title="Click to explore shared learning"
    >
      <ForceGraph3D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#12121e" // Dark background for better contrast and futuristic look
        nodeLabel={(node: any) => `${(node as NodeObject).name} (${(node as NodeObject).group})`}
        nodeThreeObject={(node: any) => createGlowEffect(node as NodeObject)}
        linkWidth={(link: any) => Math.sqrt((link.value || 1) / 2)}
        linkOpacity={0.6}
        linkColor={() => "rgba(200, 200, 255, 0.5)"} // Light blue links
        linkDirectionalParticles={3} // More particles
        linkDirectionalParticleWidth={(link: any) => Math.sqrt((link.value || 1) * 1.5)}
        linkDirectionalParticleSpeed={0.01}
        linkDirectionalParticleColor={() => "rgba(255, 255, 255, 0.8)"} // Bright particles
        cooldownTicks={100}
        enableNodeDrag={false}
        enableNavigationControls={true}
        controlType="orbit"
      />
    </div>
  );
};

export default SocialGraph;
import { useRef, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Tooltip } from '@mui/material';

interface NodeObject {
  id: string;
  name: string;
  group: string;
  val: number;
  x?: number;
  y?: number;
  __indexColor?: string;
}

interface LinkObject {
  source: string | NodeObject;
  target: string | NodeObject;
  value: number;
}

interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

interface LearningGraphProps {
  data: GraphData;
  height?: number;
  width?: number;
}

const LearningGraph = ({ data, height = 500, width = 800 }: LearningGraphProps) => {
  const graphRef = useRef<any>(null);
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState<NodeObject | null>(null);
  
  // Group colors
  const groupColors = {
    user: '#FF6B6B',      // Coral
    history: '#4ECDC4',   // Turquoise
    science: '#FFD93D',   // Yellow
    math: '#95E1D3',      // Mint
    geography: '#6C63FF'  // Purple
  };

  const handleNodeClick = useCallback((node: NodeObject) => {
    if (node.group === 'user') {
      // Navigate to user profile or show user info
      console.log(`View user: ${node.name}`);
    } else {
      // Navigate to learning content based on subject
      console.log(`View content: ${node.name} (${node.group})`);
      navigate(`/learn/${node.group}`);
    }
  }, [navigate]);

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    setHoveredNode(node);
    document.body.style.cursor = node ? 'pointer' : 'default';
  }, []);

  const nodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x = 0, y = 0, name, group, val } = node;
    
    // Node size based on value with min/max limits
    const size = Math.max(5, Math.min(20, val));
    const fontSize = 14 / globalScale;
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = groupColors[group as keyof typeof groupColors] || '#999';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw highlight for hovered node
    if (hoveredNode && hoveredNode.id === node.id) {
      ctx.beginPath();
      ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw labels on nodes with sufficient zoom
    if (globalScale > 0.8) {
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333';
      
      // Draw white background for text readability
      const textWidth = ctx.measureText(name).width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(x - textWidth / 2 - 2, y + size + 2, textWidth + 4, fontSize + 2);
      
      // Draw text
      ctx.fillStyle = '#333';
      ctx.fillText(name, x, y + size + fontSize / 2 + 2);
    }
  }, [hoveredNode, groupColors]);

  const linkColor = useCallback((link: { source: any; target: any }) => {
    // Different colors for connections between different group types
    const sourceGroup = typeof link.source === 'object' ? link.source.group : 'unknown';
    const targetGroup = typeof link.target === 'object' ? link.target.group : 'unknown';
    
    if (sourceGroup === 'user' && targetGroup === 'user') {
      return 'rgba(255, 107, 107, 0.5)';  // User-user: light coral
    } else if (sourceGroup === 'user' || targetGroup === 'user') {
      return 'rgba(108, 99, 255, 0.5)';   // User-content: light purple
    } else {
      return 'rgba(78, 205, 196, 0.5)';   // Content-content: light turquoise
    }
  }, []);

  return (
    <Box 
      sx={{ 
        position: 'relative',
        borderRadius: 4, 
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        height={height}
        width={width}
        nodeRelSize={6}
        nodeCanvasObject={nodeCanvasObject}
        linkColor={linkColor}
        linkWidth={(link: { value?: number }) => Math.sqrt(link.value || 1)}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link: { value?: number }) => Math.sqrt((link.value || 1) / 2)}
        nodeLabel={(node: NodeObject) => `${node.name} (${node.group})`}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
        cooldownTime={2000}
      />
      {hoveredNode && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            maxWidth: 200
          }}
        >
          <Typography fontWeight="bold">{hoveredNode.name}</Typography>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {hoveredNode.group}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LearningGraph; 
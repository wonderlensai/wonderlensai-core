import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ASPECT_RATIO = 5 / 3;
const NODE_COUNT = 10;

const NetworkContainer = styled(Paper)(() => ({
  position: 'relative',
  width: '100%',
  aspectRatio: ASPECT_RATIO,
  minHeight: 400,
  maxWidth: '100vw',
  margin: '0 auto',
  borderRadius: 20,
  overflow: 'hidden',
  backgroundColor: '#F7F9FC',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

// Default images for each subject
const subjectImages: Record<string, string> = {
  History: '/images/history.png',
  Science: '/images/science.png',
  Math: '/images/math.png',
  Geography: '/images/geography.png',
};

function generateMockNodes(width: number, height: number) {
  const subjects = ['History', 'Science', 'Math', 'Geography'];
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const size = Math.random() * 40 + 60;
    const popularity = Math.random();
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    nodes.push({
      id: i + 1,
      x: Math.random() * (width - size) + size / 2,
      y: Math.random() * (height - size) + size / 2,
      size,
      subject,
      image: subjectImages[subject],
      popularity,
      connections: Math.floor(Math.random() * 5) + 1,
    });
  }
  return nodes;
}

function generateConnections(nodes: any[]) {
  const connections: any[] = [];
  nodes.forEach((node, index) => {
    const closestNodes = nodes
      .map((otherNode, otherIndex) => ({
        node: otherNode,
        distance: Math.sqrt(
          Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
        ),
        index: otherIndex,
      }))
      .filter(({ index: idx }) => idx !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, node.connections);
    closestNodes.forEach(({ node: targetNode }) => {
      connections.push({
        id: `${node.id}-${targetNode.id}`,
        source: node,
        target: targetNode,
        strength: (node.popularity + targetNode.popularity) / 2,
      });
    });
  });
  return connections;
}

const SharedLearning = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use ResizeObserver for reliable size detection
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new window.ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Regenerate nodes/connections on size change
  useEffect(() => {
    if (containerSize.width > 100 && containerSize.height > 100) {
      setIsLoading(true);
      const { width, height } = containerSize;
      const newNodes = generateMockNodes(width, height);
      setNodes(newNodes);
      setConnections(generateConnections(newNodes));
      setTimeout(() => setIsLoading(false), 500); // Simulate loading
    }
  }, [containerSize.width, containerSize.height]);

  const handleNodeClick = useCallback((node: any) => {
    // Here you would navigate to the specific learning content
    alert(`Node clicked: ${node.subject}`);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FE 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
            What Others Are Learning
          </Typography>
        </Box>
        <NetworkContainer ref={containerRef}>
          {containerSize.width > 100 && containerSize.height > 100 ? (
            isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  minHeight: 300,
                }}
              >
                <CircularProgress size={60} />
              </Box>
            ) : (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={2.5}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
                panning={{ velocityDisabled: true }}
              >
                <TransformComponent>
                  <svg
                    width={containerSize.width}
                    height={containerSize.height}
                    style={{
                      display: 'block',
                      background: 'none',
                    }}
                  >
                    {/* Draw connections */}
                    {connections.map((connection) => (
                      <line
                        key={connection.id}
                        x1={connection.source.x}
                        y1={connection.source.y}
                        x2={connection.target.x}
                        y2={connection.target.y}
                        stroke="#9B59B6"
                        strokeWidth={connection.strength * 3}
                        strokeDasharray="5,5"
                        opacity={connection.strength * 0.6}
                      />
                    ))}
                    {/* Draw nodes as SVG groups */}
                    {nodes.map((node) => (
                      <g
                        key={node.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleNodeClick(node)}
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.size / 2}
                          fill={node.subject === 'History' ? '#FF6B6B' : node.subject === 'Science' ? '#4ECDC4' : node.subject === 'Math' ? '#FFD93D' : '#95E1D3'}
                          stroke="#fff"
                          strokeWidth={4}
                          opacity={0.85}
                        />
                        <image
                          href={node.image}
                          x={node.x - node.size / 2}
                          y={node.y - node.size / 2}
                          width={node.size}
                          height={node.size}
                          clipPath={`circle(${node.size / 2}px at ${node.x}px ${node.y}px)`}
                        />
                        <text
                          x={node.x}
                          y={node.y + node.size / 2 + 18}
                          textAnchor="middle"
                          fontSize="14"
                          fill="#333"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {node.subject}
                        </text>
                      </g>
                    ))}
                  </svg>
                </TransformComponent>
              </TransformWrapper>
            )
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                minHeight: 300,
              }}
            >
              <CircularProgress size={60} />
            </Box>
          )}
        </NetworkContainer>
        <Typography
          variant="body1"
          align="center"
          sx={{ mt: 3, color: 'text.secondary' }}
        >
          Explore what others are learning! Zoom, pan, and click on any image to see more details.
        </Typography>
      </Container>
    </Box>
  );
};

export default SharedLearning; 
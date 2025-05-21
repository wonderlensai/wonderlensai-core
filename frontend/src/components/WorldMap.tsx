import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import L from 'leaflet';

// Fix Leaflet icon issue
// This is needed because Leaflet's default marker icons reference assets that may not be available
// when bundled by a module bundler like webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define spinning animation style for loading indicator
const spinningAnimationStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .country-tooltip {
    background-color: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    color: white;
    font-size: 12px;
  }
  .leaflet-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
`;

interface Country {
  code: string;
  name: string;
}

interface WorldMapProps {
  countryName?: string;
  countryCode?: string;
  countries?: Country[];
  funFact?: string;
  showMap?: boolean;
  onClose?: () => void;
  inline?: boolean;
  height?: number;
}

// Default countries to highlight when none specified
const defaultCountries: Country[] = [
  { code: 'USA', name: 'United States' },
  { code: 'CHN', name: 'China' },
  { code: 'IND', name: 'India' }
];

// Map country codes to coordinates for better positioning
const countryCoordinates: Record<string, [number, number]> = {
  'USA': [37, -95],
  'CAN': [60, -95],
  'GBR': [55, 0],
  'FRA': [47, 2],
  'DEU': [51, 10],
  'ITA': [42, 12],
  'ESP': [40, -4],
  'JPN': [38, 138],
  'AUS': [-25, 133],
  'BRA': [-10, -55],
  'IND': [22, 78],
  'CHN': [35, 105],
  'RUS': [60, 100],
  'EGY': [27, 30],
  'ZAF': [-30, 25],
  'MEX': [23, -102],
  'ARG': [-35, -65],
  'NLD': [52, 5], // Netherlands
};

// Helper component to set map view when props change
const MapViewSetter = ({ countries, center, zoom }: { countries: string[], center: [number, number], zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, countries]);
  
  return null;
};

const WorldMap: React.FC<WorldMapProps> = ({
  countryName,
  countryCode,
  countries = [],
  funFact,
  showMap = true,
  onClose,
  inline = false,
  height = 300
}) => {
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Inject animation styles for loading indicator
  useEffect(() => {
    // Create style element only once
    const styleElement = document.createElement('style');
    styleElement.textContent = spinningAnimationStyle;
    document.head.appendChild(styleElement);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Combine individual countryCode with countries array
  const allCountryCodes = useMemo(() => {
    const inputCountries = [...countries];
    
    if (countryCode) {
      inputCountries.push({ code: countryCode, name: countryName || countryCode });
    }
    
    if (inputCountries.length === 0) {
      return defaultCountries.map(c => c.code);
    }
    
    const codes = [...new Set(inputCountries.map(c => c.code))];
    return codes;
  }, [countryCode, countries, countryName]);

  // Get all country names for display
  const allCountryNames = useMemo(() => {
    const inputCountries = [...countries];
    
    if (countryName && countryCode) {
      inputCountries.push({ code: countryCode, name: countryName });
    }
    
    if (inputCountries.length === 0) {
      return defaultCountries.map(c => c.name);
    }
    
    const names = [...new Set(inputCountries.map(c => c.name))];
    return names;
  }, [countryName, countryCode, countries]);

  // Generate a title based on available countries
  const mapTitle = useMemo(() => {
    if (allCountryNames.length === 0) return 'World Map';
    if (allCountryNames.length === 1) return `${allCountryNames[0]} Map`;
    return 'Countries Map';
  }, [allCountryNames]);

  // Calculate the center point for all highlighted countries
  const calculateMapCenter = useMemo(() => {
    if (allCountryCodes.length === 0) return [20, 0] as [number, number];
    
    // Try to find coordinates for the first country
    for (const code of allCountryCodes) {
      if (countryCoordinates[code]) {
        return countryCoordinates[code];
      }
    }
    
    // If no coordinates found, default to world view
    return [20, 0] as [number, number];
  }, [allCountryCodes]);

  // Calculate zoom level - zoom in more for single country
  const zoomLevel = useMemo(() => {
    return allCountryCodes.length === 1 ? 4 : 2;
  }, [allCountryCodes]);

  // Load GeoJSON data
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        setMapError(null);
        // Use Natural Earth Data's GeoJSON for countries
        const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
        if (!response.ok) {
          throw new Error(`Failed to load map data: ${response.status}`);
        }
        const data = await response.json();
        setGeojsonData(data);
        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading map data:", error);
        setMapError(`Failed to load map: ${error instanceof Error ? error.message : String(error)}`);
        setMapLoaded(true);
      }
    };

    fetchGeoJSON();
  }, []);

  // Styling function for the GeoJSON layer
  const countryStyle = (feature: any) => {
    const countryCode = feature.properties.iso_a3 || feature.properties.ISO_A3;
    const isHighlighted = allCountryCodes.includes(countryCode);
    
    return {
      fillColor: isHighlighted ? '#FF9CA2' : '#99d2ee',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  // Handle each feature's GeoJSON events
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const countryName = feature.properties.name || '';
    const countryCode = feature.properties.iso_a3 || feature.properties.ISO_A3;
    const isHighlighted = allCountryCodes.includes(countryCode);
    
    // Add tooltips to show country names on hover
    layer.bindTooltip(countryName, { 
      permanent: false, 
      direction: 'center',
      className: 'country-tooltip'
    });
    
    // Add additional information for highlighted countries
    if (isHighlighted) {
      layer.bindPopup(`<b>${countryName}</b><br>Featured Country`);
    }
  };

  // If modal mode and showMap is false, don't render anything
  if (!inline && !showMap) return null;

  // Different styling for inline vs modal display
  const containerStyles = {
    width: '100%',
    backgroundColor: '#F0F8FF',
    borderRadius: inline ? 8 : 16,
    overflow: 'hidden',
    boxShadow: inline 
      ? '0 2px 8px rgba(0, 0, 0, 0.05)'
      : '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: 'none',
    position: 'relative' as 'relative',
  };

  return (
    <Box sx={containerStyles}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 1.5,
        borderBottom: '1px solid #E0F7FA',
        backgroundColor: '#E0F7FA'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PublicIcon sx={{ color: '#4ECDC4', fontSize: 20, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ color: '#2D3748', fontWeight: 600 }}>
            {countryName || mapTitle}
          </Typography>
        </Box>
        
        {!inline && onClose && (
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ 
              color: '#FF6B6B',
              '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
            }}
            aria-label="Close map"
          >
            <HighlightOffIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      {/* Country chips - show when multiple countries */}
      {allCountryNames.length > 1 && (
        <Box sx={{ 
          px: 1.5, 
          py: 0.75, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 0.5,
          borderBottom: '1px solid #E0F7FA',
          backgroundColor: '#F0F8FF'
        }}>
          {allCountryNames.map((name, index) => (
            <Chip 
              key={index} 
              label={name} 
              size="small" 
              icon={<PublicIcon sx={{ fontSize: '16px !important' }} />} 
              sx={{ 
                backgroundColor: '#E0F7FA',
                border: 'none',
                fontWeight: 500,
                height: 24,
                '& .MuiChip-label': {
                  px: 1,
                  fontSize: '0.75rem'
                }
              }} 
            />
          ))}
        </Box>
      )}
      
      <Box sx={{ height, position: 'relative' }}>
        {!mapLoaded ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #E0F7FA 0%, #E1F5FE 100%)'
          }}>
            <PublicIcon sx={{ fontSize: 60, color: '#6FDFDF', animation: 'spin 2s linear infinite' }} />
            <Typography variant="body1" sx={{ mt: 2, color: '#718096' }}>
              Loading map...
            </Typography>
          </Box>
        ) : mapError ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(180deg, #E0F7FA 0%, #E1F5FE 100%)'
          }}>
            <Typography variant="body1" sx={{ mb: 2, color: '#FF6B6B' }}>
              {mapError}
            </Typography>
          </Box>
        ) : (
          <MapContainer
            center={calculateMapCenter}
            zoom={zoomLevel}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#E1F5FE' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geojsonData && (
              <GeoJSON 
                data={geojsonData} 
                style={countryStyle} 
                onEachFeature={onEachFeature}
              />
            )}
            <MapViewSetter 
              countries={allCountryCodes} 
              center={calculateMapCenter} 
              zoom={zoomLevel} 
            />
            <ZoomControl position="bottomright" />
          </MapContainer>
        )}
      </Box>
      
      {/* Fun fact section */}
      {funFact && (
        <Box sx={{ 
          p: 1.5, 
          backgroundColor: '#FFFDE7', 
          borderTop: '1px solid #FFE082',
          fontSize: '0.9rem'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: '"Comic Neue", "Comic Sans MS", cursive', 
              fontSize: '0.95rem',
              lineHeight: 1.4
            }}
          >
            <Box component="span" sx={{ fontWeight: 'bold', color: '#FF6B6B' }}>Fun Fact: </Box>
            {funFact}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorldMap; 
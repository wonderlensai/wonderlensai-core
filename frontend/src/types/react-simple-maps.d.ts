declare module 'react-simple-maps' {
  import { ReactNode } from 'react';
  
  export interface Geography {
    rsmKey: string;
    properties: {
      NAME: string;
      ISO_A3: string;
      [key: string]: any;
    };
    geometry: any;
    id: string;
    type: string;
  }
  
  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: object;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  
  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => ReactNode;
    [key: string]: any;
  }
  
  export interface GeographyProps {
    geography: Geography;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    [key: string]: any;
  }
  
  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    onMoveStart?: (position: any) => void;
    onMove?: (position: any) => void;
    onMoveEnd?: (position: any) => void;
    [key: string]: any;
  }
  
  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
} 
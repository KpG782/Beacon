export type GraphEngineType = 'cytoscape' | 'sigmajs' | 'threejs';

export interface BaseNode {
  id: string;
  label: string;
  type: 'context' | 'memory' | 'harness' | 'source' | 'report';
  data?: Record<string, any>;
}

export interface BaseEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface GraphData {
  nodes: BaseNode[];
  edges: BaseEdge[];
}
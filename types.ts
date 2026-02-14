
export enum NodeCardType {
  TABLE = 'TABLE',
  LOGIC_NOTE = 'LOGIC_NOTE',
  REPORT = 'REPORT'
}

export interface TableColumn {
  id: string;
  name: string;
}

export interface NodeData {
  label: string;
  cardType: NodeCardType;
  columns?: TableColumn[];
  description?: string;
  bulletPoints?: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface EdgeData {
  label?: string;
  lineStyle?: 'smoothstep' | 'step' | 'straight' | 'bezier';
  hasArrow?: boolean;
}

export interface BlueprintProject {
  nodes: any[];
  edges: any[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

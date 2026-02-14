
export enum NodeCardType {
  TABLE = 'TABLE',
  LOGIC_NOTE = 'LOGIC_NOTE',
  REPORT = 'REPORT'
}

export interface TableColumn {
  id: string;
  name: string;
}

export interface TableCategory {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface ConnectionType {
  id: string;
  name: string;
  color: string;
  width: number;
  dashStyle: 'solid' | 'dashed' | 'dotted';
}

export interface NodeData {
  label: string;
  cardType: NodeCardType;
  categoryId?: string; // Reference to TableCategory
  columns?: TableColumn[];
  description?: string;
  bulletPoints?: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface EdgeData {
  typeId?: string; // Reference to ConnectionType
  label?: string;
  hasArrow?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface GlobalSettings {
  tableCategories: TableCategory[];
  connectionTypes: ConnectionType[];
}

export interface BlueprintProject {
  nodes: any[];
  edges: any[];
  settings: GlobalSettings;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

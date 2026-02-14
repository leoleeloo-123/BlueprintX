
export enum NodeCardType {
  TABLE = 'TABLE',
  LOGIC_NOTE = 'LOGIC_NOTE',
  REPORT = 'REPORT'
}

export type FontSizeScale = 'sm' | 'md' | 'lg';

export interface AppearanceSettings {
  language: 'en' | 'zh';
  canvasBgColor: string;
  headerFontSize: FontSizeScale;
  contentFontSize: FontSizeScale;
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

export interface LogicCategory {
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
  categoryId?: string; 
  columns?: TableColumn[];
  description?: string;
  bulletPoints?: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  settings?: GlobalSettings;
  appearance?: AppearanceSettings;
}

export interface EdgeData {
  typeId?: string;
  label?: string;
  hasArrow?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  settings?: GlobalSettings;
}

export interface GlobalSettings {
  tableCategories: TableCategory[];
  logicCategories: LogicCategory[];
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

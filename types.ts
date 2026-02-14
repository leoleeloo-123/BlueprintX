
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
  userName: string;
  organizationName: string;
  isLegendExpanded: boolean;
}

export interface FieldType {
  id: string;
  name: string;
}

export interface TableColumn {
  id: string;
  name: string;
  typeId?: string;
  isKey?: boolean;
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

export interface DataSource {
  id: string;
  name: string;
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
  comment?: string; // New field for table comment
  dataSourceId?: string; // New field for table data source
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
  dataSources: DataSource[]; // New global management for data sources
  fieldTypes: FieldType[]; // New global management for field types
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
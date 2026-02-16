export enum NodeCardType {
  TABLE = 'TABLE',
  LOGIC_NOTE = 'LOGIC_NOTE',
  REPORT = 'REPORT'
}

export type ViewType = 'canvas' | 'catalog';

export type TagPosition = 'left' | 'right' | 'top' | 'bottom';

export type FontSizeScale = 'sm' | 'md' | 'lg';

export interface AppearanceSettings {
  language: 'en' | 'zh';
  canvasBgColor: string;
  headerFontSize: FontSizeScale;
  contentFontSize: FontSizeScale;
  userName: string;
  organizationName: string;
  isLegendExpanded: boolean;
  maxFieldsToShow: number; 
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

export type LabelPosition = 'center' | 'source' | 'target';

export interface ConnectionType {
  id: string;
  name: string;
  color: string;
  width: number;
  dashStyle: 'solid' | 'dashed' | 'dotted';
  labelPosition?: LabelPosition;
  labelMaxWidth?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  position?: TagPosition;
}

export interface NodeData {
  label: string;
  cardType: NodeCardType;
  categoryId?: string; 
  columns?: TableColumn[];
  description?: string;
  bulletPoints?: string[];
  comment?: string; 
  dataSourceId?: string; 
  tags?: string[]; 
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  settings?: GlobalSettings;
  appearance?: AppearanceSettings;
  activeTableFilters?: string[];
  activeLogicFilters?: string[];
  activeEdgeFilters?: string[];
  activeTagFilters?: string[];
}

export interface EdgeData {
  typeId?: string;
  label?: string;
  hasArrow?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  settings?: GlobalSettings;
  activeTableFilters?: string[];
  activeLogicFilters?: string[];
  activeEdgeFilters?: string[];
  activeTagFilters?: string[];
  sourceCategoryId?: string;
  targetCategoryId?: string;
  sourceTags?: string[];
  targetTags?: string[];
}

export interface GlobalSettings {
  tableCategories: TableCategory[];
  logicCategories: LogicCategory[];
  connectionTypes: ConnectionType[];
  dataSources: DataSource[]; 
  fieldTypes: FieldType[]; 
  tags: Tag[]; 
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
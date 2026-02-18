
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  BackgroundVariant,
  Controls, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges,
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange,
  ReactFlowProvider,
  MarkerType,
  useReactFlow
} from 'reactflow';
import { Download, Upload, Plus, Layers, Settings2, X, Globe, Sliders, Trash2, Filter, ChevronDown, Link2, FileText, Database, EyeOff, Tag as TagIcon, PackageOpen, RotateCcw, Info, Check, ArrowUpDown, Maximize, Search, LayoutList, Map as MapIcon, Crosshair, Copy, Camera, Edit3 } from 'lucide-react';
import * as XLSX from 'xlsx';

import { NodeCardType, NodeData, GlobalSettings, TableCategory, ConnectionType, LogicCategory, AppearanceSettings, DataSource, FieldType, Tag, ViewType, Project, ProjectData } from './types.ts';
import { translations } from './translations.ts';
import { BlueprintCard } from './components/BlueprintCard.tsx';
import { BlueprintEdge } from './components/BlueprintEdge.tsx';
import { EditorModal } from './components/EditorModal.tsx';
import { EdgeEditorModal } from './components/EdgeEditorModal.tsx';
import { StudioSettingsModal } from './components/StudioSettingsModal.tsx';
import { Legend } from './components/Legend.tsx';
import { ExportImageModal } from './components/ExportImageModal.tsx';

const nodeTypes = { blueprintNode: BlueprintCard };
const edgeTypes = { blueprintEdge: BlueprintEdge };

const DEFAULT_SETTINGS: GlobalSettings = {
  tableCategories: [
    { id: 'cat-std', name: 'Standard Table', color: '#2563eb', isDefault: true },
    { id: 'cat-src', name: 'Source Data', color: '#16a34a' },
    { id: 'cat-tmp', name: 'Draft/Workings', color: '#9333ea' }
  ],
  logicCategories: [
    { id: 'log-std', name: 'Standard Logic', color: '#9333ea', isDefault: true },
    { id: 'log-rule', name: 'Validation Rule', color: '#dc2626' },
    { id: 'log-calc', name: 'Calculation Engine', color: '#0891b2' }
  ],
  connectionTypes: [
    { id: 'conn-std', name: 'Standard Flow', color: '#94a3b8', width: 2, dashStyle: 'solid', labelPosition: 'center', labelMaxWidth: 150 },
    { id: 'conn-crit', name: 'Critical Path', color: '#dc2626', width: 3, dashStyle: 'solid', labelPosition: 'center', labelMaxWidth: 150 },
    { id: 'conn-ref', name: 'Reference Only', color: '#64748b', width: 1, dashStyle: 'dashed', labelPosition: 'center', labelMaxWidth: 150 }
  ],
  dataSources: [
    { id: 'src-erp', name: 'ERP System' },
    { id: 'src-crm', name: 'CRM Database' },
    { id: 'src-sql', name: 'Azure SQL' }
  ],
  fieldTypes: [
    { id: 'ft-text', name: 'Text' },
    { id: 'ft-number', name: 'Number' },
    { id: 'ft-date', name: 'Date' },
    { id: 'ft-bool', name: 'Boolean' }
  ],
  tags: [
    { id: 'tag-prod', name: 'Production', color: '#ef4444' },
    { id: 'tag-ext', name: 'External', color: '#f59e0b' },
    { id: 'tag-crit', name: 'Critical', color: '#7c3aed' }
  ]
};

// --- Demo Data Definitions ---
const DEMO_NODES: Node<NodeData>[] = [
  { id: 'demo-1', type: 'blueprintNode', position: { x: -300, y: 50 }, data: { label: 'ERP Invoices', cardType: NodeCardType.TABLE, categoryId: 'cat-src', dataSourceId: 'src-erp', tags: ['tag-prod', 'tag-ext'], columns: [{ id: 'c1', name: 'Invoice_ID', typeId: 'ft-text', isKey: true }, { id: 'c2', name: 'Posted_Date', typeId: 'ft-date' }, { id: 'c3', name: 'Total_Amount', typeId: 'ft-number' }, { id: 'c4', name: 'Vendor_ID', typeId: 'ft-text' }], comment: 'Direct feed from SAP production instance.' } },
  { id: 'demo-2', type: 'blueprintNode', position: { x: -300, y: 450 }, data: { label: 'Customer Master', cardType: NodeCardType.TABLE, categoryId: 'cat-src', dataSourceId: 'src-crm', tags: ['tag-prod'], columns: [{ id: 'c5', name: 'Cust_ID', typeId: 'ft-text', isKey: true }, { id: 'c6', name: 'Tax_ID', typeId: 'ft-text' }, { id: 'c7', name: 'Region', typeId: 'ft-text' }] } },
  { id: 'demo-3', type: 'blueprintNode', position: { x: 100, y: 250 }, data: { label: 'Data Integrity Shield', cardType: NodeCardType.LOGIC_NOTE, categoryId: 'log-rule', tags: ['tag-crit'], description: 'Central validation gate for all incoming financial streams.', bulletPoints: ['Validate VAT ID against VIES registry', 'Check for duplicate Invoice_IDs in 24h window', 'Reject records with null Total_Amount'] } },
  { id: 'demo-4', type: 'blueprintNode', position: { x: 500, y: 250 }, data: { label: 'EU Tax Engine', cardType: NodeCardType.LOGIC_NOTE, categoryId: 'log-calc', tags: ['tag-prod', 'tag-crit'], description: 'Calculates regional VAT and cross-border duties.', bulletPoints: ['Apply 21% standard rate for local sales', 'Apply reverse charge logic for B2B cross-border', 'Round to 2 decimal places'] } },
  { id: 'demo-5', type: 'blueprintNode', position: { x: 900, y: 50 }, data: { label: 'Final Tax Ledger', cardType: NodeCardType.TABLE, categoryId: 'cat-std', tags: ['tag-prod'], columns: [{ id: 'c8', name: 'Entry_ID', typeId: 'ft-text', isKey: true }, { id: 'c9', name: 'Net_Amount', typeId: 'ft-number' }, { id: 'c10', name: 'VAT_Amount', typeId: 'ft-number' }, { id: 'c11', name: 'Status', typeId: 'ft-text' }] } },
  { id: 'demo-6', type: 'blueprintNode', position: { x: 900, y: 450 }, data: { label: 'VAT Compliance Report', cardType: NodeCardType.TABLE, categoryId: 'cat-std', tags: ['tag-ext'], columns: [{ id: 'c12', name: 'Report_ID', typeId: 'ft-text', isKey: true }, { id: 'c13', name: 'Period', typeId: 'ft-text' }, { id: 'c14', name: 'Total_VAT_Collected', typeId: 'ft-number' }] } }
];

const DEMO_EDGES: Edge[] = [
  { id: 'e1', source: 'demo-1', target: 'demo-3', sourceHandle: 'r-s', targetHandle: 'l-t', type: 'blueprintEdge', data: { typeId: 'conn-std' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e2', source: 'demo-2', target: 'demo-3', sourceHandle: 'r-s', targetHandle: 'l-t', type: 'blueprintEdge', data: { typeId: 'conn-std' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e3', source: 'demo-3', target: 'demo-4', sourceHandle: 'r-s', targetHandle: 'l-t', type: 'blueprintEdge', label: 'Validated Flow', data: { typeId: 'conn-crit' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' } },
  { id: 'e4', source: 'demo-4', target: 'demo-5', sourceHandle: 'r-s', targetHandle: 'l-t', type: 'blueprintEdge', data: { typeId: 'conn-std' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e5', source: 'demo-4', target: 'demo-6', sourceHandle: 'r-s', targetHandle: 'l-t', type: 'blueprintEdge', data: { typeId: 'conn-std' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } }
];

const DEFAULT_APPEARANCE: AppearanceSettings = {
  language: 'en',
  canvasBgColor: '#f8fafc',
  headerFontSize: 'sm',
  contentFontSize: 'sm',
  userName: 'Blueprinter',
  organizationName: 'Data Blueprint Corp',
  isLegendExpanded: true,
  maxFieldsToShow: 6
};

const PROJECT_STORAGE_KEY = 'whitebox_projects_v2';
const APPEARANCE_STORAGE_KEY = 'whitebox_appearance_v1';
const HIDE_ALL_VALUE = '__HIDE_ALL__';
const CANVAS_PADDING = 0.35;

function BlueprintStudio() {
  const { fitView } = useReactFlow();
  const hasPerformedInitialFit = useRef(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // --- Multi-Project State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [projectDataMap, setProjectDataMap] = useState<Record<string, ProjectData>>({});
  
  // --- Project Renaming State ---
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [tempProjectName, setTempProjectName] = useState('');

  // --- Active Project Working Set ---
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [activeTableFilters, setActiveTableFilters] = useState<string[]>([]);
  const [activeLogicFilters, setActiveLogicFilters] = useState<string[]>([]);
  const [activeEdgeFilters, setActiveEdgeFilters] = useState<string[]>([]);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

  // --- Global States ---
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [viewType, setViewType] = useState<ViewType>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [openMenuType, setOpenMenuType] = useState<'table' | 'logic' | 'edge' | 'tag' | 'add' | 'io' | 'project' | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [showStudioSettings, setShowStudioSettings] = useState<any>(null);

  const t = (key: keyof typeof translations.en) => translations[appearance.language][key] || key;

  // --- Initialization Logic ---
  useEffect(() => {
    const savedProjectsRaw = localStorage.getItem(PROJECT_STORAGE_KEY);
    const savedAppearanceRaw = localStorage.getItem(APPEARANCE_STORAGE_KEY);

    if (savedAppearanceRaw) setAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(savedAppearanceRaw) });

    if (savedProjectsRaw) {
      try {
        const parsed = JSON.parse(savedProjectsRaw);
        const loadedProjects = parsed.projects || [];
        const loadedDataMap = parsed.projectDataMap || {};
        const loadedCurrentId = parsed.currentProjectId || (loadedProjects.length > 0 ? loadedProjects[0].id : '');

        setProjects(loadedProjects);
        setProjectDataMap(loadedDataMap);
        setCurrentProjectId(loadedCurrentId);
        
        if (loadedCurrentId && loadedDataMap[loadedCurrentId]) {
          const data = loadedDataMap[loadedCurrentId];
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setSettings(data.settings || DEFAULT_SETTINGS);
          setActiveTableFilters(data.filters?.table || []);
          setActiveLogicFilters(data.filters?.logic || []);
          setActiveEdgeFilters(data.filters?.edge || []);
          setActiveTagFilters(data.filters?.tag || []);
        }
      } catch (e) { console.error("Failed to load project storage", e); }
    } else {
      // Default initialization
      const defaultId = 'proj-1';
      const defaultProject: Project = { id: defaultId, name: 'Project 1' };
      const defaultData: ProjectData = {
        nodes: DEMO_NODES,
        edges: DEMO_EDGES,
        settings: DEFAULT_SETTINGS,
        filters: { table: [], logic: [], edge: [], tag: [] }
      };
      setProjects([defaultProject]);
      setCurrentProjectId(defaultId);
      setProjectDataMap({ [defaultId]: defaultData });
      setNodes(DEMO_NODES);
      setEdges(DEMO_EDGES);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // --- Persistence Logic ---
  useEffect(() => {
    if (!currentProjectId) return;
    const projectData = {
      nodes, edges, settings,
      filters: { table: activeTableFilters, logic: activeLogicFilters, edge: activeEdgeFilters, tag: activeTagFilters }
    };
    const updatedMap = { ...projectDataMap, [currentProjectId]: projectData };
    // Only update the map if something actually changed to avoid overhead
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify({ projects, currentProjectId, projectDataMap: updatedMap }));
  }, [nodes, edges, settings, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters, projects, currentProjectId]);

  useEffect(() => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  }, [appearance]);

  // --- Project Management Functions ---
  const switchProject = (id: string) => {
    if (!id || id === currentProjectId) return;
    
    // 1. Snapshot current project data to the map
    const currentDataSnapshot = {
      nodes, edges, settings,
      filters: { table: activeTableFilters, logic: activeLogicFilters, edge: activeEdgeFilters, tag: activeTagFilters }
    };
    
    const updatedMap = { ...projectDataMap, [currentProjectId]: currentDataSnapshot };
    
    // 2. Look up the next project data
    const nextData = updatedMap[id];
    
    // 3. Robust guard to prevent the "Cannot read properties of undefined (reading 'nodes')" error
    if (nextData) {
      setNodes(nextData.nodes || []);
      setEdges(nextData.edges || []);
      setSettings(nextData.settings || DEFAULT_SETTINGS);
      setActiveTableFilters(nextData.filters?.table || []);
      setActiveLogicFilters(nextData.filters?.logic || []);
      setActiveEdgeFilters(nextData.filters?.edge || []);
      setActiveTagFilters(nextData.filters?.tag || []);
    } else {
      // Fallback if data is missing for some reason
      setNodes([]);
      setEdges([]);
      setSettings(DEFAULT_SETTINGS);
      setActiveTableFilters([]);
      setActiveLogicFilters([]);
      setActiveEdgeFilters([]);
      setActiveTagFilters([]);
    }
    
    setProjectDataMap(updatedMap);
    setCurrentProjectId(id);
    setOpenMenuType(null);
    hasPerformedInitialFit.current = false;
  };

  const createNewProject = () => {
    const id = `proj-${Date.now()}`;
    const newProject: Project = { id, name: `Project ${projects.length + 1}` };
    const newData: ProjectData = {
      nodes: [],
      edges: [],
      settings: DEFAULT_SETTINGS,
      filters: { table: [], logic: [], edge: [], tag: [] }
    };
    
    // Add to projects list and data map
    setProjects(prev => [...prev, newProject]);
    setProjectDataMap(prev => ({ ...prev, [id]: newData }));
    
    // Switch to it
    switchProject(id);
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) return;
    if (window.confirm("Are you sure you want to delete this project?")) {
      const remaining = projects.filter(p => p.id !== id);
      const nextId = remaining[0].id;
      setProjects(remaining);
      const updatedMap = { ...projectDataMap };
      delete updatedMap[id];
      setProjectDataMap(updatedMap);
      if (id === currentProjectId) switchProject(nextId);
    }
  };

  const renameProject = (id: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const startRenaming = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    setEditingProjectId(p.id);
    setTempProjectName(p.name);
  };

  const handleRenameSave = () => {
    if (editingProjectId && tempProjectName.trim()) {
      renameProject(editingProjectId, tempProjectName.trim());
    }
    setEditingProjectId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSave();
    if (e.key === 'Escape') setEditingProjectId(null);
  };

  // --- Existing Logic Updated for Projects ---
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => {
    const defaultType = settings.connectionTypes[0];
    setEdges((eds) => addEdge({ ...params, type: 'blueprintEdge', data: { typeId: defaultType.id }, markerEnd: { type: MarkerType.ArrowClosed, color: defaultType.color } }, eds));
  }, [settings]);

  const handleSaveNode = (id: string, updatedData: Partial<NodeData>) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...updatedData } } : node));
    setEditingNode(null);
  };

  const handleDuplicateNode = useCallback((id: string) => {
    setNodes((nds) => {
      const nodeToCopy = nds.find((n) => n.id === id);
      if (!nodeToCopy) return nds;
      const newNode = { ...nodeToCopy, id: `dup-${Date.now()}`, position: { x: nodeToCopy.position.x + 40, y: nodeToCopy.position.y + 40 }, data: { ...nodeToCopy.data, label: `${nodeToCopy.data.label}_Copy` } };
      return [...nds, newNode];
    });
  }, []);

  const handleSaveEdge = (id: string, data: { typeId: string; label: string; hasArrow: boolean }) => {
    const connType = settings.connectionTypes.find(t => t.id === data.typeId);
    setEdges((eds) => eds.map((edge) => edge.id === id ? { ...edge, label: data.label, data: { ...edge.data, typeId: data.typeId }, markerEnd: data.hasArrow ? { type: MarkerType.ArrowClosed, color: connType?.color || '#94a3b8' } : undefined } : edge));
    setEditingEdge(null);
  };

  const handleAutoAlign = useCallback(() => {
    if (viewType !== 'canvas') setViewType('canvas');
    setTimeout(() => fitView({ padding: CANVAS_PADDING, duration: 800 }), 50);
  }, [fitView, viewType]);

  const handleLocateOnCanvas = useCallback((nodeId: string) => {
    setViewType('canvas');
    setHighlightedNodeId(nodeId);
    setTimeout(() => fitView({ nodes: [{ id: nodeId }], duration: 1200, padding: 0.5 }), 100);
    setTimeout(() => setHighlightedNodeId(null), 4000);
  }, [fitView]);

  const handleResetCanvas = useCallback(() => {
    if (window.confirm(t('reset_confirm'))) {
      setNodes([]);
      setEdges([]);
      setActiveTableFilters([]);
      setActiveLogicFilters([]);
      setActiveEdgeFilters([]);
      setActiveTagFilters([]);
      setOpenMenuType(null);
    }
  }, [t]);

  const addNode = (type: NodeCardType) => {
    const id = Date.now().toString();
    const defaultCatId = type === NodeCardType.TABLE 
      ? (settings.tableCategories.find(c => c.isDefault) || settings.tableCategories[0]).id
      : (settings.logicCategories.find(c => c.isDefault) || settings.logicCategories[0]).id;
    
    setNodes((nds) => nds.concat({
      id, type: 'blueprintNode', position: { x: 100, y: 100 },
      data: { label: `New ${type.toLowerCase()}`, cardType: type, categoryId: defaultCatId, columns: type === NodeCardType.TABLE ? [{ id: '1', name: 'New Field', isKey: false }] : [], description: '', bulletPoints: [], comment: '', dataSourceId: '', tags: [] }
    }));
    setOpenMenuType(null);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const allNodes: any[] = [];
    const allEdges: any[] = [];
    const allTableCats: any[] = [];
    const allLogicCats: any[] = [];
    const allConnTypes: any[] = [];
    const allDataSources: any[] = [];
    const allFieldTypes: any[] = [];
    const allTags: any[] = [];
    const allFilters: any[] = [];

    // Collect data from all projects
    projects.forEach(p => {
      const data = p.id === currentProjectId 
        ? { nodes, edges, settings, filters: { table: activeTableFilters, logic: activeLogicFilters, edge: activeEdgeFilters, tag: activeTagFilters } } 
        : projectDataMap[p.id];
      
      if (!data) return;

      allNodes.push(...data.nodes.map(n => ({ 
        ProjectID: p.id, ID: n.id, Label: n.data.label, Type: n.data.cardType, CatID: n.data.categoryId || '', X: n.position.x, Y: n.position.y, 
        Columns: n.data.columns?.map(c => `${c.name}:${c.typeId || ''}:${c.isKey ? 'K' : ''}`).join('|') || '',
        Desc: n.data.description || '', Bullets: n.data.bulletPoints?.join('|') || '', Comment: n.data.comment || '', DataSourceID: n.data.dataSourceId || '',
        Tags: n.data.tags?.join('|') || ''
      })));

      allEdges.push(...data.edges.map(e => ({
        ProjectID: p.id, ID: e.id, Source: e.source, Target: e.target, SourceHandle: e.sourceHandle || '', TargetHandle: e.targetHandle || '',
        Label: e.label || '', TypeID: e.data?.typeId || '', HasArrow: e.markerEnd ? 'YES' : 'NO'
      })));

      allTableCats.push(...data.settings.tableCategories.map(c => ({ ...c, ProjectID: p.id })));
      allLogicCats.push(...data.settings.logicCategories.map(c => ({ ...c, ProjectID: p.id })));
      allConnTypes.push(...data.settings.connectionTypes.map(c => ({ ...c, ProjectID: p.id })));
      allDataSources.push(...data.settings.dataSources.map(s => ({ ...s, ProjectID: p.id })));
      allFieldTypes.push(...data.settings.fieldTypes.map(f => ({ ...f, ProjectID: p.id })));
      allTags.push(...(data.settings.tags || []).map(t => ({ ...t, ProjectID: p.id })));
      
      allFilters.push({
        ProjectID: p.id,
        TableFilters: (data.filters?.table || []).join('|'),
        LogicFilters: (data.filters?.logic || []).join('|'),
        EdgeFilters: (data.filters?.edge || []).join('|'),
        TagFilters: (data.filters?.tag || []).join('|')
      });
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(projects), "Projects");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allNodes), "Nodes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allEdges), "Edges");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allTableCats), "TableCategories");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allLogicCats), "LogicCategories");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allConnTypes), "ConnectionTypes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allDataSources), "DataSources");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allFieldTypes), "FieldTypes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allTags), "Tags");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allFilters), "ActiveFilters");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([appearance]), "Appearance");

    // Restored Professional Naming Convention: WhiteBox_{Org}_{User}_{DD-MM-YY}_{HHmm}.xlsx
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // Sanitize names to avoid invalid filename characters
    const sanitize = (str: string) => str.trim().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    const org = sanitize(appearance.organizationName || 'Studio');
    const user = sanitize(appearance.userName || 'User');
    
    const filename = `WhiteBox_${org}_${user}_${day}-${month}-${year}_${hours}${minutes}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    setOpenMenuType(null);
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target?.result, { type: 'binary' });
        const importedProjects = (XLSX.utils.sheet_to_json(workbook.Sheets["Projects"]) || []) as Project[];
        
        if (importedProjects.length === 0) {
          alert("No projects found in the file.");
          return;
        }

        const nodesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Nodes"]) as any[];
        const edgesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Edges"]) as any[];
        const tableCatsRaw = XLSX.utils.sheet_to_json(workbook.Sheets["TableCategories"]) as any[];
        const logicCatsRaw = XLSX.utils.sheet_to_json(workbook.Sheets["LogicCategories"]) as any[];
        const connTypesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["ConnectionTypes"]) as any[];
        const dataSourcesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["DataSources"]) as any[];
        const fieldTypesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["FieldTypes"]) as any[];
        const tagsRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Tags"]) as any[];
        const filtersRaw = XLSX.utils.sheet_to_json(workbook.Sheets["ActiveFilters"]) as any[];
        
        const appearanceRaw = workbook.Sheets["Appearance"] ? XLSX.utils.sheet_to_json(workbook.Sheets["Appearance"])[0] as any : null;
        if (appearanceRaw) setAppearance({ ...DEFAULT_APPEARANCE, ...appearanceRaw });

        const newMap: Record<string, ProjectData> = {};
        importedProjects.forEach(p => {
          const pId = p.id;
          newMap[pId] = {
            nodes: nodesRaw.filter(n => n.ProjectID === pId).map(n => ({
              id: String(n.ID), type: 'blueprintNode', position: { x: Number(n.X), y: Number(n.Y) },
              data: { label: n.Label, cardType: n.Type, categoryId: n.CatID, columns: n.Columns ? n.Columns.split('|').map((colStr: string, i: number) => { const [name, typeId, key] = colStr.split(':'); return { id: String(i), name, typeId: typeId || undefined, isKey: key === 'K' }; }) : [], description: n.Desc, bulletPoints: n.Bullets ? n.Bullets.split('|') : [], comment: n.Comment || '', dataSourceId: n.DataSourceID || '', tags: n.Tags ? n.Tags.split('|') : [] }
            })),
            edges: edgesRaw.filter(e => e.ProjectID === pId).map(e => ({
              id: String(e.ID), source: String(e.Source), target: String(e.Target), sourceHandle: e.SourceHandle || null, targetHandle: e.TargetHandle || null, label: e.Label, type: 'blueprintEdge', data: { typeId: e.TypeID }, markerEnd: e.HasArrow === 'YES' ? { type: MarkerType.ArrowClosed, color: connTypesRaw.find(t => t.id === e.TypeID)?.color || '#94a3b8' } : undefined
            })),
            settings: {
              tableCategories: tableCatsRaw.filter(c => c.ProjectID === pId).map(({ ProjectID, ...rest }) => rest),
              logicCategories: logicCatsRaw.filter(c => c.ProjectID === pId).map(({ ProjectID, ...rest }) => rest),
              connectionTypes: connTypesRaw.filter(c => c.ProjectID === pId).map(({ ProjectID, ...rest }) => rest),
              dataSources: dataSourcesRaw.filter(c => c.ProjectID === pId).map(({ ProjectID, ...rest }) => rest),
              fieldTypes: fieldTypesRaw.filter(c => c.ProjectID === pId).map(({ ProjectID, ...rest }) => rest),
              tags: tagsRaw.filter(c => c.ProjectID === pId).map(({ ProjectID, ...rest }) => rest),
            },
            filters: filtersRaw.find(f => f.ProjectID === pId) ? {
              table: filtersRaw.find(f => f.ProjectID === pId).TableFilters?.split('|').filter(Boolean) || [],
              logic: filtersRaw.find(f => f.ProjectID === pId).LogicFilters?.split('|').filter(Boolean) || [],
              edge: filtersRaw.find(f => f.ProjectID === pId).EdgeFilters?.split('|').filter(Boolean) || [],
              tag: filtersRaw.find(f => f.ProjectID === pId).TagFilters?.split('|').filter(Boolean) || []
            } : { table: [], logic: [], edge: [], tag: [] }
          };
        });

        const firstId = importedProjects[0].id;
        const firstData = newMap[firstId];

        if (!firstData) {
          alert("Import failed: First project data is malformed.");
          return;
        }

        setProjects(importedProjects);
        setProjectDataMap(newMap);
        setCurrentProjectId(firstId);
        
        setNodes(firstData.nodes || []);
        setEdges(firstData.edges || []);
        setSettings(firstData.settings || DEFAULT_SETTINGS);
        setActiveTableFilters(firstData.filters.table || []);
        setActiveLogicFilters(firstData.filters.logic || []);
        setActiveEdgeFilters(firstData.filters.edge || []);
        setActiveTagFilters(firstData.filters.tag || []);
        setOpenMenuType(null);
      } catch (err) { alert("Invalid project file"); console.error(err); }
    };
    reader.readAsBinaryString(file);
  };

  const isNodeVisible = useCallback((node: Node<NodeData>) => {
    const { data } = node;
    if (data.cardType === NodeCardType.TABLE && activeTableFilters.length > 0) {
      if (activeTableFilters.includes(HIDE_ALL_VALUE)) return false;
      if (data.categoryId && !activeTableFilters.includes(data.categoryId)) return false;
    }
    if (data.cardType === NodeCardType.LOGIC_NOTE && activeLogicFilters.length > 0) {
      if (activeLogicFilters.includes(HIDE_ALL_VALUE)) return false;
      if (data.categoryId && !activeLogicFilters.includes(data.categoryId)) return false;
    }
    if (activeTagFilters.length > 0) {
      if (activeTagFilters.includes(HIDE_ALL_VALUE)) return false;
      if (!data.tags?.some(tagId => activeTagFilters.includes(tagId))) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches = data.label.toLowerCase().includes(q) || data.description?.toLowerCase().includes(q) || data.columns?.some(c => c.name.toLowerCase().includes(q)) || data.comment?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  }, [activeTableFilters, activeLogicFilters, activeTagFilters, searchQuery]);

  const filteredNodes = useMemo(() => nodes.filter(isNodeVisible), [nodes, isNodeVisible]);
  const nodesWithActions = useMemo(() => filteredNodes.map(n => ({ ...n, data: { ...n.data, onEdit: setEditingNode, onDelete: (id: string) => setNodes(nds => nds.filter(node => node.id !== id)), onDuplicate: handleDuplicateNode, settings, appearance, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters, highlightedNodeId } })), [filteredNodes, settings, appearance, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters, handleDuplicateNode, highlightedNodeId]);
  const edgesWithActions = useMemo(() => edges.map(e => {
    const sourceNode = nodes.find(n => n.id === e.source);
    const targetNode = nodes.find(n => n.id === e.target);
    return { ...e, data: { ...e.data, onEdit: setEditingEdge, onDelete: (id: string) => setEdges(eds => eds.filter(edge => edge.id !== id)), settings, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters, sourceCategoryId: sourceNode?.data.categoryId, targetCategoryId: targetNode?.data.categoryId, sourceTags: sourceNode?.data.tags, targetTags: targetNode?.data.tags } };
  }), [edges, settings, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters, nodes]);

  const toggleMultiFilter = (id: string, current: string[], setter: (val: string[]) => void) => {
    if (id === HIDE_ALL_VALUE) setter(current.includes(HIDE_ALL_VALUE) ? [] : [HIDE_ALL_VALUE]);
    else {
      const filtered = current.filter(x => x !== HIDE_ALL_VALUE);
      setter(filtered.includes(id) ? filtered.filter(x => x !== id) : [...filtered, id]);
    }
  };

  const currentProject = projects.find(p => p.id === currentProjectId) || (projects.length > 0 ? projects[0] : null);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden" style={{ backgroundColor: appearance.canvasBgColor }}>
      <main className="w-full h-full relative" id="studio-main-viewport">
        <div className="absolute inset-x-0 top-0 p-2 lg:p-4 2xl:p-6 flex items-center justify-between pointer-events-none z-30 transition-all duration-300" ref={toolbarRef}>
          <div className="flex items-center gap-1.5 lg:gap-2 2xl:gap-3 pointer-events-auto flex-nowrap min-w-0">
            {/* Project Switcher */}
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => setOpenMenuType(openMenuType === 'project' ? null : 'project')} 
                className={`flex items-center justify-center gap-3 px-2 2xl:px-4 py-1.5 lg:py-2 bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all group h-10 lg:h-12 2xl:w-auto aspect-square 2xl:aspect-auto flex-shrink-0 border border-slate-700 ring-2 ring-transparent active:scale-95 ${openMenuType === 'project' ? 'bg-slate-700' : ''}`}
                title={t('projects')}
              >
                <Layers size={22} strokeWidth={2.5} className="flex-shrink-0" />
                <div className="hidden 2xl:flex flex-col items-start pr-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t('projects')}</span>
                   <span className="text-xs font-bold text-white truncate max-w-[120px]">{currentProject?.name || t('none')}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${openMenuType === 'project' ? 'rotate-180' : ''} hidden 2xl:block`} />
              </button>
              {openMenuType === 'project' && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">{t('switch_project')}</div>
                  {projects.map(p => (
                    <div key={p.id} className="group relative">
                      <button onClick={() => switchProject(p.id)} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors ${currentProjectId === p.id ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                           <LayoutList size={14} className={currentProjectId === p.id ? 'text-indigo-600' : 'text-slate-400'} />
                           {editingProjectId === p.id ? (
                             <input
                               autoFocus
                               type="text"
                               value={tempProjectName}
                               onChange={(e) => setTempProjectName(e.target.value)}
                               onBlur={handleRenameSave}
                               onKeyDown={handleRenameKeyDown}
                               onClick={(e) => e.stopPropagation()}
                               className="flex-1 bg-white border border-blue-500 rounded px-2 py-0.5 outline-none text-slate-900 font-bold"
                             />
                           ) : (
                             <span className="truncate">{p.name}</span>
                           )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                           {currentProjectId === p.id && editingProjectId !== p.id && <Check size={14} className="text-indigo-600" />}
                           {editingProjectId !== p.id && (
                             <button 
                               onClick={(e) => startRenaming(e, p)}
                               className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-600 transition-all"
                             >
                               <Edit3 size={14} />
                             </button>
                           )}
                           {projects.length > 1 && editingProjectId !== p.id && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} 
                               className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                             >
                               <Trash2 size={14} />
                             </button>
                           )}
                        </div>
                      </button>
                    </div>
                  ))}
                  <div className="h-px bg-slate-50 my-1 mx-4" />
                  <button onClick={createNewProject} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Plus size={16} />
                    <span>{t('new_project')}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-0.5 lg:mx-1 flex-shrink-0" />

            {/* Create Node */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setOpenMenuType(openMenuType === 'add' ? null : 'add')} className={`flex items-center justify-center gap-3 px-2 2xl:px-4 py-1.5 lg:py-2 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all transform active:scale-95 group h-10 lg:h-12 2xl:w-auto aspect-square 2xl:aspect-auto flex-shrink-0 ${openMenuType === 'add' ? 'bg-slate-900' : ''}`}>
                <Plus size={22} strokeWidth={2.5} className={`transition-transform duration-300 ${openMenuType === 'add' ? 'rotate-45' : ''}`} />
                <div className="hidden 2xl:flex items-center pr-1"><span className="text-lg font-black text-white leading-none tracking-tight">{appearance.language === 'en' ? 'Add Nodes' : '新增节点'}</span></div>
              </button>
              {openMenuType === 'add' && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <button onClick={() => addNode(NodeCardType.TABLE)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"><div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Database size={16} /></div><span className="text-left">{t('data_table')}</span></button>
                  <button onClick={() => addNode(NodeCardType.LOGIC_NOTE)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"><div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><FileText size={16} /></div><span className="text-left">{t('logic_node')}</span></button>
                </div>
              )}
            </div>

            {/* Import / Export */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setOpenMenuType(openMenuType === 'io' ? null : 'io')} className={`flex items-center justify-center gap-3 px-2 2xl:px-4 py-1.5 lg:py-2 bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all group h-10 lg:h-12 2xl:w-auto aspect-square 2xl:aspect-auto flex-shrink-0 border border-emerald-500/30 active:scale-95 ${openMenuType === 'io' ? 'bg-slate-900 border-slate-700' : ''}`}>
                <ArrowUpDown size={22} strokeWidth={2.5} />
                <div className="hidden 2xl:flex items-center pr-1"><span className="text-lg font-black text-white leading-none tracking-tight">{appearance.language === 'en' ? 'Import / Export' : '导入 / 导出'}</span></div>
              </button>
              {openMenuType === 'io' && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"><Download size={16} className="text-blue-600" /><span>{t('export_project')}</span></button>
                  <label className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"><Upload size={16} className="text-emerald-600" /><span>{t('import_xlsx')}</span><input type="file" className="hidden" accept=".xlsx, .xls" onChange={importFromExcel} /></label>
                  <button onClick={() => { setOpenMenuType(null); setShowExportModal(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"><Camera size={16} className="text-indigo-600" /><span>{t('export_image')}</span></button>
                  <div className="h-px bg-slate-50 my-1 mx-4" />
                  <button onClick={handleResetCanvas} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={16} /><span>{t('reset_canvas')}</span></button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-0.5 lg:mx-1 flex-shrink-0" />
            <button onClick={() => setShowStudioSettings({ initialTab: 'general' })} className="flex items-center justify-center gap-3 px-2 2xl:px-4 py-1.5 lg:py-2 bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all h-10 lg:h-12 2xl:w-auto aspect-square border border-slate-700"><Settings2 size={22} /><div className="hidden 2xl:flex items-center pr-1"><span className="text-lg font-black text-white leading-none tracking-tight">{appearance.language === 'en' ? 'Setting' : '设置'}</span></div></button>
            <button onClick={handleAutoAlign} className="flex items-center justify-center gap-3 px-2 2xl:px-4 py-1.5 lg:py-2 bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl h-10 lg:h-12 border border-slate-700"><Maximize size={22} strokeWidth={2.5} /><div className="hidden 2xl:flex items-center pr-1"><span className="text-lg font-black text-white leading-none tracking-tight">{t('auto_align')}</span></div></button>
            <button onClick={() => { setActiveTableFilters([]); setActiveLogicFilters([]); setActiveEdgeFilters([]); setActiveTagFilters([]); setSearchQuery(''); }} className="flex items-center justify-center gap-3 px-2 2xl:px-4 py-1.5 lg:py-2 bg-white/90 border border-slate-200 rounded-full h-10 lg:h-12"><div className="p-1.5 bg-rose-50 rounded-full text-rose-500"><RotateCcw size={16} strokeWidth={2.5} /></div><div className="flex flex-col items-start hidden 2xl:flex"><span className="text-[10px] font-black text-slate-400 uppercase leading-none">{t('filters_label')}</span><span className="text-xs font-bold text-slate-700">{t('reset_filters')}</span></div></button>

            {/* Filter Dropdowns */}
            {['tag', 'table', 'logic', 'edge'].map((type: any) => (
              <div className="relative flex-shrink-0" key={type}>
                <button onClick={() => setOpenMenuType(openMenuType === type ? null : type)} className="flex items-center justify-center gap-1.5 px-2 2xl:px-4 py-1.5 bg-white/90 border border-slate-200 rounded-full h-10 lg:h-12 relative">
                  <div className={`p-1.5 rounded-full ${type === 'tag' ? 'bg-emerald-50 text-emerald-600' : type === 'table' ? 'bg-blue-50 text-blue-600' : type === 'logic' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                    {type === 'tag' ? <TagIcon size={16} /> : type === 'table' ? <Database size={16} /> : type === 'logic' ? <FileText size={16} /> : <Link2 size={16} />}
                  </div>
                  <div className="flex flex-col items-start hidden 2xl:flex">
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{t(type === 'tag' ? 'tags' : type === 'table' ? 'data_table' : type === 'logic' ? 'logic_node' : 'link_classification')}</span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">{(type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters).length === 0 ? t('all') : `${(type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters).length} selected`}</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden 2xl:block" />
                </button>
                {openMenuType === type && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <button onClick={() => (type === 'tag' ? setActiveTagFilters([]) : type === 'table' ? setActiveTableFilters([]) : type === 'logic' ? setActiveLogicFilters([]) : setActiveEdgeFilters([]))} className="w-full flex items-start justify-between px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">
                      <div className="flex items-start gap-3 flex-1"><div className="w-2.5 h-2.5 rounded-full bg-slate-200 mt-1.5" /><span>{t('all')}</span></div>
                    </button>
                    <button onClick={() => toggleMultiFilter(HIDE_ALL_VALUE, (type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters), (type === 'tag' ? setActiveTagFilters : type === 'table' ? setActiveTableFilters : type === 'logic' ? setActiveLogicFilters : setActiveEdgeFilters))} className="w-full flex items-start justify-between px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">
                      <div className="flex items-start gap-3 flex-1"><div className="w-2.5 h-2.5 rounded-full bg-slate-900 mt-1.5" /><span>{t('hide_all')}</span></div>
                    </button>
                    {(type === 'tag' ? settings.tags : type === 'table' ? settings.tableCategories : type === 'logic' ? settings.logicCategories : settings.connectionTypes).map((item: any) => (
                      <button key={item.id} onClick={() => toggleMultiFilter(item.id, (type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters), (type === 'tag' ? setActiveTagFilters : type === 'table' ? setActiveTableFilters : type === 'logic' ? setActiveLogicFilters : setActiveEdgeFilters))} className="w-full flex items-start justify-between px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">
                        <div className="flex items-start gap-3 flex-1"><div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: item.color }} /><span>{item.name}</span></div>
                        {(type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters).includes(item.id) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setViewType(viewType === 'canvas' ? 'catalog' : 'canvas')} className="flex items-center justify-center gap-3 px-2 2xl:px-4 py-1.5 bg-indigo-600 text-white rounded-full h-10 lg:h-12 border border-indigo-500/30 active:scale-95 pointer-events-auto">{viewType === 'canvas' ? <LayoutList size={22} /> : <MapIcon size={22} />}<div className="hidden 2xl:flex items-center pr-1"><span className="text-lg font-black text-white leading-none">{t('view_swap')}</span></div></button>
        </div>

        {viewType === 'canvas' ? (
          <>
            <ReactFlow nodes={nodesWithActions} edges={edgesWithActions} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: CANVAS_PADDING }} minZoom={0.05} maxZoom={4} onPaneClick={() => setOpenMenuType(null)} onMoveStart={() => setOpenMenuType(null)} className="bg-transparent"><Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={24} size={1} /><Controls position="bottom-left" /></ReactFlow>
            <Legend settings={settings} appearance={appearance} onUpdateAppearance={setAppearance} />
          </>
        ) : (
          <div className="w-full h-full overflow-y-auto px-6 py-32 lg:px-12 animate-in fade-in duration-500 custom-scrollbar" style={{ backgroundColor: appearance.canvasBgColor }}>
            <div className="max-w-4xl mx-auto mb-12"><div className="relative group"><div className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors"><Search size={22} strokeWidth={2.5} /></div><input type="text" placeholder={t('search_placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-16 pl-16 pr-8 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-lg text-lg font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" /></div></div>
            {[...settings.tableCategories, ...settings.logicCategories].map((cat) => {
              const catNodes = nodes.filter(isNodeVisible).filter(n => n.data.categoryId === cat.id);
              if (catNodes.length === 0) return null;
              return (<section key={cat.id} className="max-w-7xl mx-auto mb-16"><div className="flex items-center gap-4 mb-6 py-4"><div className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: cat.color }} /><h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex-1">{cat.name}</h2><div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">{catNodes.length} Nodes</div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{catNodes.map(node => (<div key={node.id} className="relative group"><div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"><BlueprintCard id={node.id} data={{ ...node.data, settings, appearance, onEdit: setEditingNode, onDelete: (id: string) => setNodes(nds => nds.filter(node => node.id !== id)), onDuplicate: handleDuplicateNode }} type="blueprintNode" dragging={false} zIndex={1} isConnectable={false} xPos={0} yPos={0} selected={false} /></div><div className="absolute top-[12px] left-[12px] flex gap-1 z-50"><button onClick={() => handleLocateOnCanvas(node.id)} className="p-1.5 bg-white text-blue-600 rounded shadow-sm border border-slate-200 hover:bg-blue-600 hover:text-white transition-all transform active:scale-90"><Crosshair size={14} strokeWidth={2.5} /></button></div></div>))}</div></section>);
            })}
          </div>
        )}
      </main>
      {editingNode && (<EditorModal node={nodes.find(n => n.id === editingNode)!} settings={settings} onClose={() => setEditingNode(null)} onSave={(data) => handleSaveNode(editingNode, data)} language={appearance.language} />)}
      {editingEdge && (<EdgeEditorModal edge={edges.find(e => e.id === editingEdge)!} settings={settings} onClose={() => setEditingEdge(null)} onSave={(data) => handleSaveEdge(editingEdge, data)} language={appearance.language} />)}
      {showStudioSettings && (<StudioSettingsModal settings={settings} appearance={appearance} initialTab={showStudioSettings.initialTab} onClose={() => setShowStudioSettings(null)} onSave={(s, a) => { setSettings(s); setAppearance(a); setShowStudioSettings(null); }} />)}
      {showExportModal && (<ExportImageModal nodes={nodes} edges={edges} settings={settings} appearance={appearance} activeTableFilters={activeTableFilters} activeLogicFilters={activeLogicFilters} activeEdgeFilters={activeEdgeFilters} activeTagFilters={activeTagFilters} searchQuery={searchQuery} onClose={() => setShowExportModal(false)} />)}
    </div>
  );
}

export default function App() { return (<ReactFlowProvider><BlueprintStudio /></ReactFlowProvider>); }

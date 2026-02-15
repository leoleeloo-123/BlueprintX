
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
import { Download, Upload, Plus, Layers, Settings2, X, Globe, Sliders, Trash2, Filter, ChevronDown, Link2, FileText, Database, EyeOff, Tag as TagIcon, PackageOpen, RotateCcw, Info, Check, ArrowUpDown } from 'lucide-react';
import * as XLSX from 'xlsx';

import { NodeCardType, NodeData, GlobalSettings, TableCategory, ConnectionType, LogicCategory, AppearanceSettings, DataSource, FieldType, Tag } from './types.ts';
import { translations } from './translations.ts';
import { BlueprintCard } from './components/BlueprintCard.tsx';
import { BlueprintEdge } from './components/BlueprintEdge.tsx';
import { EditorModal } from './components/EditorModal.tsx';
import { EdgeEditorModal } from './components/EdgeEditorModal.tsx';
import { StudioSettingsModal } from './components/StudioSettingsModal.tsx';
import { Legend } from './components/Legend.tsx';

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
  {
    id: 'demo-1',
    type: 'blueprintNode',
    position: { x: -300, y: 50 },
    data: { 
      label: 'ERP Invoices', 
      cardType: NodeCardType.TABLE, 
      categoryId: 'cat-src',
      dataSourceId: 'src-erp',
      tags: ['tag-prod', 'tag-ext'],
      columns: [
        { id: 'c1', name: 'Invoice_ID', typeId: 'ft-text', isKey: true },
        { id: 'c2', name: 'Posted_Date', typeId: 'ft-date' },
        { id: 'c3', name: 'Total_Amount', typeId: 'ft-number' },
        { id: 'c4', name: 'Vendor_ID', typeId: 'ft-text' }
      ],
      comment: 'Direct feed from SAP production instance.'
    }
  },
  {
    id: 'demo-2',
    type: 'blueprintNode',
    position: { x: -300, y: 450 },
    data: { 
      label: 'Customer Master', 
      cardType: NodeCardType.TABLE, 
      categoryId: 'cat-src',
      dataSourceId: 'src-crm',
      tags: ['tag-prod'],
      columns: [
        { id: 'c5', name: 'Cust_ID', typeId: 'ft-text', isKey: true },
        { id: 'c6', name: 'Tax_ID', typeId: 'ft-text' },
        { id: 'c7', name: 'Region', typeId: 'ft-text' }
      ]
    }
  },
  {
    id: 'demo-3',
    type: 'blueprintNode',
    position: { x: 100, y: 250 },
    data: { 
      label: 'Data Integrity Shield', 
      cardType: NodeCardType.LOGIC_NOTE, 
      categoryId: 'log-rule',
      tags: ['tag-crit'],
      description: 'Central validation gate for all incoming financial streams.',
      bulletPoints: [
        'Validate VAT ID against VIES registry',
        'Check for duplicate Invoice_IDs in 24h window',
        'Reject records with null Total_Amount'
      ]
    }
  },
  {
    id: 'demo-4',
    type: 'blueprintNode',
    position: { x: 500, y: 250 },
    data: { 
      label: 'EU Tax Engine', 
      cardType: NodeCardType.LOGIC_NOTE, 
      categoryId: 'log-calc',
      tags: ['tag-prod', 'tag-crit'],
      description: 'Calculates regional VAT and cross-border duties.',
      bulletPoints: [
        'Apply 21% standard rate for local sales',
        'Apply reverse charge logic for B2B cross-border',
        'Round to 2 decimal places'
      ]
    }
  },
  {
    id: 'demo-5',
    type: 'blueprintNode',
    position: { x: 900, y: 50 },
    data: { 
      label: 'Final Tax Ledger', 
      cardType: NodeCardType.TABLE, 
      categoryId: 'cat-std',
      tags: ['tag-prod'],
      columns: [
        { id: 'c8', name: 'Entry_ID', typeId: 'ft-text', isKey: true },
        { id: 'c9', name: 'Net_Amount', typeId: 'ft-number' },
        { id: 'c10', name: 'VAT_Amount', typeId: 'ft-number' },
        { id: 'c11', name: 'Status', typeId: 'ft-text' }
      ]
    }
  },
  {
    id: 'demo-6',
    type: 'blueprintNode',
    position: { x: 900, y: 450 },
    data: { 
      label: 'VAT Compliance Report', 
      cardType: NodeCardType.TABLE, 
      categoryId: 'cat-std',
      tags: ['tag-ext'],
      columns: [
        { id: 'c12', name: 'Report_ID', typeId: 'ft-text', isKey: true },
        { id: 'c13', name: 'Period', typeId: 'ft-text' },
        { id: 'c14', name: 'Total_VAT_Collected', typeId: 'ft-number' }
      ]
    }
  }
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

const PROJECT_STORAGE_KEY = 'whitebox_project_v1';
const APPEARANCE_STORAGE_KEY = 'whitebox_appearance_v1';
const HIDE_ALL_VALUE = '__HIDE_ALL__';

const CANVAS_PADDING = 0.35;

function BlueprintStudio() {
  const { fitView } = useReactFlow();
  const hasPerformedInitialFit = useRef(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<Node<NodeData>[]>(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.nodes || [];
      } catch (e) {
        console.error("Failed to parse saved nodes", e);
      }
    }
    return DEMO_NODES;
  });

  const [edges, setEdges] = useState<Edge[]>(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.edges || [];
      } catch (e) {
        console.error("Failed to parse saved edges", e);
      }
    }
    return DEMO_EDGES;
  });

  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed.settings } || DEFAULT_SETTINGS;
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    const saved = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_APPEARANCE, ...parsed };
      } catch (e) {
        console.error("Failed to parse saved appearance", e);
      }
    }
    return DEFAULT_APPEARANCE;
  });

  const [activeTableFilters, setActiveTableFilters] = useState<string[]>(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).activeTableFilters || [];
      } catch (e) { return []; }
    }
    return [];
  });
  const [activeLogicFilters, setActiveLogicFilters] = useState<string[]>(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).activeLogicFilters || [];
      } catch (e) { return []; }
    }
    return [];
  });
  const [activeEdgeFilters, setActiveEdgeFilters] = useState<string[]>(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).activeEdgeFilters || [];
      } catch (e) { return []; }
    }
    return [];
  });
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).activeTagFilters || [];
      } catch (e) { return []; }
    }
    return [];
  });
  
  const [openMenuType, setOpenMenuType] = useState<'table' | 'logic' | 'edge' | 'tag' | 'add' | 'io' | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setOpenMenuType(null);
      }
    }

    if (openMenuType) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuType]);

  useEffect(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    setIsDemoMode(!saved);
  }, []);

  useEffect(() => {
    if (!hasPerformedInitialFit.current && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: CANVAS_PADDING });
        hasPerformedInitialFit.current = true;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);

  useEffect(() => {
    const projectData = { 
      nodes, 
      edges, 
      settings,
      activeTableFilters,
      activeLogicFilters,
      activeEdgeFilters,
      activeTagFilters
    };
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectData));
  }, [nodes, edges, settings, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters]);

  useEffect(() => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  }, [appearance]);

  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [showStudioSettings, setShowStudioSettings] = useState<any>(null);

  const t = (key: keyof typeof translations.en) => translations[appearance.language][key] || key;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    setIsDemoMode(false);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
    setIsDemoMode(false);
  }, []);
  
  const onConnect = useCallback((params: Connection) => {
    const defaultType = settings.connectionTypes[0];
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'blueprintEdge',
      data: { typeId: defaultType.id },
      markerEnd: { type: MarkerType.ArrowClosed, color: defaultType.color }
    }, eds));
    setIsDemoMode(false);
  }, [settings]);

  const handleSaveNode = (id: string, updatedData: Partial<NodeData>) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...updatedData } } : node));
    setEditingNode(null);
    setIsDemoMode(false);
  };

  const handleSaveEdge = (id: string, data: { typeId: string; label: string; hasArrow: boolean }) => {
    const connType = settings.connectionTypes.find(t => t.id === data.typeId);
    setEdges((eds) => eds.map((edge) => edge.id === id ? { 
      ...edge, 
      label: data.label,
      data: { ...edge.data, typeId: data.typeId },
      markerEnd: data.hasArrow ? { type: MarkerType.ArrowClosed, color: connType?.color || '#94a3b8' } : undefined
    } : edge));
    setEditingEdge(null);
    setIsDemoMode(false);
  };

  const handleAutoAlign = useCallback(() => {
    fitView({ padding: CANVAS_PADDING, duration: 800 });
  }, [fitView]);

  const handleResetCanvas = useCallback(() => {
    if (window.confirm(t('reset_confirm'))) {
      setNodes([]);
      setEdges([]);
      setActiveTableFilters([]);
      setActiveLogicFilters([]);
      setActiveEdgeFilters([]);
      setActiveTagFilters([]);
      hasPerformedInitialFit.current = false;
      setIsDemoMode(false);
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify({ nodes: [], edges: [], settings }));
      setOpenMenuType(null);
    }
  }, [t, settings]);

  const handleResetFilters = useCallback(() => {
    setActiveTableFilters([]);
    setActiveLogicFilters([]);
    setActiveEdgeFilters([]);
    setActiveTagFilters([]);
    setOpenMenuType(null);
  }, []);

  const addNode = (type: NodeCardType) => {
    const id = Date.now().toString();
    let defaultCatId = undefined;
    if (type === NodeCardType.TABLE) {
      defaultCatId = (settings.tableCategories.find(c => c.isDefault) || settings.tableCategories[0]).id;
    } else if (type === NodeCardType.LOGIC_NOTE) {
      defaultCatId = (settings.logicCategories.find(c => c.isDefault) || settings.logicCategories[0]).id;
    }
    
    setNodes((nds) => nds.concat({
      id,
      type: 'blueprintNode',
      position: { x: 100, y: 100 },
      data: { 
        label: `New ${type.toLowerCase()}`, 
        cardType: type,
        categoryId: defaultCatId,
        columns: type === NodeCardType.TABLE ? [{ id: '1', name: 'New Field', isKey: false }] : [],
        description: '',
        bulletPoints: [],
        comment: '',
        dataSourceId: '',
        tags: []
      },
    }));
    setOpenMenuType(null);
    setIsDemoMode(false);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nodes.map(n => ({
      ID: n.id, Label: n.data.label, Type: n.data.cardType, CatID: n.data.categoryId || '', X: n.position.x, Y: n.position.y, 
      Columns: n.data.columns?.map(c => `${c.name}:${c.typeId || ''}:${c.isKey ? 'K' : ''}`).join('|') || '',
      Desc: n.data.description || '', Bullets: n.data.bulletPoints?.join('|') || '', Comment: n.data.comment || '', DataSourceID: n.data.dataSourceId || '',
      Tags: n.data.tags?.join('|') || ''
    }))), "Nodes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(edges.map(e => ({
      ID: e.id, Source: e.source, Target: e.target, SourceHandle: e.sourceHandle || '', TargetHandle: e.targetHandle || '',
      Label: e.label || '', TypeID: e.data?.typeId || '', HasArrow: e.markerEnd ? 'YES' : 'NO'
    }))), "Edges");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.tableCategories), "TableCategories");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.logicCategories), "LogicCategories");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.connectionTypes), "ConnectionTypes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.dataSources), "DataSources");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.sheet_to_json(settings.fieldTypes), "FieldTypes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.tags || []), "Tags");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([appearance]), "Appearance");
    
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      TableFilters: activeTableFilters.join('|'),
      LogicFilters: activeLogicFilters.join('|'),
      EdgeFilters: activeEdgeFilters.join('|'),
      TagFilters: activeTagFilters.join('|')
    }]), "ActiveFilters");

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear().toString().slice(-2)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const org = appearance.organizationName.replace(/\s+/g, '_') || 'Org';
    const user = appearance.userName.replace(/\s+/g, '_') || 'User';
    
    const filename = `WhiteBox_${org}_${user}_${dateStr}_${timeStr}.xlsx`;
    XLSX.writeFile(wb, filename);
    setOpenMenuType(null);
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target?.result, { type: 'binary' });
      const tableCats = workbook.Sheets["TableCategories"] ? XLSX.utils.sheet_to_json(workbook.Sheets["TableCategories"]) as TableCategory[] : settings.tableCategories;
      const logicCats = workbook.Sheets["LogicCategories"] ? XLSX.utils.sheet_to_json(workbook.Sheets["LogicCategories"]) as LogicCategory[] : settings.logicCategories;
      const connTypes = workbook.Sheets["ConnectionTypes"] ? XLSX.utils.sheet_to_json(workbook.Sheets["ConnectionTypes"]) as ConnectionType[] : settings.connectionTypes;
      const dataSources = workbook.Sheets["DataSources"] ? XLSX.utils.sheet_to_json(workbook.Sheets["DataSources"]) as DataSource[] : settings.dataSources;
      const fTypes = workbook.Sheets["FieldTypes"] ? XLSX.utils.sheet_to_json(workbook.Sheets["FieldTypes"]) as FieldType[] : settings.fieldTypes;
      const importedTags = workbook.Sheets["Tags"] ? XLSX.utils.sheet_to_json(workbook.Sheets["Tags"]) as Tag[] : [];
      
      const appSettingsRaw = workbook.Sheets["Appearance"] ? XLSX.utils.sheet_to_json(workbook.Sheets["Appearance"])[0] as any : null;
      if (appSettingsRaw) {
        setAppearance({ ...DEFAULT_APPEARANCE, ...appSettingsRaw });
      }

      const filterSheet = workbook.Sheets["ActiveFilters"] ? XLSX.utils.sheet_to_json(workbook.Sheets["ActiveFilters"])[0] as any : null;
      if (filterSheet) {
        setActiveTableFilters(filterSheet.TableFilters ? filterSheet.TableFilters.split('|').filter(Boolean) : []);
        setActiveLogicFilters(filterSheet.LogicFilters ? filterSheet.LogicFilters.split('|').filter(Boolean) : []);
        setActiveEdgeFilters(filterSheet.EdgeFilters ? filterSheet.EdgeFilters.split('|').filter(Boolean) : []);
        setActiveTagFilters(filterSheet.TagFilters ? filterSheet.TagFilters.split('|').filter(Boolean) : []);
      }

      const importedNodesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Nodes"]) as any[];
      const importedNodes = importedNodesRaw.map(n => ({
        id: String(n.ID), type: 'blueprintNode', position: { x: Number(n.X), y: Number(n.Y) },
        data: {
          label: n.Label, cardType: n.Type, categoryId: n.CatID,
          columns: n.Columns ? n.Columns.split('|').map((colStr: string, i: number) => {
            const [name, typeId, key] = colStr.split(':');
            return { id: String(i), name, typeId: typeId || undefined, isKey: key === 'K' };
          }) : [],
          description: n.Desc, bulletPoints: n.Bullets ? n.Bullets.split('|') : [],
          comment: n.Comment || '', dataSourceId: n.DataSourceID || '',
          tags: n.Tags ? n.Tags.split('|') : []
        }
      }));

      const importedEdgesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Edges"]) as any[];
      const importedEdges = importedEdgesRaw.map(e => {
        const cType = connTypes.find(t => t.id === e.TypeID);
        return {
          id: String(e.ID), source: String(e.Source), target: String(e.Target), sourceHandle: e.SourceHandle || null, targetHandle: e.TargetHandle || null,
          label: e.Label, type: 'blueprintEdge', data: { typeId: e.TypeID },
          markerEnd: e.HasArrow === 'YES' ? { type: MarkerType.ArrowClosed, color: cType?.color || '#94a3b8' } : undefined
        };
      });

      setSettings({ tableCategories: tableCats, logicCategories: logicCats, connectionTypes: connTypes, dataSources, fieldTypes: fTypes, tags: importedTags });
      setNodes(importedNodes);
      setEdges(importedEdges);
      setIsDemoMode(false);
      setOpenMenuType(null);
      
      setTimeout(() => fitView({ padding: CANVAS_PADDING, duration: 400 }), 50);
    };
    reader.readAsBinaryString(file);
  };

  const nodesWithActions = useMemo(() => nodes.map(n => ({
    ...n, data: { 
      ...n.data, onEdit: setEditingNode, onDelete: (id: string) => setNodes(nds => nds.filter(node => node.id !== id)), 
      settings, appearance, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters
    }
  })), [nodes, settings, appearance, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters]);

  const edgesWithActions = useMemo(() => edges.map(e => {
    const sourceNode = nodes.find(n => n.id === e.source);
    const targetNode = nodes.find(n => n.id === e.target);
    return {
      ...e, data: { 
        ...e.data, onEdit: setEditingEdge, onDelete: (id: string) => setEdges(eds => eds.filter(edge => edge.id !== id)), 
        settings, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters,
        sourceCategoryId: sourceNode?.data.categoryId, targetCategoryId: targetNode?.data.categoryId,
        sourceTags: sourceNode?.data.tags, targetTags: targetNode?.data.tags
      }
    };
  }), [edges, settings, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters, nodes]);

  const getFilterDisplay = (type: 'table' | 'logic' | 'edge' | 'tag') => {
    let current: string[] = [];
    if (type === 'table') current = activeTableFilters;
    else if (type === 'logic') current = activeLogicFilters;
    else if (type === 'edge') current = activeEdgeFilters;
    else if (type === 'tag') current = activeTagFilters;

    if (current.length === 0) return t('all');
    if (current.includes(HIDE_ALL_VALUE)) return t('hide_all');
    
    if (current.length === 1) {
      if (type === 'table') return settings.tableCategories.find(c => c.id === current[0])?.name || t('all');
      if (type === 'logic') return settings.logicCategories.find(c => c.id === current[0])?.name || t('all');
      if (type === 'edge') return settings.connectionTypes.find(c => c.id === current[0])?.name || t('all');
      if (type === 'tag') return settings.tags.find(c => c.id === current[0])?.name || t('all');
    }

    return `${current.length} selected`;
  };

  const getFilterCount = (type: 'table' | 'logic' | 'edge' | 'tag') => {
    if (type === 'table') return activeTableFilters.length;
    if (type === 'logic') return activeLogicFilters.length;
    if (type === 'edge') return activeEdgeFilters.length;
    if (type === 'tag') return activeTagFilters.length;
    return 0;
  };

  const toggleMultiFilter = (id: string, current: string[], setter: (val: string[]) => void) => {
    if (id === HIDE_ALL_VALUE) {
      setter(current.includes(HIDE_ALL_VALUE) ? [] : [HIDE_ALL_VALUE]);
    } else {
      const filtered = current.filter(x => x !== HIDE_ALL_VALUE);
      if (filtered.includes(id)) {
        setter(filtered.filter(x => x !== id));
      } else {
        setter([...filtered, id]);
      }
    }
  };

  const handleSaveStudioSettings = (newSettings: GlobalSettings, newAppearance: AppearanceSettings) => {
    setSettings(newSettings);
    setAppearance(newAppearance);
    setShowStudioSettings(null);
  };

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden" style={{ backgroundColor: appearance.canvasBgColor }}>
      <main className="w-full h-full relative">
        {/* Unified Responsive Top Toolbar */}
        <div className="absolute inset-x-0 top-0 p-2 lg:p-6 flex items-center justify-between pointer-events-none z-30 transition-all duration-300" ref={toolbarRef}>
          {/* Action Group */}
          <div className="flex items-center gap-1.5 lg:gap-3 pointer-events-auto flex-nowrap min-w-0">
            {/* Create Node */}
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => setOpenMenuType(openMenuType === 'add' ? null : 'add')} 
                className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all transform active:scale-95 aspect-square flex-shrink-0 ${openMenuType === 'add' ? 'rotate-45 bg-slate-900' : ''}`}
                title="Add Component"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
              {openMenuType === 'add' && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <button onClick={() => addNode(NodeCardType.TABLE)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Database size={16} /></div>
                    <span className="text-left">{t('data_table')}</span>
                  </button>
                  <button onClick={() => addNode(NodeCardType.LOGIC_NOTE)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><FileText size={16} /></div>
                    <span className="text-left">{t('logic_node')}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-0.5 lg:mx-1 flex-shrink-0" />

            {/* General Settings (Black Branding/Setting Button) */}
            <button 
              onClick={() => setShowStudioSettings({ initialTab: 'general' })} 
              className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all group flex-shrink-0 aspect-square border border-slate-700 ring-2 ring-transparent active:scale-95"
              title={t('general_settings')}
            >
              <Settings2 size={22} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>

            {/* Reset Filters - Distinct Rose Color */}
            <button 
              onClick={handleResetFilters} 
              className="flex items-center justify-center gap-3 px-2 xl:px-4 py-1.5 lg:py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group h-10 lg:h-12 xl:w-auto aspect-square xl:aspect-auto"
              title={t('reset_filters')}
            >
              <div className="p-1.5 bg-rose-50 rounded-full text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors flex-shrink-0">
                <RotateCcw size={16} strokeWidth={2.5} className="group-hover:rotate-[-45deg] transition-transform" />
              </div>
              <div className="flex flex-col items-start pr-1 hidden xl:flex">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t('filters_label')}</span>
                <span className="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition-colors">{t('reset_filters')}</span>
              </div>
            </button>

            {/* Filter Dropdowns */}
            {['tag', 'table', 'logic', 'edge'].map((type: any) => (
              <div className="relative flex-shrink-0" key={type}>
                <button 
                  onClick={() => setOpenMenuType(openMenuType === type ? null : type)} 
                  className={`flex items-center justify-center gap-1.5 lg:gap-3 px-2 xl:px-4 py-1.5 lg:py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group h-10 lg:h-12 xl:w-auto aspect-square xl:aspect-auto relative ${openMenuType === type ? 'ring-2 ring-slate-400/20' : ''}`}
                  title={t(type === 'tag' ? 'tags' : type === 'table' ? 'data_table' : type === 'logic' ? 'logic_node' : 'link_classification')}
                >
                  <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                    type === 'tag' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                    type === 'table' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                    type === 'logic' ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' :
                    'bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white'
                  }`}>
                    {type === 'tag' && <TagIcon size={16} strokeWidth={2.5} />}
                    {type === 'table' && <Database size={16} strokeWidth={2.5} />}
                    {type === 'logic' && <FileText size={16} strokeWidth={2.5} />}
                    {type === 'edge' && <Link2 size={16} strokeWidth={2.5} />}
                  </div>
                  <div className="flex flex-col items-start pr-1 hidden xl:flex">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                      {t(type === 'tag' ? 'tags' : type === 'table' ? 'data_table' : type === 'logic' ? 'logic_node' : 'link_classification')}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{getFilterDisplay(type)}</span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${openMenuType === type ? 'rotate-180' : ''} hidden xl:block`} />
                  
                  {getFilterCount(type) > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white xl:hidden shadow-sm border border-white z-20 leading-none">
                      {getFilterCount(type)}
                    </span>
                  )}
                </button>
                {openMenuType === type && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <button 
                      onClick={() => (type === 'tag' ? setActiveTagFilters([]) : type === 'table' ? setActiveTableFilters([]) : type === 'logic' ? setActiveLogicFilters([]) : setActiveEdgeFilters([]))} 
                      className="w-full flex items-start justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 text-slate-600 text-left"
                    >
                      <div className="flex items-start gap-3 flex-1 text-left">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                        <span className="flex-1 leading-tight text-left">{t('all')}</span>
                      </div>
                      {(type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters).length === 0 && <Check size={14} className="mt-1 shrink-0 ml-2" />}
                    </button>
                    <button 
                      onClick={() => toggleMultiFilter(HIDE_ALL_VALUE, (type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters), (type === 'tag' ? setActiveTagFilters : type === 'table' ? setActiveTableFilters : type === 'logic' ? setActiveLogicFilters : setActiveEdgeFilters))} 
                      className="w-full flex items-start justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 text-slate-600 text-left"
                    >
                      <div className="flex items-start gap-3 flex-1 text-left">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                        <span className="flex-1 leading-tight text-left">{t('hide_all')}</span>
                      </div>
                      {(type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters).includes(HIDE_ALL_VALUE) && <Check size={14} className="mt-1 shrink-0 ml-2" />}
                    </button>
                    <div className="h-px bg-slate-50 my-1 mx-4" />
                    {(type === 'tag' ? settings.tags : type === 'table' ? settings.tableCategories : type === 'logic' ? settings.logicCategories : settings.connectionTypes).map((item: any) => (
                      <button 
                        key={item.id} 
                        onClick={() => toggleMultiFilter(item.id, (type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters), (type === 'tag' ? setActiveTagFilters : type === 'tag' ? setActiveTagFilters : type === 'table' ? setActiveTableFilters : type === 'logic' ? setActiveLogicFilters : setActiveEdgeFilters))} 
                        className="w-full flex items-start justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 text-slate-600 text-left"
                      >
                        <div className="flex items-start gap-3 flex-1 text-left">
                          <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="flex-1 leading-tight text-left">{item.name}</span>
                        </div>
                        {(type === 'tag' ? activeTagFilters : type === 'table' ? activeTableFilters : type === 'logic' ? activeLogicFilters : activeEdgeFilters).includes(item.id) && <Check size={14} className="mt-1 shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 lg:gap-3 pointer-events-auto flex-nowrap shrink-0">
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => setOpenMenuType(openMenuType === 'io' ? null : 'io')} 
                className="flex items-center justify-center gap-3 px-2 xl:px-4 py-1.5 lg:py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group h-10 lg:h-12 xl:w-auto aspect-square xl:aspect-auto"
                title="Project Actions"
              >
                <div className="p-1.5 bg-slate-100 rounded-full text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors flex-shrink-0">
                  <ArrowUpDown size={16} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start pr-1 hidden xl:flex">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Project</span>
                  <span className="text-xs font-bold text-slate-700">Import/Export</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${openMenuType === 'io' ? 'rotate-180' : ''} hidden xl:block`} />
              </button>
              {openMenuType === 'io' && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    <Download size={16} className="text-blue-600" />
                    <span className="text-left">{t('export_project')}</span>
                  </button>
                  <label className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload size={16} className="text-emerald-600" />
                    <span className="text-left">{t('import_xlsx')}</span>
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={importFromExcel} />
                  </label>
                  <div className="h-px bg-slate-50 my-1 mx-4" />
                  <button onClick={handleResetCanvas} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left">
                    <Trash2 size={16} />
                    <span className="text-left">{t('reset_canvas')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isDemoMode && (
          <div className="absolute top-24 left-6 z-40 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl shadow-xl shadow-amber-200/20">
              <div className="p-2 bg-amber-400 text-white rounded-xl shadow-inner"><Info size={20} /></div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-amber-800 uppercase tracking-widest leading-none mb-1">{t('demo_mode')}</span>
                <span className="text-[11px] font-bold text-amber-600/80">{t('demo_reset_hint')}</span>
              </div>
              <button onClick={() => setIsDemoMode(false)} className="ml-4 p-1.5 hover:bg-amber-100 rounded-full text-amber-400 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodesWithActions}
          edges={edgesWithActions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: CANVAS_PADDING }}
          minZoom={0.05}
          maxZoom={4}
          onPaneClick={() => setOpenMenuType(null)}
          onMoveStart={() => setOpenMenuType(null)}
          className="bg-transparent"
          defaultEdgeOptions={{ 
            type: 'blueprintEdge',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
          }}
        >
          <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={24} size={1} />
          <Controls position="bottom-right" />
        </ReactFlow>
        <Legend settings={settings} appearance={appearance} onUpdateAppearance={setAppearance} />
      </main>

      {editingNode && (
        <EditorModal 
          node={nodes.find(n => n.id === editingNode)!} settings={settings} onClose={() => setEditingNode(null)}
          onSave={(data) => handleSaveNode(editingNode, data)} language={appearance.language}
        />
      )}

      {editingEdge && (
        <EdgeEditorModal
          edge={edges.find(e => e.id === editingEdge)!} settings={settings} onClose={() => setEditingEdge(null)}
          onSave={(data) => handleSaveEdge(editingEdge, data)} language={appearance.language}
        />
      )}

      {showStudioSettings && (
        <StudioSettingsModal 
          settings={settings} 
          appearance={appearance}
          initialTab={showStudioSettings.initialTab}
          onClose={() => setShowStudioSettings(null)} 
          onSave={handleSaveStudioSettings} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <BlueprintStudio />
    </ReactFlowProvider>
  );
}

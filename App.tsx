
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
import { Download, Upload, Plus, Layers, Settings2, X, Globe, Sliders, Trash2, Filter, ChevronDown, Link2, FileText, Database, EyeOff, Tag as TagIcon, PackageOpen } from 'lucide-react';
import * as XLSX from 'xlsx';

import { NodeCardType, NodeData, GlobalSettings, TableCategory, ConnectionType, LogicCategory, AppearanceSettings, DataSource, FieldType, Tag } from './types.ts';
import { translations } from './translations.ts';
import { BlueprintCard } from './components/BlueprintCard.tsx';
import { BlueprintEdge } from './components/BlueprintEdge.tsx';
import { EditorModal } from './components/EditorModal.tsx';
import { EdgeEditorModal } from './components/EdgeEditorModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { GeneralSettingsModal } from './components/GeneralSettingsModal.tsx';
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
    { id: 'conn-std', name: 'Standard Flow', color: '#94a3b8', width: 2, dashStyle: 'solid' },
    { id: 'conn-crit', name: 'Critical Path', color: '#dc2626', width: 3, dashStyle: 'solid' },
    { id: 'conn-ref', name: 'Reference Only', color: '#64748b', width: 1, dashStyle: 'dashed' }
  ],
  dataSources: [
    { id: 'src-erp', name: 'ERP Data' },
    { id: 'src-xls', name: 'Excel Data' },
    { id: 'src-sql', name: 'Database' }
  ],
  fieldTypes: [
    { id: 'ft-text', name: 'Text' },
    { id: 'ft-number', name: 'Number' },
    { id: 'ft-date', name: 'Date' },
    { id: 'ft-bool', name: 'Boolean' }
  ],
  tags: []
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  language: 'en',
  canvasBgColor: '#f8fafc',
  headerFontSize: 'sm',
  contentFontSize: 'sm',
  userName: 'User',
  organizationName: 'Org',
  isLegendExpanded: true
};

const PROJECT_STORAGE_KEY = 'whitebox_project_v1';
const APPEARANCE_STORAGE_KEY = 'whitebox_appearance_v1';
const HIDE_ALL_VALUE = '__HIDE_ALL__';

function BlueprintStudio() {
  const { fitView } = useReactFlow();
  const hasPerformedInitialFit = useRef(false);

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
    return [];
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
    return [];
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

  // Filter States
  const [activeTableFilter, setActiveTableFilter] = useState<string | null>(null);
  const [activeLogicFilter, setActiveLogicFilter] = useState<string | null>(null);
  const [activeEdgeFilter, setActiveEdgeFilter] = useState<string | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  
  const [openFilterType, setOpenFilterType] = useState<'table' | 'logic' | 'edge' | 'tag' | 'add' | null>(null);

  useEffect(() => {
    if (!hasPerformedInitialFit.current && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2 });
        hasPerformedInitialFit.current = true;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);

  useEffect(() => {
    const projectData = { nodes, edges, settings };
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectData));
  }, [nodes, edges, settings]);

  useEffect(() => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  }, [appearance]);

  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);

  const t = (key: keyof typeof translations.en) => translations[appearance.language][key] || key;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);
  
  const onConnect = useCallback((params: Connection) => {
    const defaultType = settings.connectionTypes[0];
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'blueprintEdge',
      data: { typeId: defaultType.id },
      markerEnd: { type: MarkerType.ArrowClosed, color: defaultType.color }
    }, eds));
  }, [settings]);

  const handleSaveNode = (id: string, updatedData: Partial<NodeData>) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...updatedData } } : node));
    setEditingNode(null);
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
  };

  const handleAutoAlign = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 });
  }, [fitView]);

  const handleResetCanvas = useCallback(() => {
    if (window.confirm(t('reset_confirm'))) {
      setNodes([]);
      setEdges([]);
      setActiveTableFilter(null);
      setActiveLogicFilter(null);
      setActiveEdgeFilter(null);
      setActiveTagFilter(null);
      hasPerformedInitialFit.current = false;
    }
  }, [t]);

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
    setOpenFilterType(null);
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
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.fieldTypes), "FieldTypes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.tags || []), "Tags");

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear().toString().slice(-2)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const org = appearance.organizationName.replace(/\s+/g, '_') || 'Org';
    const user = appearance.userName.replace(/\s+/g, '_') || 'User';
    
    // Updated prefix to WhiteBox while keeping requested structure
    const filename = `WhiteBox_${org}_${user}_${dateStr}_${timeStr}.xlsx`;
    XLSX.writeFile(wb, filename);
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
      setActiveTableFilter(null);
      setActiveLogicFilter(null);
      setActiveEdgeFilter(null);
      setActiveTagFilter(null);
      
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    };
    reader.readAsBinaryString(file);
  };

  const nodesWithActions = useMemo(() => nodes.map(n => ({
    ...n, data: { 
      ...n.data, onEdit: setEditingNode, onDelete: (id: string) => setNodes(nds => nds.filter(node => node.id !== id)), 
      settings, appearance, activeTableFilter, activeLogicFilter, activeEdgeFilter, activeTagFilter
    }
  })), [nodes, settings, appearance, activeTableFilter, activeLogicFilter, activeEdgeFilter, activeTagFilter]);

  const edgesWithActions = useMemo(() => edges.map(e => {
    const sourceNode = nodes.find(n => n.id === e.source);
    const targetNode = nodes.find(n => n.id === e.target);
    return {
      ...e, data: { 
        ...e.data, onEdit: setEditingEdge, onDelete: (id: string) => setEdges(eds => eds.filter(edge => edge.id !== id)), 
        settings, activeTableFilter, activeLogicFilter, activeEdgeFilter, activeTagFilter,
        sourceCategoryId: sourceNode?.data.categoryId, targetCategoryId: targetNode?.data.categoryId,
        sourceTags: sourceNode?.data.tags, targetTags: targetNode?.data.tags
      }
    };
  }), [edges, settings, activeTableFilter, activeLogicFilter, activeEdgeFilter, activeTagFilter, nodes]);

  const getFilterName = (type: 'table' | 'logic' | 'edge' | 'tag') => {
    if (type === 'table') {
      if (!activeTableFilter) return t('all');
      if (activeTableFilter === HIDE_ALL_VALUE) return t('hide_all');
      return settings.tableCategories.find(c => c.id === activeTableFilter)?.name || t('all');
    }
    if (type === 'logic') {
      if (!activeLogicFilter) return t('all');
      if (activeLogicFilter === HIDE_ALL_VALUE) return t('hide_all');
      return settings.logicCategories.find(c => c.id === activeLogicFilter)?.name || t('all');
    }
    if (type === 'edge') {
      if (!activeEdgeFilter) return t('all');
      if (activeEdgeFilter === HIDE_ALL_VALUE) return t('hide_all');
      return settings.connectionTypes.find(c => c.id === activeEdgeFilter)?.name || t('all');
    }
    if (type === 'tag') {
      if (!activeTagFilter) return t('all');
      if (activeTagFilter === HIDE_ALL_VALUE) return t('hide_all');
      return settings.tags.find(tag => tag.id === activeTagFilter)?.name || t('all');
    }
    return t('all');
  };

  return (
    <div className="w-full h-full flex flex-row overflow-hidden bg-slate-50 relative" style={{ backgroundColor: appearance.canvasBgColor }}>
      <aside className="w-72 h-full bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Updated Logo to PackageOpen (Open White Box) */}
              <PackageOpen size={24} strokeWidth={2.5} className="relative z-10" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">WhiteBox</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1.5">{t('documentation')}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1">{t('configuration')}</h2>
            <div className="flex flex-col gap-1">
              <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors text-sm rounded-lg hover:bg-slate-50 w-full text-left">
                <Settings2 size={18} />
                <span>{t('global_config')}</span>
              </button>
              <button onClick={handleAutoAlign} className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors text-sm cursor-pointer rounded-lg hover:bg-slate-50 w-full text-left">
                <Layers size={18} />
                <span>{t('auto_align')}</span>
              </button>
              <button onClick={() => setShowGeneralSettings(true)} className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors text-sm rounded-lg hover:bg-slate-50 w-full text-left">
                <Sliders size={18} />
                <span>{t('general_setting')}</span>
              </button>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-50 flex flex-col gap-3">
          <button onClick={exportToExcel} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold text-xs shadow-md shadow-slate-100">
            <Download size={14} /> {t('export_project')}
          </button>
          <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-xs cursor-pointer">
            <Upload size={14} /> {t('import_xlsx')}
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={importFromExcel} />
          </label>
          <button onClick={handleResetCanvas} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 hover:border-red-200 transition-all font-semibold text-xs">
            <Trash2 size={14} /> {t('reset_canvas')}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-0 relative">
        {/* Canvas View Tools & Filters */}
        <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
          {/* Add Node Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setOpenFilterType(openFilterType === 'add' ? null : 'add')}
              className={`w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all transform active:scale-95 ${openFilterType === 'add' ? 'rotate-45 bg-slate-900' : ''}`}
            >
              <Plus size={24} />
            </button>
            {openFilterType === 'add' && (
              <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <button 
                  onClick={() => addNode(NodeCardType.TABLE)} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Database size={16} /></div>
                  {t('data_table')}
                </button>
                <button 
                  onClick={() => addNode(NodeCardType.LOGIC_NOTE)} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                  <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><FileText size={16} /></div>
                  {t('logic_node')}
                </button>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Tag Filter */}
          <div className="relative">
            <button 
              onClick={() => setOpenFilterType(openFilterType === 'tag' ? null : 'tag')}
              className={`flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group ${activeTagFilter ? 'ring-2 ring-emerald-400 border-transparent' : ''}`}
            >
              <div className="p-1 bg-emerald-100 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TagIcon size={14} />
              </div>
              <div className="flex flex-col items-start pr-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t('tags')}</span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{getFilterName('tag')}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${openFilterType === 'tag' ? 'rotate-180' : ''}`} />
            </button>
            {openFilterType === 'tag' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <button onClick={() => { setActiveTagFilter(null); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${!activeTagFilter ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-600'}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />{t('all')}
                </button>
                <div className="h-px bg-slate-50 my-1 mx-4" />
                {settings.tags.map(tag => (
                  <button key={tag.id} onClick={() => { setActiveTagFilter(tag.id); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${activeTagFilter === tag.id ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-600'}`}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}
                  </button>
                ))}
                <div className="h-px bg-slate-50 my-1 mx-4" />
                <button onClick={() => { setActiveTagFilter(HIDE_ALL_VALUE); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 hover:text-red-600 ${activeTagFilter === HIDE_ALL_VALUE ? 'text-red-600 bg-red-50/50' : 'text-slate-400'}`}>
                  <EyeOff size={14} />{t('hide_all')}
                </button>
              </div>
            )}
          </div>

          {/* Table Filter */}
          <div className="relative">
            <button 
              onClick={() => setOpenFilterType(openFilterType === 'table' ? null : 'table')}
              className={`flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group ${activeTableFilter ? 'ring-2 ring-blue-400 border-transparent' : ''}`}
            >
              <div className="p-1 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Database size={14} />
              </div>
              <div className="flex flex-col items-start pr-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t('data_table')}</span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{getFilterName('table')}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${openFilterType === 'table' ? 'rotate-180' : ''}`} />
            </button>
            {openFilterType === 'table' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <button onClick={() => { setActiveTableFilter(null); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${!activeTableFilter ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />{t('all')}
                </button>
                <div className="h-px bg-slate-50 my-1 mx-4" />
                {settings.tableCategories.map(cat => (
                  <button key={cat.id} onClick={() => { setActiveTableFilter(cat.id); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${activeTableFilter === cat.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}
                  </button>
                ))}
                <div className="h-px bg-slate-50 my-1 mx-4" />
                <button onClick={() => { setActiveTableFilter(HIDE_ALL_VALUE); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 hover:text-red-600 ${activeTableFilter === HIDE_ALL_VALUE ? 'text-red-600 bg-red-50/50' : 'text-slate-400'}`}>
                  <EyeOff size={14} />{t('hide_all')}
                </button>
              </div>
            )}
          </div>

          {/* Logic Filter */}
          <div className="relative">
            <button 
              onClick={() => setOpenFilterType(openFilterType === 'logic' ? null : 'logic')}
              className={`flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group ${activeLogicFilter ? 'ring-2 ring-purple-400 border-transparent' : ''}`}
            >
              <div className="p-1 bg-purple-100 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileText size={14} />
              </div>
              <div className="flex flex-col items-start pr-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t('logic_node')}</span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{getFilterName('logic')}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${openFilterType === 'logic' ? 'rotate-180' : ''}`} />
            </button>
            {openFilterType === 'logic' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <button onClick={() => { setActiveLogicFilter(null); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${!activeLogicFilter ? 'text-purple-600 bg-purple-50/50' : 'text-slate-600'}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />{t('all')}
                </button>
                <div className="h-px bg-slate-50 my-1 mx-4" />
                {settings.logicCategories.map(cat => (
                  <button key={cat.id} onClick={() => { setActiveLogicFilter(cat.id); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${activeLogicFilter === cat.id ? 'text-purple-600 bg-purple-50/50' : 'text-slate-600'}`}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}
                  </button>
                ))}
                <div className="h-px bg-slate-50 my-1 mx-4" />
                <button onClick={() => { setActiveLogicFilter(HIDE_ALL_VALUE); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 hover:text-red-600 ${activeLogicFilter === HIDE_ALL_VALUE ? 'text-red-600 bg-red-50/50' : 'text-slate-400'}`}>
                  <EyeOff size={14} />{t('hide_all')}
                </button>
              </div>
            )}
          </div>

          {/* Edge Filter */}
          <div className="relative">
            <button 
              onClick={() => setOpenFilterType(openFilterType === 'edge' ? null : 'edge')}
              className={`flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group ${activeEdgeFilter ? 'ring-2 ring-slate-400 border-transparent' : ''}`}
            >
              <div className="p-1 bg-slate-100 rounded-full text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                <Link2 size={14} />
              </div>
              <div className="flex flex-col items-start pr-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t('link_classification')}</span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{getFilterName('edge')}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${openFilterType === 'edge' ? 'rotate-180' : ''}`} />
            </button>
            {openFilterType === 'edge' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <button onClick={() => { setActiveEdgeFilter(null); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${!activeEdgeFilter ? 'text-slate-900 bg-slate-50/50' : 'text-slate-600'}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />{t('all')}
                </button>
                <div className="h-px bg-slate-50 my-1 mx-4" />
                {settings.connectionTypes.map(conn => (
                  <button key={conn.id} onClick={() => { setActiveEdgeFilter(conn.id); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 ${activeEdgeFilter === conn.id ? 'text-slate-900 bg-slate-50/50' : 'text-slate-600'}`}>
                    <div className="w-3 h-px border-t border-slate-400" style={{ borderColor: conn.color, borderWidth: 2 }} />{conn.name}
                  </button>
                ))}
                <div className="h-px bg-slate-50 my-1 mx-4" />
                <button onClick={() => { setActiveEdgeFilter(HIDE_ALL_VALUE); setOpenFilterType(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 hover:text-red-600 ${activeEdgeFilter === HIDE_ALL_VALUE ? 'text-red-600 bg-red-50/50' : 'text-slate-400'}`}>
                  <EyeOff size={14} />{t('hide_all')}
                </button>
              </div>
            )}
          </div>
        </div>

        <ReactFlow
          nodes={nodesWithActions}
          edges={edgesWithActions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
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

      {showSettings && (
        <SettingsModal settings={settings} onClose={() => setShowSettings(false)} onSave={setSettings} language={appearance.language} />
      )}

      {showGeneralSettings && (
        <GeneralSettingsModal appearance={appearance} onClose={() => setShowGeneralSettings(false)} onSave={setAppearance} />
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


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
import { Download, Upload, Plus, Layers, Settings2, X, Globe, Sliders, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

import { NodeCardType, NodeData, GlobalSettings, TableCategory, ConnectionType, LogicCategory, AppearanceSettings, DataSource, FieldType } from './types.ts';
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
  ]
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

const PROJECT_STORAGE_KEY = 'blueprint_x_project_v1';
const APPEARANCE_STORAGE_KEY = 'blueprint_x_appearance_v1';

function BlueprintStudio() {
  const { fitView } = useReactFlow();
  const hasPerformedInitialFit = useRef(false);

  // Project Data Persistence (Nodes, Edges, Styles)
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

  // Appearance Settings Persistence
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    const saved = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist for legacy users
        return { 
          ...DEFAULT_APPEARANCE, 
          ...parsed 
        };
      } catch (e) {
        console.error("Failed to parse saved appearance", e);
      }
    }
    return DEFAULT_APPEARANCE;
  });

  // Trigger auto-align on initial load once nodes are available
  useEffect(() => {
    if (!hasPerformedInitialFit.current && nodes.length > 0) {
      // Small timeout to ensure React Flow has computed the node dimensions
      const timer = setTimeout(() => {
        fitView({ padding: 0.2 });
        hasPerformedInitialFit.current = true;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);

  // Effect to save project state whenever nodes, edges, or settings change
  useEffect(() => {
    const projectData = { nodes, edges, settings };
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectData));
  }, [nodes, edges, settings]);

  // Effect to save appearance settings
  useEffect(() => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  }, [appearance]);

  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);

  // Translation helper
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
        dataSourceId: ''
      },
    }));
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nodes.map(n => ({
      ID: n.id, 
      Label: n.data.label, 
      Type: n.data.cardType, 
      CatID: n.data.categoryId || '',
      X: n.position.x, 
      Y: n.position.y, 
      Columns: n.data.columns?.map(c => `${c.name}:${c.typeId || ''}:${c.isKey ? 'K' : ''}`).join('|') || '',
      Desc: n.data.description || '', 
      Bullets: n.data.bulletPoints?.join('|') || '',
      Comment: n.data.comment || '', 
      DataSourceID: n.data.dataSourceId || ''
    }))), "Nodes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(edges.map(e => ({
      ID: e.id, Source: e.source, Target: e.target, Label: e.label || '', TypeID: e.data?.typeId || '', HasArrow: e.markerEnd ? 'YES' : 'NO'
    }))), "Edges");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.tableCategories), "TableCategories");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.logicCategories), "LogicCategories");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.connectionTypes), "ConnectionTypes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.dataSources), "DataSources");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings.fieldTypes), "FieldTypes");

    // Construct filename
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    const org = (appearance.organizationName || 'Org').replace(/\s+/g, '_');
    const user = (appearance.userName || 'User').replace(/\s+/g, '_');
    const timestamp = `${yy}-${mm}-${dd}_${hh}${min}`;
    const filename = `BlueprintX_${org}_${user}_${timestamp}.xlsx`;

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
          comment: n.Comment || '', dataSourceId: n.DataSourceID || ''
        }
      }));

      const importedEdgesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Edges"]) as any[];
      const importedEdges = importedEdgesRaw.map(e => {
        const cType = connTypes.find(t => t.id === e.TypeID);
        return {
          id: String(e.ID), source: String(e.Source), target: String(e.Target), label: e.Label, type: 'blueprintEdge',
          data: { typeId: e.TypeID },
          markerEnd: e.HasArrow === 'YES' ? { type: MarkerType.ArrowClosed, color: cType?.color || '#94a3b8' } : undefined
        };
      });

      // Update state which will trigger localStorage sync
      setSettings({ 
        tableCategories: tableCats, 
        logicCategories: logicCats, 
        connectionTypes: connTypes, 
        dataSources: dataSources,
        fieldTypes: fTypes
      });
      setNodes(importedNodes);
      setEdges(importedEdges);
      
      // Fitting view after import
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    };
    reader.readAsBinaryString(file);
  };

  const nodesWithActions = useMemo(() => nodes.map(n => ({
    ...n, data: { ...n.data, onEdit: setEditingNode, onDelete: (id: string) => setNodes(nds => nds.filter(node => node.id !== id)), settings, appearance }
  })), [nodes, settings, appearance]);

  const edgesWithActions = useMemo(() => edges.map(e => ({
    ...e, data: { ...e.data, onEdit: setEditingEdge, onDelete: (id: string) => setEdges(eds => eds.filter(edge => edge.id !== id)), settings }
  })), [edges, settings]);

  return (
    <div className="w-full h-full flex flex-row overflow-hidden bg-slate-50 relative" style={{ backgroundColor: appearance.canvasBgColor }}>
      <aside className="w-72 h-full bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <X size={24} strokeWidth={3} className="relative z-10" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">Blueprint-X</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1.5">{t('documentation')}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1">{t('studio_canvas')}</h2>
            <div className="flex flex-col gap-2">
              <button onClick={() => addNode(NodeCardType.TABLE)} className="group flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 text-slate-700 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all text-sm font-semibold shadow-sm hover:shadow-md">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Plus size={16} /></div>
                {t('data_table')}
              </button>
              <button onClick={() => addNode(NodeCardType.LOGIC_NOTE)} className="group flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 text-slate-700 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all text-sm font-semibold shadow-sm hover:shadow-md">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors"><Plus size={16} /></div>
                {t('logic_node')}
              </button>
            </div>
          </section>

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
          defaultEdgeOptions={{ type: 'blueprintEdge' }}
        >
          <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={24} size={1} />
          <Controls position="bottom-right" />
        </ReactFlow>
        <Legend settings={settings} appearance={appearance} onUpdateAppearance={setAppearance} />
      </main>

      {editingNode && (
        <EditorModal 
          node={nodes.find(n => n.id === editingNode)!} 
          settings={settings}
          onClose={() => setEditingNode(null)}
          onSave={(data) => handleSaveNode(editingNode, data)}
          language={appearance.language}
        />
      )}

      {editingEdge && (
        <EdgeEditorModal
          edge={edges.find(e => e.id === editingEdge)!}
          settings={settings}
          onClose={() => setEditingEdge(null)}
          onSave={(data) => handleSaveEdge(editingEdge, data)}
          language={appearance.language}
        />
      )}

      {showSettings && (
        <SettingsModal 
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={setSettings}
          language={appearance.language}
        />
      )}

      {showGeneralSettings && (
        <GeneralSettingsModal 
          appearance={appearance}
          onClose={() => setShowGeneralSettings(false)}
          onSave={setAppearance}
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

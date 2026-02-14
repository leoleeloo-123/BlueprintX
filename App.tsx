import React, { useState, useCallback, useMemo } from 'react';
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
  Panel,
  MarkerType
} from 'reactflow';
import { Download, Upload, Plus, FileSpreadsheet, Layers, Settings2, Info, X } from 'lucide-react';
import * as XLSX from 'xlsx';

import { NodeCardType, NodeData } from './types.ts';
import { BlueprintCard } from './components/BlueprintCard.tsx';
import { BlueprintEdge } from './components/BlueprintEdge.tsx';
import { EditorModal } from './components/EditorModal.tsx';
import { EdgeEditorModal } from './components/EdgeEditorModal.tsx';

const nodeTypes = {
  blueprintNode: BlueprintCard,
};

const edgeTypes = {
  blueprintEdge: BlueprintEdge,
};

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'blueprintNode',
    position: { x: 50, y: 50 },
    data: { 
      label: 'Core Data Source', 
      cardType: NodeCardType.TABLE,
      columns: [
        { id: '1', name: 'Identity ID (PK)' },
        { id: '2', name: 'Value' },
        { id: '3', name: 'Category' },
        { id: '4', name: 'Timestamp' }
      ]
    },
  },
  {
    id: '2',
    type: 'blueprintNode',
    position: { x: 400, y: 50 },
    data: { 
      label: 'Auxiliary Ledger', 
      cardType: NodeCardType.TABLE,
      columns: [
        { id: '1', name: 'Reference ID (PK)' },
        { id: '2', name: 'Status Code' },
        { id: '3', name: 'Owner' }
      ]
    },
  },
  {
    id: '3',
    type: 'blueprintNode',
    position: { x: 225, y: 300 },
    data: { 
      label: 'Validation Logic', 
      cardType: NodeCardType.LOGIC_NOTE,
      description: 'Integrates source data with ledger references to ensure consistency and compute derived states.',
      bulletPoints: ['Match by Identity ID', 'Apply Transformation Rule #4', 'Flag Discrepancies']
    },
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-3', source: '1', target: '3', label: 'primary stream', type: 'blueprintEdge', markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', label: 'reference link', type: 'blueprintEdge', markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
];

function BlueprintStudio() {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'blueprintEdge',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
    }, eds)),
    []
  );

  const handleEditNode = useCallback((id: string) => {
    setEditingNode(id);
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, []);

  const handleEditEdge = useCallback((id: string) => {
    setEditingEdge(id);
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, []);

  const handleSaveNode = (id: string, updatedData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...updatedData } };
        }
        return node;
      })
    );
    setEditingNode(null);
  };

  const handleSaveEdge = (id: string, data: { label: string; hasArrow: boolean }) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return { 
            ...edge, 
            label: data.label,
            markerEnd: data.hasArrow ? { type: MarkerType.ArrowClosed, color: '#94a3b8' } : undefined
          };
        }
        return edge;
      })
    );
    setEditingEdge(null);
  };

  const addNode = (type: NodeCardType) => {
    const id = Date.now().toString();
    const newNode: Node<NodeData> = {
      id,
      type: 'blueprintNode',
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      data: { 
        label: `New ${type.toLowerCase().replace('_', ' ')}`, 
        cardType: type,
        columns: type === NodeCardType.TABLE ? [{ id: '1', name: 'New Field' }] : [],
        description: type === NodeCardType.LOGIC_NOTE ? 'Define logic here...' : '',
        bulletPoints: []
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const exportToExcel = () => {
    const nodesSheetData = nodes.map(n => ({
      ID: n.id,
      Label: n.data.label,
      Type: n.data.cardType,
      X: Math.round(n.position.x),
      Y: Math.round(n.position.y),
      Columns: n.data.columns?.map(c => c.name).join('|') || '',
      Description: n.data.description || '',
      Bullets: n.data.bulletPoints?.join('|') || ''
    }));

    const edgesSheetData = edges.map(e => ({
      ID: e.id,
      Source: e.source,
      Target: e.target,
      Label: e.label || '',
      HasArrow: e.markerEnd ? 'YES' : 'NO'
    }));

    const wb = XLSX.utils.book_new();
    const ns = XLSX.utils.json_to_sheet(nodesSheetData);
    const es = XLSX.utils.json_to_sheet(edgesSheetData);
    XLSX.utils.book_append_sheet(wb, ns, "Nodes");
    XLSX.utils.book_append_sheet(wb, es, "Edges");
    XLSX.writeFile(wb, "BlueprintX_Project.xlsx");
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      
      const workbook = XLSX.read(data, { type: 'binary' });
      const nodesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Nodes"]) as any[];
      const edgesRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Edges"]) as any[];

      const newNodes: Node<NodeData>[] = nodesRaw.map(n => ({
        id: String(n.ID),
        type: 'blueprintNode',
        position: { x: Number(n.X), y: Number(n.Y) },
        data: {
          label: n.Label,
          cardType: n.Type as NodeCardType,
          columns: n.Columns ? n.Columns.split('|').map((name: string, i: number) => ({ id: String(i), name })) : [],
          description: n.Description,
          bulletPoints: n.Bullets ? n.Bullets.split('|') : []
        }
      }));

      const newEdges: Edge[] = edgesRaw.map(e => ({
        id: String(e.ID),
        source: String(e.Source),
        target: String(e.Target),
        label: e.Label,
        type: 'blueprintEdge',
        markerEnd: e.HasArrow === 'YES' ? { type: MarkerType.ArrowClosed, color: '#94a3b8' } : undefined
      }));

      setNodes(newNodes);
      setEdges(newEdges);
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const nodesWithActions = useMemo(() => nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onEdit: handleEditNode,
      onDelete: handleDeleteNode,
    }
  })), [nodes, handleEditNode, handleDeleteNode]);

  const edgesWithActions = useMemo(() => edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      onEdit: handleEditEdge,
      onDelete: handleDeleteEdge,
    }
  })), [edges, handleEditEdge, handleDeleteEdge]);

  return (
    <div className="w-full h-full flex flex-row overflow-hidden bg-slate-50">
      <aside className="w-72 h-full bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Sleek Blueprint-X Sidebar Logo */}
        <div className="p-6 border-b border-slate-50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <X size={24} strokeWidth={3} className="relative z-10 animate-in zoom-in-50 duration-500" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">Blueprint-X</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1.5">Documentation</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1">Studio Canvas</h2>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => addNode(NodeCardType.TABLE)}
                className="group flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 text-slate-700 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
                Data Table
              </button>
              <button 
                onClick={() => addNode(NodeCardType.LOGIC_NOTE)}
                className="group flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 text-slate-700 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
                Logic Node
              </button>
              <button 
                onClick={() => addNode(NodeCardType.REPORT)}
                className="group flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 text-slate-700 rounded-xl hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
                Output Report
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1">Environment</h2>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors text-sm cursor-pointer rounded-lg hover:bg-slate-50">
                <Layers size={18} />
                <span>Auto-Align</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors text-sm cursor-pointer rounded-lg hover:bg-slate-50">
                <Settings2 size={18} />
                <span>Global Config</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors text-sm cursor-pointer rounded-lg hover:bg-slate-50">
                <Info size={18} />
                <span>Documentation</span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-50 flex flex-col gap-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold text-xs shadow-md shadow-slate-100"
          >
            <Download size={14} />
            Export Project
          </button>
          <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-xs cursor-pointer">
            <Upload size={14} />
            Import .xlsx
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={importFromExcel} />
          </label>
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
          className="bg-slate-50"
          defaultEdgeOptions={{ type: 'blueprintEdge' }}
        >
          <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={24} size={1} />
          <Controls position="bottom-right" />
          <Panel position="top-right" className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 flex flex-col gap-2 select-none min-w-[160px] m-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Workspace Metrics</span>
            <div className="grid grid-cols-2 gap-6 mt-1">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900">{nodes.length}</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Nodes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900">{edges.length}</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Links</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </main>

      {editingNode && (
        <EditorModal 
          node={nodes.find(n => n.id === editingNode)!} 
          onClose={() => setEditingNode(null)}
          onSave={(data) => handleSaveNode(editingNode, data)}
        />
      )}

      {editingEdge && (
        <EdgeEditorModal
          edge={edges.find(e => e.id === editingEdge)!}
          onClose={() => setEditingEdge(null)}
          onSave={(data) => handleSaveEdge(editingEdge, data)}
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
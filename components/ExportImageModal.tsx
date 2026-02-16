
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { X, Camera, Image as ImageIcon, FileImage, Layers, Layout, Monitor, Maximize, Check, Download, Loader2, Info, PackageOpen, RotateCcw } from 'lucide-react';
import { Node, Edge, ReactFlowProvider, ReactFlow, Background, BackgroundVariant, useReactFlow, ReactFlowInstance } from 'reactflow';
import { toPng, toJpeg } from 'html-to-image';
import { GlobalSettings, AppearanceSettings, NodeData, NodeCardType } from '../types.ts';
import { translations } from '../translations.ts';
import { BlueprintCard } from './BlueprintCard.tsx';
import { BlueprintEdge } from './BlueprintEdge.tsx';

interface ExportImageModalProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  settings: GlobalSettings;
  appearance: AppearanceSettings;
  activeTableFilters: string[];
  activeLogicFilters: string[];
  activeEdgeFilters: string[];
  activeTagFilters: string[];
  searchQuery: string;
  onClose: () => void;
}

const nodeTypes = { blueprintNode: BlueprintCard };
const edgeTypes = { blueprintEdge: BlueprintEdge };
const HIDE_ALL_VALUE = '__HIDE_ALL__';

// Internal component to access useReactFlow hook for the export-specific instance
const ExportFlowInternal = ({ nodes, edges, onInit }: { nodes: Node[], edges: Edge[], onInit: (instance: ReactFlowInstance) => void }) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      panOnDrag={false}
      onInit={onInit}
      style={{ width: '100%', height: '100%' }}
    >
      <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={24} size={1} />
    </ReactFlow>
  );
};

export const ExportImageModal: React.FC<ExportImageModalProps> = ({ 
  nodes, edges, settings, appearance, 
  activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters, searchQuery,
  onClose 
}) => {
  const [size, setSize] = useState<'A4' | 'Letter' | '16:9' | '4:3' | 'Auto'>('16:9');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [scope, setScope] = useState<'visible' | 'all'>('visible');
  const [legendMode, setLegendMode] = useState<'none' | 'collapsed' | 'expanded'>('expanded');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const t = (key: keyof typeof translations.en) => translations[appearance.language][key] || key;

  // Filtering Logic (replicated from App.tsx for consistent results)
  const isNodeVisible = useCallback((node: Node<NodeData>) => {
    const { data } = node;
    const isTable = data.cardType === NodeCardType.TABLE;
    const isLogic = data.cardType === NodeCardType.LOGIC_NOTE;

    // 1. Category Filters
    if (isTable && activeTableFilters.length > 0) {
      if (activeTableFilters.includes(HIDE_ALL_VALUE)) return false;
      if (data.categoryId && !activeTableFilters.includes(data.categoryId)) return false;
    }
    if (isLogic && activeLogicFilters.length > 0) {
      if (activeLogicFilters.includes(HIDE_ALL_VALUE)) return false;
      if (data.categoryId && !activeLogicFilters.includes(data.categoryId)) return false;
    }

    // 2. Tag Filters
    if (activeTagFilters.length > 0) {
      if (activeTagFilters.includes(HIDE_ALL_VALUE)) return false;
      const hasMatch = data.tags?.some(tagId => activeTagFilters.includes(tagId));
      if (!hasMatch) return false;
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesLabel = data.label.toLowerCase().includes(q);
      const matchesDesc = data.description?.toLowerCase().includes(q);
      const matchesFields = data.columns?.some(c => c.name.toLowerCase().includes(q));
      const matchesComment = data.comment?.toLowerCase().includes(q);
      const matchesTags = data.tags?.some(tid => {
        const tObj = settings.tags.find(tag => tag.id === tid);
        return tObj?.name.toLowerCase().includes(q);
      });

      if (!matchesLabel && !matchesDesc && !matchesFields && !matchesComment && !matchesTags) return false;
    }

    return true;
  }, [activeTableFilters, activeLogicFilters, activeTagFilters, searchQuery, settings.tags]);

  // Nodes with full data enrichment (crucial for card colors and correct rendering)
  const enrichedNodes = useMemo(() => {
    const sourceNodes = scope === 'visible' ? nodes.filter(isNodeVisible) : nodes;
    
    return sourceNodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        settings,
        appearance,
        activeTableFilters: scope === 'visible' ? activeTableFilters : [],
        activeLogicFilters: scope === 'visible' ? activeLogicFilters : [],
        activeEdgeFilters: scope === 'visible' ? activeEdgeFilters : [],
        activeTagFilters: scope === 'visible' ? activeTagFilters : []
      }
    }));
  }, [nodes, isNodeVisible, scope, settings, appearance, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters]);

  const enrichedEdges = useMemo(() => {
    return edges.filter(e => {
      return enrichedNodes.some(n => n.id === e.source) && enrichedNodes.some(n => n.id === e.target);
    }).map(e => ({
      ...e,
      data: {
        ...e.data,
        settings,
        activeTableFilters: scope === 'visible' ? activeTableFilters : [],
        activeLogicFilters: scope === 'visible' ? activeLogicFilters : [],
        activeEdgeFilters: scope === 'visible' ? activeEdgeFilters : [],
        activeTagFilters: scope === 'visible' ? activeTagFilters : []
      }
    }));
  }, [edges, enrichedNodes, settings, scope, activeTableFilters, activeLogicFilters, activeEdgeFilters, activeTagFilters]);

  const getExportSize = () => {
    if (size === 'A4') {
      return orientation === 'landscape' ? { width: 1123, height: 794 } : { width: 794, height: 1123 };
    }
    if (size === 'Letter') {
      return orientation === 'landscape' ? { width: 1056, height: 816 } : { width: 816, height: 1056 };
    }
    if (size === '16:9') return { width: 1920, height: 1080 };
    if (size === '4:3') return { width: 1600, height: 1200 };
    return { width: 1200, height: 800 }; // Auto default
  };

  const generatePreview = async () => {
    if (!exportRef.current) return;
    setIsGenerating(true);
    
    // Give React Flow a moment to settle if it just initialized
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const options = {
        backgroundColor: appearance.canvasBgColor,
        quality: 0.95,
        pixelRatio: 1, 
      };
      
      const dataUrl = format === 'png' 
        ? await toPng(exportRef.current, options)
        : await toJpeg(exportRef.current, options);
        
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate preview', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAlign = () => {
    if (rfInstance.current) {
      rfInstance.current.fitView({ padding: 0.2 });
      // Re-generate preview after alignment
      setTimeout(generatePreview, 100);
    }
  };

  useEffect(() => {
    const timer = setTimeout(generatePreview, 500);
    return () => clearTimeout(timer);
  }, [size, orientation, scope, legendMode, enrichedNodes, enrichedEdges, format]);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsGenerating(true);
    try {
      // Ensure it is aligned before final export
      if (rfInstance.current) {
        rfInstance.current.fitView({ padding: 0.2 });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const options = {
        backgroundColor: appearance.canvasBgColor,
        quality: 1,
        pixelRatio: 2, 
      };
      
      const dataUrl = format === 'png' 
        ? await toPng(exportRef.current, options)
        : await toJpeg(exportRef.current, options);
        
      const link = document.createElement('a');
      link.download = `whitebox-export-${new Date().getTime()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportDimensions = getExportSize();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Camera size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{t('export_image')}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('export_settings')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Settings Column */}
          <div className="w-80 bg-slate-50 border-r border-slate-100 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
            {/* Size & Orientation */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('output_size')}</label>
              <div className="grid grid-cols-2 gap-2">
                {['A4', 'Letter', '16:9', '4:3', 'Auto'].map((s: any) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${size === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl">
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${orientation === 'landscape' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  {t('landscape')}
                </button>
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${orientation === 'portrait' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  {t('portrait')}
                </button>
              </div>
            </div>

            {/* Scope */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('export_scope')}</label>
              <div className="space-y-2">
                {(['visible', 'all'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${scope === s ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500'}`}
                  >
                    <span className="text-xs font-bold">{t(s === 'visible' ? 'current_view' : 'full_canvas')}</span>
                    {scope === s && <Check size={14} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend Visibility */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('legend_visibility')}</label>
              <div className="flex flex-col gap-2">
                {(['none', 'collapsed', 'expanded'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLegendMode(mode)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${legendMode === mode ? 'bg-white border-slate-900 text-slate-900 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${legendMode === mode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    {t(mode === 'none' ? 'hide_all' : mode === 'collapsed' ? 'collapsed' : 'expanded')}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('format')}</label>
              <div className="flex gap-2">
                {['png', 'jpg'].map((f: any) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${format === f ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col gap-3">
               <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl">
                 <Info size={16} className="shrink-0" />
                 <p className="text-[10px] font-bold leading-tight">Image will be centered and tidied automatically for the best fit.</p>
               </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-slate-200/30 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-6 left-6 text-[10px] font-black text-slate-400 uppercase tracking-widest z-10 flex items-center gap-2">
               <Monitor size={14} /> {t('preview')}
            </div>

            {/* Auto-Align Button inside Preview Area */}
            <div className="absolute top-6 right-6 z-30">
               <button 
                onClick={handleManualAlign}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-full shadow-lg border border-slate-200 font-bold text-xs hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50"
                title={t('auto_align')}
               >
                 <Maximize size={16} strokeWidth={2.5} />
                 <span>{t('auto_align')}</span>
               </button>
            </div>

            <div className="relative shadow-2xl shadow-slate-400/20 bg-white group" style={{
              width: orientation === 'landscape' ? '85%' : '55%',
              aspectRatio: `${exportDimensions.width} / ${exportDimensions.height}`,
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
               {isGenerating && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-indigo-600 animate-in fade-in duration-300">
                    <Loader2 size={32} className="animate-spin mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Rendering...</span>
                 </div>
               )}
               
               {previewUrl ? (
                 <img src={previewUrl} className="w-full h-full object-contain" alt="Export Preview" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ImageIcon size={64} strokeWidth={1} />
                 </div>
               )}

               {/* Hidden Real Render Target */}
               <div className="fixed -left-[10000px] -top-[10000px] pointer-events-none overflow-hidden" style={{
                  width: exportDimensions.width,
                  height: exportDimensions.height,
               }}>
                  <div ref={exportRef} style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: appearance.canvasBgColor,
                    position: 'relative'
                  }}>
                    <ReactFlowProvider>
                      <ExportFlowInternal 
                        nodes={enrichedNodes} 
                        edges={enrichedEdges} 
                        onInit={(instance) => { rfInstance.current = instance; }}
                      />
                    </ReactFlowProvider>

                    {/* Watermark Overlay in Export */}
                    <div className="absolute bottom-10 left-10 flex items-center gap-3 opacity-30 select-none">
                       <PackageOpen size={32} strokeWidth={1.5} />
                       <div className="flex flex-col">
                          <span className="text-xl font-black text-slate-900 leading-none">WhiteBox</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Documentation Studio</span>
                       </div>
                    </div>

                    {/* Legend Overlay in Export */}
                    {legendMode !== 'none' && (
                      <div className={`absolute bottom-10 right-10 bg-white/90 border border-slate-200 rounded-2xl p-4 shadow-xl min-w-[180px]`}>
                         <div className="border-b border-slate-100 pb-2 mb-3">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('workspace_legend')}</span>
                         </div>
                         {legendMode === 'expanded' && (
                           <div className="space-y-4">
                             <div>
                               <span className="text-[8px] font-bold text-slate-300 uppercase block mb-1.5">{t('table_categories')}</span>
                               <div className="flex flex-col gap-1.5">
                                 {settings.tableCategories.slice(0, 4).map(c => (
                                   <div key={c.id} className="flex items-center gap-2">
                                     <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                                     <span className="text-[10px] font-semibold text-slate-600 truncate">{c.name}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>
                             <div>
                               <span className="text-[8px] font-bold text-slate-300 uppercase block mb-1.5">{t('logic_node_types')}</span>
                               <div className="flex flex-col gap-1.5">
                                 {settings.logicCategories.slice(0, 4).map(c => (
                                   <div key={c.id} className="flex items-center gap-2">
                                     <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                                     <span className="text-[10px] font-semibold text-slate-600 truncate">{c.name}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
             <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase tracking-widest">{t('format')}</span>
               <span className="text-xs font-bold text-slate-600 uppercase">{format} • {exportDimensions.width}x{exportDimensions.height}</span>
             </div>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-3 text-slate-400 text-sm font-black uppercase tracking-widest hover:text-slate-600 transition-colors">{t('cancel')}</button>
            <button 
              onClick={handleDownload} 
              disabled={isGenerating}
              className="px-12 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {t('download')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

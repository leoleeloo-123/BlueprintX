
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Edit3, Database, FileText, BarChart2, MessageCircle, Key } from 'lucide-react';
import { NodeData, NodeCardType, GlobalSettings } from '../types.ts';

const HEADER_SIZES = { sm: 'text-[10px]', md: 'text-[12px]', lg: 'text-[14px]' };
const CONTENT_SIZES = { sm: 'text-[10px]', md: 'text-[11px]', lg: 'text-[13px]' };
const HIDE_ALL_VALUE = '__HIDE_ALL__';

export const BlueprintCard = memo(({ data, id, selected }: NodeProps<NodeData & { settings: GlobalSettings }>) => {
  const isTable = data.cardType === NodeCardType.TABLE;
  const isLogic = data.cardType === NodeCardType.LOGIC_NOTE;
  
  // Resolve dynamic category color
  let headerColor = '#ea580c'; 
  if (isTable) {
    const category = data.settings?.tableCategories.find(c => c.id === data.categoryId);
    headerColor = category ? category.color : '#2563eb';
  } else if (isLogic) {
    const category = data.settings?.logicCategories.find(c => c.id === data.categoryId);
    headerColor = category ? category.color : '#9333ea';
  }

  const appearance = data.appearance;
  const headerFontSizeClass = HEADER_SIZES[appearance?.headerFontSize || 'sm'];
  const contentFontSizeClass = CONTENT_SIZES[appearance?.contentFontSize || 'sm'];

  // Filtering Logic
  let isFilteredOut = false;
  
  // Category Filtering
  if (isTable && data.activeTableFilter) {
    if (data.activeTableFilter === HIDE_ALL_VALUE || data.categoryId !== data.activeTableFilter) {
      isFilteredOut = true;
    }
  }
  if (isLogic && data.activeLogicFilter) {
    if (data.activeLogicFilter === HIDE_ALL_VALUE || data.categoryId !== data.activeLogicFilter) {
      isFilteredOut = true;
    }
  }

  // Tag Filtering
  if (data.activeTagFilter) {
    if (data.activeTagFilter === HIDE_ALL_VALUE) {
      isFilteredOut = true;
    } else if (!data.tags?.includes(data.activeTagFilter)) {
      isFilteredOut = true;
    }
  }
  
  const cardOpacityClass = isFilteredOut ? 'opacity-10 grayscale pointer-events-none' : 'opacity-100';

  const theme = {
    border: selected ? 'border-slate-900 ring-2 ring-slate-100' : 'border-slate-100',
    icon: isTable ? <Database size={14} /> : (isLogic ? <FileText size={14} /> : <BarChart2 size={14} />),
    accent: headerColor
  };

  const dataSourceName = isTable && data.dataSourceId 
    ? data.settings?.dataSources.find(s => s.id === data.dataSourceId)?.name 
    : null;

  const handleClasses = `!w-4 !h-4 !bg-slate-400 !border-2 !border-white shadow-sm transition-all duration-200 hover:scale-125 hover:!bg-blue-500 z-50 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;

  // Resolve Tag UI components as side tabs
  const tagIndicators = (data.tags || []).map(tagId => {
    const tag = data.settings?.tags.find(t => t.id === tagId);
    return tag ? (
      <div 
        key={tag.id} 
        className="w-4 h-6 rounded-l-md shadow-[-2px_1px_4px_rgba(0,0,0,0.1)] border-y border-l border-white/30" 
        style={{ backgroundColor: tag.color }}
        title={tag.name}
      />
    ) : null;
  });

  return (
    <div className={`group min-w-[220px] max-w-[320px] rounded-xl border shadow-sm transition-all duration-300 bg-white relative ${theme.border} ${cardOpacityClass}`}>
      {/* Visual Tag Tabs - Moved further down to align with content part and increased width */}
      <div className="absolute top-14 left-0 -translate-x-full flex flex-col gap-1.5 pointer-events-none z-10">
        {tagIndicators}
      </div>

      {/* Universal Handles */}
      <Handle type="target" position={Position.Top} id="t-t" className={handleClasses} />
      <Handle type="source" position={Position.Top} id="t-s" className={handleClasses} style={{ background: 'transparent', border: 'none' }} />
      <Handle type="target" position={Position.Bottom} id="b-t" className={handleClasses} />
      <Handle type="source" position={Position.Bottom} id="b-s" className={handleClasses} style={{ background: 'transparent', border: 'none' }} />
      <Handle type="target" position={Position.Left} id="l-t" className={handleClasses} />
      <Handle type="source" position={Position.Left} id="l-s" className={handleClasses} style={{ background: 'transparent', border: 'none' }} />
      <Handle type="target" position={Position.Right} id="r-t" className={handleClasses} />
      <Handle type="source" position={Position.Right} id="r-s" className={handleClasses} style={{ background: 'transparent', border: 'none' }} />

      <div style={{ backgroundColor: headerColor }} className="p-3 flex items-center justify-between text-white gap-3 transition-colors duration-300 rounded-t-xl relative">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-white/20 rounded backdrop-blur-sm flex-shrink-0">{theme.icon}</div>
          <h3 className={`font-bold truncate uppercase tracking-widest ${headerFontSizeClass}`}>{data.label}</h3>
        </div>
        {!isFilteredOut && (
          <div className="flex items-center gap-1.5 ml-2">
            <button onClick={() => data.onEdit?.(id)} className="p-1 hover:bg-white/20 rounded transition-colors"><Edit3 size={12} /></button>
            <button onClick={() => data.onDelete?.(id)} className="p-1 hover:bg-white/20 rounded transition-colors"><Trash2 size={12} /></button>
          </div>
        )}
      </div>

      <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar rounded-b-xl">
        {isTable && (
          <>
            {(dataSourceName || data.comment) && (
              <div className="mb-4 space-y-2 border-b border-slate-50 pb-3">
                {dataSourceName && (
                  <div className="flex items-center gap-2">
                    <Database size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dataSourceName}</span>
                  </div>
                )}
                {data.comment && (
                  <div className="flex gap-2">
                    <MessageCircle size={12} className="text-slate-400 mt-0.5 shrink-0" />
                    <p className={`text-slate-500 italic ${contentFontSizeClass}`}>{data.comment}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              {data.columns?.map(col => {
                const fType = data.settings?.fieldTypes.find(ft => ft.id === col.typeId);
                return (
                  <div key={col.id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded-md transition-colors group/row">
                    <div className="flex-shrink-0 flex items-center justify-center">
                      {col.isKey ? (
                        <Key size={10} className="text-amber-500" />
                      ) : (
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: headerColor }} />
                      )}
                    </div>
                    <span className={`text-slate-600 font-bold uppercase tracking-tight flex-1 truncate ${contentFontSizeClass} ${col.isKey ? 'text-slate-900' : ''}`}>
                      {col.name}
                    </span>
                    {fType && (
                      <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full uppercase tracking-tighter shrink-0">
                        {fType.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {isLogic && (
          <div className="space-y-3">
            <p className={`text-slate-500 leading-relaxed font-medium ${contentFontSizeClass}`}>{data.description}</p>
            {data.bulletPoints?.map((p, idx) => (
              <div key={idx} className="flex gap-2 text-slate-600">
                <span style={{ color: headerColor }}>•</span>
                <span className={contentFontSizeClass}>{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});


import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Edit3, Database, FileText, BarChart2, MessageCircle, Key } from 'lucide-react';
import { NodeData, NodeCardType, GlobalSettings } from '../types.ts';

const HEADER_SIZES = { sm: 'text-[10px]', md: 'text-[12px]', lg: 'text-[14px]' };
const CONTENT_SIZES = { sm: 'text-[10px]', md: 'text-[11px]', lg: 'text-[13px]' };

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

  const theme = {
    border: selected ? 'border-slate-900 ring-2 ring-slate-100' : 'border-slate-100',
    icon: isTable ? <Database size={14} /> : (isLogic ? <FileText size={14} /> : <BarChart2 size={14} />),
    accent: headerColor
  };

  const dataSourceName = isTable && data.dataSourceId 
    ? data.settings?.dataSources.find(s => s.id === data.dataSourceId)?.name 
    : null;

  return (
    <div className={`min-w-[220px] max-w-[320px] rounded-xl overflow-hidden border shadow-sm transition-all duration-200 bg-white ${theme.border}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />

      <div style={{ backgroundColor: headerColor }} className="p-3 flex items-center justify-between text-white gap-3 transition-colors duration-300">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-white/20 rounded backdrop-blur-sm flex-shrink-0">{theme.icon}</div>
          <h3 className={`font-bold truncate uppercase tracking-widest ${headerFontSizeClass}`}>{data.label}</h3>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <button onClick={() => data.onEdit?.(id)} className="p-1 hover:bg-white/20 rounded transition-colors"><Edit3 size={12} /></button>
          <button onClick={() => data.onDelete?.(id)} className="p-1 hover:bg-white/20 rounded transition-colors"><Trash2 size={12} /></button>
        </div>
      </div>

      <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
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
                  <div key={col.id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded-md transition-colors group">
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

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Edit3, Database, FileText, BarChart2 } from 'lucide-react';
import { NodeData, NodeCardType, GlobalSettings, FontSizeScale } from '../types.ts';

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
        {isTable ? (
          <div className="flex flex-col gap-1.5">
            {data.columns?.map(col => (
              <div key={col.id} className="flex items-center gap-3 py-1.5 px-2 hover:bg-slate-50 rounded-md transition-colors">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: headerColor }} />
                <span className={`text-slate-600 font-bold uppercase tracking-tight ${contentFontSizeClass}`}>{col.name}</span>
              </div>
            ))}
          </div>
        ) : (
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

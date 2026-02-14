
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Edit3, Database, FileText, BarChart2 } from 'lucide-react';
import { NodeData, NodeCardType, GlobalSettings } from '../types.ts';

export const BlueprintCard = memo(({ data, id, selected }: NodeProps<NodeData & { settings: GlobalSettings }>) => {
  const isTable = data.cardType === NodeCardType.TABLE;
  const isLogic = data.cardType === NodeCardType.LOGIC_NOTE;
  
  // Resolve dynamic category color
  let headerColor = '#ea580c'; // Default for reports
  if (isTable) {
    const category = data.settings?.tableCategories.find(c => c.id === data.categoryId);
    headerColor = category ? category.color : '#2563eb';
  } else if (isLogic) {
    const category = data.settings?.logicCategories.find(c => c.id === data.categoryId);
    headerColor = category ? category.color : '#9333ea';
  }

  const getTheme = () => {
    const baseIcon = isTable ? <Database size={14} /> : (isLogic ? <FileText size={14} /> : <BarChart2 size={14} />);
    return {
      border: selected ? 'border-slate-900 ring-2 ring-slate-100' : 'border-slate-100',
      icon: baseIcon,
      accent: headerColor
    };
  };

  const theme = getTheme();

  return (
    <div className={`min-w-[220px] max-w-[320px] rounded-xl overflow-hidden border shadow-sm transition-all duration-200 bg-white ${theme.border}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />

      <div style={{ backgroundColor: headerColor }} className="p-3 flex items-center justify-between text-white gap-3 transition-colors duration-300">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-white/20 rounded backdrop-blur-sm flex-shrink-0">{theme.icon}</div>
          <h3 className="font-bold text-xs truncate uppercase tracking-widest">{data.label}</h3>
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
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: headerColor }} />
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{col.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{data.description}</p>
            {data.bulletPoints?.map((p, idx) => (
              <div key={idx} className="flex gap-2 text-[10px] text-slate-600">
                <span style={{ color: headerColor }}>•</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

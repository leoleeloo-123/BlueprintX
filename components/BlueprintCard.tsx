
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Edit3, Database, FileText, BarChart2 } from 'lucide-react';
import { NodeData, NodeCardType } from '../types';

export const BlueprintCard = memo(({ data, id, selected }: NodeProps<NodeData>) => {
  const isTable = data.cardType === NodeCardType.TABLE;
  const isLogic = data.cardType === NodeCardType.LOGIC_NOTE;
  const isReport = data.cardType === NodeCardType.REPORT;

  const getTheme = () => {
    switch (data.cardType) {
      case NodeCardType.TABLE:
        return {
          header: 'bg-blue-600',
          body: 'bg-white',
          border: selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-100',
          icon: <Database size={14} className="text-white" />,
          accent: 'text-blue-600'
        };
      case NodeCardType.LOGIC_NOTE:
        return {
          header: 'bg-purple-600',
          body: 'bg-white',
          border: selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-100',
          icon: <FileText size={14} className="text-white" />,
          accent: 'text-purple-600'
        };
      default:
        return {
          header: 'bg-orange-600',
          body: 'bg-white',
          border: selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-orange-100',
          icon: <BarChart2 size={14} className="text-white" />,
          accent: 'text-orange-600'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`min-w-[220px] max-w-[320px] rounded-xl overflow-hidden border shadow-sm transition-all duration-200 ${theme.border}`}>
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="!w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3" />
      <Handle type="target" position={Position.Top} className="!w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3" />

      {/* Header */}
      <div className={`${theme.header} p-3 flex items-center justify-between text-white gap-3`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-white/20 rounded backdrop-blur-sm flex-shrink-0">
            {theme.icon}
          </div>
          <h3 className="font-semibold text-sm truncate uppercase tracking-wider">{data.label}</h3>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <button 
            onClick={() => data.onEdit?.(id)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
          >
            <Edit3 size={12} />
          </button>
          <button 
            onClick={() => data.onDelete?.(id)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors text-white/80 hover:text-white"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className={`p-4 ${theme.body} max-h-[400px] overflow-y-auto custom-scrollbar`}>
        {isTable && (
          <div className="flex flex-col gap-1.5">
            {data.columns && data.columns.length > 0 ? (
              data.columns.map((col) => (
                <div key={col.id} className="flex items-center gap-3 py-1.5 px-2 hover:bg-slate-50 rounded-md group transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full ${theme.accent.replace('text', 'bg')}`} />
                  <span className="text-xs text-slate-600 font-medium">{col.name}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No columns defined</span>
            )}
          </div>
        )}

        {(isLogic || isReport) && (
          <div className="flex flex-col gap-3">
            {data.description && (
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {data.description}
              </p>
            )}
            {data.bulletPoints && data.bulletPoints.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {data.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-600">
                    <span className={theme.accent}>•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {!data.description && (!data.bulletPoints || data.bulletPoints.length === 0) && (
              <span className="text-xs text-slate-400 italic">No content defined</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

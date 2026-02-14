
import React from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { Edit3, Trash2 } from 'lucide-react';
import { GlobalSettings } from '../types.ts';

export const BlueprintEdge = ({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  style = {}, markerEnd, label, selected, data
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  
  const settings: GlobalSettings = data.settings;
  const connType = settings?.connectionTypes.find(t => t.id === data.typeId);

  const finalStroke = connType?.color || '#94a3b8';
  const finalWidth = connType?.width || 2;
  const dashArray = connType?.dashStyle === 'dashed' ? '5,5' : connType?.dashStyle === 'dotted' ? '2,2' : undefined;

  // Filtering Logic for Edges
  // If a filter is active, and EITHER the source OR target node doesn't match the filter, fade the edge.
  const isFiltered = data.activeCategoryFilter && 
                     (data.sourceCategoryId !== data.activeCategoryFilter || 
                      data.targetCategoryId !== data.activeCategoryFilter);
  
  const edgeOpacity = isFiltered ? 0.1 : 1;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
        ...style,
        strokeWidth: selected ? finalWidth + 1 : finalWidth,
        stroke: selected ? '#3b82f6' : finalStroke,
        strokeDasharray: dashArray,
        opacity: edgeOpacity,
        transition: 'all 0.3s'
      }} />
      <EdgeLabelRenderer>
        <div style={{ 
          position: 'absolute', 
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, 
          pointerEvents: 'all',
          opacity: edgeOpacity,
          transition: 'opacity 0.3s'
        }} className="nodrag nopan">
          <div className="flex flex-col items-center gap-1">
            {label && (
              <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200 text-[9px] font-black text-slate-600 shadow-sm uppercase tracking-tighter">
                {label}
              </div>
            )}
            {selected && !isFiltered && (
              <div className="flex items-center gap-1 bg-white shadow-lg border border-slate-200 rounded-full p-1 animate-in zoom-in-75 duration-200">
                <button className="p-1 hover:bg-blue-50 text-blue-600 rounded-full" onClick={(e) => { e.stopPropagation(); data.onEdit?.(id); }}><Edit3 size={12} /></button>
                <div className="w-px h-3 bg-slate-100" />
                <button className="p-1 hover:bg-red-50 text-red-500 rounded-full" onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }}><Trash2 size={12} /></button>
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

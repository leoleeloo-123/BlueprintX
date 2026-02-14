
import React from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { Edit3, Trash2 } from 'lucide-react';
import { GlobalSettings } from '../types.ts';

const HIDE_ALL_VALUE = '__HIDE_ALL__';

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
  let isFilteredOut = false;
  
  // 1. Check specific edge filter
  if (data.activeEdgeFilter) {
    if (data.activeEdgeFilter === HIDE_ALL_VALUE || data.typeId !== data.activeEdgeFilter) {
      isFilteredOut = true;
    }
  }
  
  // 2. Check if either source or target node is filtered by Table/Logic filters
  if (data.activeTableFilter) {
    if (data.activeTableFilter === HIDE_ALL_VALUE) {
       isFilteredOut = true;
    } else if (data.sourceCategoryId !== data.activeTableFilter || data.targetCategoryId !== data.activeTableFilter) {
       isFilteredOut = true;
    }
  }
  
  if (data.activeLogicFilter) {
    if (data.activeLogicFilter === HIDE_ALL_VALUE) {
      isFilteredOut = true;
    } else if (data.sourceCategoryId !== data.activeLogicFilter || data.targetCategoryId !== data.activeLogicFilter) {
      isFilteredOut = true;
    }
  }

  // 3. Check Tag Filter
  if (data.activeTagFilter) {
    if (data.activeTagFilter === HIDE_ALL_VALUE) {
      isFilteredOut = true;
    } else {
      // Show edge only if BOTH source and target have the selected tag
      const sourceHasTag = data.sourceTags?.includes(data.activeTagFilter);
      const targetHasTag = data.targetTags?.includes(data.activeTagFilter);
      if (!sourceHasTag || !targetHasTag) {
        isFilteredOut = true;
      }
    }
  }
  
  const edgeOpacity = isFilteredOut ? 0.05 : 1;

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
            {selected && !isFilteredOut && (
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

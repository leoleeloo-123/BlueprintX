
import React from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge, Position } from 'reactflow';
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

  let finalLabelX = labelX;
  let finalLabelY = labelY;
  let labelTransform = 'translate(-50%, -50%)';

  const GAP = 12;

  if (connType?.labelPosition === 'source') {
    if (sourcePosition === Position.Right) {
      finalLabelX = sourceX + GAP;
      finalLabelY = sourceY;
      labelTransform = 'translate(0, -50%)';
    } else if (sourcePosition === Position.Left) {
      finalLabelX = sourceX - GAP;
      finalLabelY = sourceY;
      labelTransform = 'translate(-100%, -50%)';
    } else if (sourcePosition === Position.Top) {
      finalLabelX = sourceX;
      finalLabelY = sourceY - GAP;
      labelTransform = 'translate(-50%, -100%)';
    } else if (sourcePosition === Position.Bottom) {
      finalLabelX = sourceX;
      finalLabelY = sourceY + GAP;
      labelTransform = 'translate(-50%, 0)';
    }
  } else if (connType?.labelPosition === 'target') {
    if (targetPosition === Position.Right) {
      finalLabelX = targetX + GAP;
      finalLabelY = targetY;
      labelTransform = 'translate(0, -50%)';
    } else if (targetPosition === Position.Left) {
      finalLabelX = targetX - GAP;
      finalLabelY = targetY;
      labelTransform = 'translate(-100%, -50%)';
    } else if (targetPosition === Position.Top) {
      finalLabelX = targetX;
      finalLabelY = targetY - GAP;
      labelTransform = 'translate(-50%, -100%)';
    } else if (targetPosition === Position.Bottom) {
      finalLabelX = targetX;
      finalLabelY = targetY + GAP;
      labelTransform = 'translate(-50%, 0)';
    }
  } else {
    labelTransform = `translate(-50%, -50%) translate(${finalLabelX}px,${finalLabelY}px)`;
  }

  const finalTransform = connType?.labelPosition && connType.labelPosition !== 'center'
    ? `translate(${finalLabelX}px,${finalLabelY}px) ${labelTransform}`
    : labelTransform;

  // Filtering Logic for Edges - Multi
  let isFilteredOut = false;
  
  if (data.activeEdgeFilters && data.activeEdgeFilters.length > 0) {
    if (data.activeEdgeFilters.includes(HIDE_ALL_VALUE) || (data.typeId && !data.activeEdgeFilters.includes(data.typeId))) {
      isFilteredOut = true;
    }
  }
  
  // Node-based filtering for edges
  const tableFilters = data.activeTableFilters || [];
  const logicFilters = data.activeLogicFilters || [];
  const tagFilters = data.activeTagFilters || [];

  const isSourceFilteredOut = () => {
    // Check table category
    if (tableFilters.includes(HIDE_ALL_VALUE)) return true;
    if (tableFilters.length > 0 && data.sourceCategoryId && !tableFilters.includes(data.sourceCategoryId)) return true;
    
    // Check logic category
    if (logicFilters.includes(HIDE_ALL_VALUE)) return true;
    if (logicFilters.length > 0 && data.sourceCategoryId && !logicFilters.includes(data.sourceCategoryId)) return true;

    // Check tags
    if (tagFilters.includes(HIDE_ALL_VALUE)) return true;
    if (tagFilters.length > 0) {
      const hasMatch = data.sourceTags?.some((t: string) => tagFilters.includes(t));
      if (!hasMatch) return true;
    }
    return false;
  };

  const isTargetFilteredOut = () => {
    // Check table category
    if (tableFilters.includes(HIDE_ALL_VALUE)) return true;
    if (tableFilters.length > 0 && data.targetCategoryId && !tableFilters.includes(data.targetCategoryId)) return true;
    
    // Check logic category
    if (logicFilters.includes(HIDE_ALL_VALUE)) return true;
    if (logicFilters.length > 0 && data.targetCategoryId && !logicFilters.includes(data.targetCategoryId)) return true;

    // Check tags
    if (tagFilters.includes(HIDE_ALL_VALUE)) return true;
    if (tagFilters.length > 0) {
      const hasMatch = data.targetTags?.some((t: string) => tagFilters.includes(t));
      if (!hasMatch) return true;
    }
    return false;
  };

  if (isSourceFilteredOut() || isTargetFilteredOut()) {
    isFilteredOut = true;
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
          transform: finalTransform,
          pointerEvents: 'all',
          opacity: edgeOpacity,
          zIndex: 1000,
          transition: 'opacity 0.3s'
        }} className="nodrag nopan">
          <div className="flex flex-col items-center gap-1">
            {label && (
              <div 
                className="bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200 text-[9px] font-black text-slate-600 shadow-sm uppercase tracking-tighter"
                style={{ 
                  maxWidth: connType?.labelMaxWidth ? `${connType.labelMaxWidth}px` : '150px',
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  wordBreak: 'break-word'
                }}
              >
                {label}
              </div>
            )}
            {selected && !isFilteredOut && (
              <div className="flex items-center gap-1 bg-white shadow-lg border border-slate-200 rounded-full p-1 animate-in zoom-in-75 duration-200 mt-1">
                <button className="p-1 hover:bg-blue-50 text-blue-600 rounded-full" onClick={(e) => { e.stopPropagation(); data.onEdit?.(id); }} title="Edit Edge"><Edit3 size={12} /></button>
                <div className="w-px h-3 bg-slate-100" />
                <button className="p-1 hover:bg-red-50 text-red-500 rounded-full" onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }} title="Delete Edge"><Trash2 size={12} /></button>
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

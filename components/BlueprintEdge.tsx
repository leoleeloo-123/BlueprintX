
import React from 'react';
import { 
  EdgeProps, 
  getSmoothStepPath, 
  EdgeLabelRenderer, 
  BaseEdge 
} from 'reactflow';
import { Edit3, Trash2 } from 'lucide-react';

/* Removed unused getEdgeCenter import which was causing a module export error */
export const BlueprintEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Access functions passed through data for interaction
  const onEdit = (data as any)?.onEdit;
  const onDelete = (data as any)?.onDelete;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
        ...style,
        strokeWidth: selected ? 3 : 2,
        stroke: selected ? '#3b82f6' : '#94a3b8',
        transition: 'all 0.2s'
      }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="flex flex-col items-center gap-1 group">
            {label && (
              <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-600 shadow-sm max-w-[120px] truncate">
                {label}
              </div>
            )}
            
            {selected && (
              <div className="flex items-center gap-1 bg-white shadow-lg border border-slate-200 rounded-full p-1 animate-in zoom-in-75 duration-200">
                <button
                  className="p-1 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit?.(id);
                  }}
                  title="Edit mapping"
                >
                  <Edit3 size={12} />
                </button>
                <div className="w-px h-3 bg-slate-100" />
                <button
                  className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete?.(id);
                  }}
                  title="Delete mapping"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

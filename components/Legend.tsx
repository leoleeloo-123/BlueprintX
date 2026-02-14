
import React from 'react';
import { GlobalSettings } from '../types.ts';

export const Legend: React.FC<{ settings: GlobalSettings }> = ({ settings }) => {
  return (
    <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl shadow-slate-200/50 min-w-[200px] select-none pointer-events-none">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Workspace Legend</h4>
      
      <div className="space-y-5">
        <div>
          <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Table Categories</span>
          <div className="flex flex-col gap-2">
            {settings.tableCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: cat.color }} />
                <span className="text-[11px] font-semibold text-slate-600 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Link Properties</span>
          <div className="flex flex-col gap-2.5">
            {settings.connectionTypes.map(conn => (
              <div key={conn.id} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-px border-t" style={{ 
                  borderColor: conn.color, 
                  borderWidth: conn.width, 
                  borderStyle: conn.dashStyle === 'dashed' ? 'dashed' : conn.dashStyle === 'dotted' ? 'dotted' : 'solid'
                }} />
                <span className="text-[11px] font-semibold text-slate-600 truncate">{conn.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

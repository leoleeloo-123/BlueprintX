
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlobalSettings, AppearanceSettings } from '../types.ts';
import { translations } from '../translations.ts';

interface LegendProps {
  settings: GlobalSettings;
  appearance: AppearanceSettings;
  onUpdateAppearance: (settings: AppearanceSettings) => void;
}

export const Legend: React.FC<LegendProps> = ({ settings, appearance, onUpdateAppearance }) => {
  const t = (key: keyof typeof translations.en) => translations[appearance.language][key] || key;
  const isExpanded = appearance.isLegendExpanded;

  const toggleLegend = () => {
    onUpdateAppearance({
      ...appearance,
      isLegendExpanded: !isExpanded
    });
  };

  return (
    <div className={`absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl shadow-slate-200/50 min-w-[200px] select-none pointer-events-auto transition-all duration-300`}>
      <div className={`flex items-center justify-between gap-4 ${isExpanded ? 'mb-4 border-b border-slate-100 pb-2' : ''}`}>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {t('workspace_legend')}
        </h4>
        <button 
          onClick={toggleLegend}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div>
            <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2">{t('table_categories')}</span>
            <div className="flex flex-col gap-2">
              {settings.tableCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shadow-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] font-semibold text-slate-600 truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2">{t('logic_node_types')}</span>
            <div className="flex flex-col gap-2">
              {settings.logicCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shadow-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] font-semibold text-slate-600 truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2">{t('link_properties')}</span>
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
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, Link2, Type, ArrowRight, Activity } from 'lucide-react';
import { Edge } from 'reactflow';
import { GlobalSettings } from '../types.ts';
import { translations } from '../translations.ts';

interface EdgeEditorModalProps {
  edge: Edge;
  settings: GlobalSettings;
  onClose: () => void;
  onSave: (data: { typeId: string; label: string; hasArrow: boolean }) => void;
  language: 'en' | 'zh';
}

export const EdgeEditorModal: React.FC<EdgeEditorModalProps> = ({ edge, settings, onClose, onSave, language }) => {
  const [label, setLabel] = useState(edge.label?.toString() || '');
  const [typeId, setTypeId] = useState(edge.data?.typeId || settings.connectionTypes[0].id);
  const [hasArrow, setHasArrow] = useState(edge.markerEnd !== undefined);

  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{t('edge_properties')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Activity size={10} /> {t('link_classification')}</label>
            <select value={typeId} onChange={e => setTypeId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
              {settings.connectionTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Type size={10} /> {t('label_text')}</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="..." />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm"><ArrowRight size={16} className="text-slate-600" /></div>
              <div><span className="text-xs font-bold text-slate-700 uppercase">{t('arrow_indicator')}</span><p className="text-[10px] text-slate-400 font-medium">{t('render_directional_flow')}</p></div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={hasArrow} onChange={e => setHasArrow(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 text-sm font-bold">{t('cancel')}</button>
          <button onClick={() => onSave({ typeId, label, hasArrow })} className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200">{t('commit_update')}</button>
        </div>
      </div>
    </div>
  );
};

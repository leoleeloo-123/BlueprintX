
import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { Node } from 'reactflow';
import { NodeData, NodeCardType, TableColumn, GlobalSettings } from '../types.ts';
import { translations } from '../translations.ts';

interface EditorModalProps {
  node: Node<NodeData>;
  settings: GlobalSettings;
  onClose: () => void;
  onSave: (data: Partial<NodeData>) => void;
  language: 'en' | 'zh';
}

export const EditorModal: React.FC<EditorModalProps> = ({ node, settings, onClose, onSave, language }) => {
  const [label, setLabel] = useState(node.data.label);
  const [cardType, setCardType] = useState<NodeCardType>(node.data.cardType);
  
  const initialCatId = node.data.categoryId || (
    cardType === NodeCardType.TABLE 
      ? (settings.tableCategories.find(c => c.isDefault) || settings.tableCategories[0]).id
      : (settings.logicCategories.find(c => c.isDefault) || settings.logicCategories[0]).id
  );
  
  const [categoryId, setCategoryId] = useState(initialCatId);
  const [columns, setColumns] = useState<TableColumn[]>(node.data.columns || []);
  const [description, setDescription] = useState(node.data.description || '');
  const [bulletPoints, setBulletPoints] = useState<string[]>(node.data.bulletPoints || []);

  const isTable = cardType === NodeCardType.TABLE;
  const isLogic = cardType === NodeCardType.LOGIC_NOTE;

  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{t('node_properties')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('component_identity')}</label>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            {(isTable || isLogic) && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Tag size={10} /> {t('category')}</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
                  {isTable ? (
                    settings.tableCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  ) : (
                    settings.logicCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            {isTable ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-700">{t('fields_schema')}</span><button onClick={() => setColumns([...columns, { id: Date.now().toString(), name: 'New Field' }])} className="text-xs font-bold text-blue-600 flex items-center gap-1"><Plus size={14} /> {t('add_field')}</button></div>
                <div className="space-y-2">
                  {columns.map(col => (
                    <div key={col.id} className="flex gap-2">
                      <input type="text" value={col.name} onChange={e => setColumns(columns.map(c => c.id === col.id ? { ...c, name: e.target.value } : c))} className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-tight" />
                      <button onClick={() => setColumns(columns.filter(c => c.id !== col.id))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">{t('internal_logic')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" /></div>
                <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-700">{t('directives')}</span><button onClick={() => setBulletPoints([...bulletPoints, 'New Point'])} className="text-xs font-bold text-purple-600 flex items-center gap-1"><Plus size={14} /> {t('add_point')}</button></div>
                {bulletPoints.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={p} onChange={e => { const b = [...bulletPoints]; b[idx] = e.target.value; setBulletPoints(b); }} className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                    <button onClick={() => setBulletPoints(bulletPoints.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 text-sm font-bold">{t('cancel')}</button>
          <button onClick={() => onSave({ label, categoryId, columns, description, bulletPoints })} className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">{t('commit_update')}</button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Tag as TagIcon, Database, MessageSquare, Key, GripVertical } from 'lucide-react';
import { Node } from 'reactflow';
import { NodeData, NodeCardType, TableColumn, GlobalSettings, Tag } from '../types.ts';
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
  const [comment, setComment] = useState(node.data.comment || '');
  const [dataSourceId, setDataSourceId] = useState(node.data.dataSourceId || '');
  const [assignedTags, setAssignedTags] = useState<string[]>(node.data.tags || []);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isTable = cardType === NodeCardType.TABLE;
  const isLogic = cardType === NodeCardType.LOGIC_NOTE;

  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  const toggleTag = (tagId: string) => {
    setAssignedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // Reordering Logic for Tables
  const handleColumnDragStart = (idx: number) => setDraggedIndex(idx);
  const handleColumnDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    
    const newColumns = [...columns];
    const item = newColumns.splice(draggedIndex, 1)[0];
    newColumns.splice(targetIdx, 0, item);
    
    setColumns(newColumns);
    setDraggedIndex(targetIdx);
  };

  // Reordering Logic for Bullet Points
  const handleBulletDragStart = (idx: number) => setDraggedIndex(idx);
  const handleBulletDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    
    const newBullets = [...bulletPoints];
    const item = newBullets.splice(draggedIndex, 1)[0];
    newBullets.splice(targetIdx, 0, item);
    
    setBulletPoints(newBullets);
    setDraggedIndex(targetIdx);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const handleAddField = () => {
    const defaultType = settings.fieldTypes.find(ft => ft.name.toLowerCase() === 'text' || ft.id === 'ft-text') || settings.fieldTypes[0];
    setColumns([...columns, { 
      id: Date.now().toString(), 
      name: 'New Field', 
      isKey: false,
      typeId: defaultType?.id 
    }]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{t('node_properties')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('component_identity')}</label>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">{t('category')}</label>
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
          </div>

          {/* Tags Assignment */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <TagIcon size={10} /> {t('assign_tags')}
            </label>
            <div className="flex flex-wrap gap-2">
              {(settings.tags || []).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                    assignedTags.includes(tag.id) 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
              {(settings.tags || []).length === 0 && (
                <span className="text-xs italic text-slate-400">{t('none')}</span>
              )}
            </div>
          </div>

          {isTable && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Database size={10} /> {t('data_source')}</label>
                <select value={dataSourceId} onChange={e => setDataSourceId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">{t('select_source')}</option>
                  {settings.dataSources.map(src => (
                    <option key={src.id} value={src.id}>{src.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MessageSquare size={10} /> {t('comment')}</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder={t('comment')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100">
            {isTable ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{t('fields_schema')}</span>
                </div>
                <div className="space-y-3">
                  {columns.map((col, idx) => (
                    <div 
                      key={col.id} 
                      draggable 
                      onDragStart={() => handleColumnDragStart(idx)}
                      onDragOver={(e) => handleColumnDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-wrap items-center gap-2 p-3 border rounded-xl group transition-all cursor-move ${draggedIndex === idx ? 'bg-blue-50 border-blue-200 opacity-50' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-sm'}`}
                    >
                      <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                        <GripVertical size={16} />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <input type="text" value={col.name} onChange={e => setColumns(columns.map(c => c.id === col.id ? { ...c, name: e.target.value } : c))} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold tracking-tight focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="w-32">
                        <select value={col.typeId || ''} onChange={e => setColumns(columns.map(c => c.id === col.id ? { ...c, typeId: e.target.value || undefined } : c))} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">{t('none')}</option>
                          {settings.fieldTypes.map(ft => (
                            <option key={ft.id} value={ft.id}>{ft.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg">
                        <input type="checkbox" id={`key-${col.id}`} checked={col.isKey} onChange={e => setColumns(columns.map(c => c.id === col.id ? { ...c, isKey: e.target.checked } : c))} className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500" />
                        <label htmlFor={`key-${col.id}`} className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer select-none">
                          <Key size={10} className={col.isKey ? 'text-amber-500' : 'text-slate-300'} />
                          {t('key_field')}
                        </label>
                      </div>
                      <button onClick={() => setColumns(columns.filter(c => c.id !== col.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  
                  {/* Add Field Button at the Bottom */}
                  <button 
                    onClick={handleAddField} 
                    className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                  >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    {t('add_field')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">{t('internal_logic')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-700">{t('directives')}</span></div>
                <div className="space-y-2">
                  {bulletPoints.map((p, idx) => (
                    <div 
                      key={idx} 
                      draggable
                      onDragStart={() => handleBulletDragStart(idx)}
                      onDragOver={(e) => handleBulletDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`flex gap-2 items-center p-2 border rounded-xl transition-all cursor-move ${draggedIndex === idx ? 'bg-purple-50 border-purple-200 opacity-50' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
                    >
                      <div className="text-slate-300 group-hover:text-slate-500">
                        <GripVertical size={14} />
                      </div>
                      <input type="text" value={p} onChange={e => { const b = [...bulletPoints]; b[idx] = e.target.value; setBulletPoints(b); }} className="flex-1 px-3 py-1.5 bg-transparent border-0 focus:ring-0 text-xs" />
                      <button onClick={() => setBulletPoints(bulletPoints.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  
                  {/* Add Point Button at the Bottom */}
                  <button 
                    onClick={() => setBulletPoints([...bulletPoints, 'New Point'])} 
                    className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-purple-600 hover:bg-purple-50 hover:border-purple-200 transition-all group"
                  >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    {t('add_point')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 text-sm font-bold">{t('cancel')}</button>
          <button onClick={() => onSave({ label, categoryId, columns, description, bulletPoints, comment, dataSourceId, tags: assignedTags })} className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">{t('commit_update')}</button>
        </div>
      </div>
    </div>
  );
};
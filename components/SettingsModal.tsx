
import React, { useState } from 'react';
import { X, Plus, Trash2, Palette, Link2, Layout, FileText, Database, Type, Tag as TagIcon, AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { GlobalSettings, TableCategory, ConnectionType, LogicCategory, DataSource, FieldType, Tag, LabelPosition } from '../types.ts';
import { translations } from '../translations.ts';

interface SettingsModalProps {
  settings: GlobalSettings;
  onClose: () => void;
  onSave: (settings: GlobalSettings) => void;
  language: 'en' | 'zh';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSave, language }) => {
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings);
  const [activeTab, setActiveTab] = useState<'tables' | 'logic' | 'edges' | 'tags'>('tables');

  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  const addTableCategory = () => {
    const newCat: TableCategory = {
      id: `cat-${Date.now()}`,
      name: t('new_table_category'),
      color: '#3b82f6'
    };
    setLocalSettings(prev => ({ ...prev, tableCategories: [...prev.tableCategories, newCat] }));
  };

  const addLogicCategory = () => {
    const newCat: LogicCategory = {
      id: `log-${Date.now()}`,
      name: t('new_logic_category'),
      color: '#9333ea'
    };
    setLocalSettings(prev => ({ ...prev, logicCategories: [...prev.logicCategories, newCat] }));
  };

  const addConnectionType = () => {
    const newConn: ConnectionType = {
      id: `conn-${Date.now()}`,
      name: t('new_link_type'),
      color: '#94a3b8',
      width: 2,
      dashStyle: 'solid',
      labelPosition: 'center',
      labelMaxWidth: 150
    };
    setLocalSettings(prev => ({ ...prev, connectionTypes: [...prev.connectionTypes, newConn] }));
  };

  const addDataSource = () => {
    const newSrc: DataSource = {
      id: `src-${Date.now()}`,
      name: t('new_data_source')
    };
    setLocalSettings(prev => ({ ...prev, dataSources: [...prev.dataSources, newSrc] }));
  };

  const addFieldType = () => {
    const newType: FieldType = {
      id: `ft-${Date.now()}`,
      name: t('new_field_type')
    };
    setLocalSettings(prev => ({ ...prev, fieldTypes: [...prev.fieldTypes, newType] }));
  };

  const addTag = () => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: t('new_tag'),
      color: '#10b981'
    };
    setLocalSettings(prev => ({ ...prev, tags: [...(prev.tags || []), newTag] }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {/* Fixed dimensions to prevent jumping when switching tabs */}
      <div className="bg-white w-[720px] h-[640px] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg"><Palette size={20} /></div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{t('global_config')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
            <button onClick={() => setActiveTab('tables')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tables' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}><Layout size={16} /> {t('table_setting')}</button>
            <button onClick={() => setActiveTab('logic')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'logic' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}><FileText size={16} /> {t('logic_setting')}</button>
            <button onClick={() => setActiveTab('edges')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'edges' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}><Link2 size={16} /> {t('link_setting')}</button>
            <button onClick={() => setActiveTab('tags')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tags' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}><TagIcon size={16} /> {t('tag_setting')}</button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {activeTab === 'tables' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">{t('table_categories')}</h3>
                    <button onClick={addTableCategory} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                      <Plus size={14} /> {t('add_field')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {localSettings.tableCategories.map((cat, idx) => (
                      <div key={cat.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group">
                        <input type="color" value={cat.color} onChange={e => { const updated = [...localSettings.tableCategories]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, tableCategories: updated }); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                        <input type="text" value={cat.name} onChange={e => { const updated = [...localSettings.tableCategories]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, tableCategories: updated }); }} className="flex-1 bg-transparent text-sm font-medium focus:ring-0 border-0 p-0" />
                        <button onClick={() => setLocalSettings(p => ({ ...p, tableCategories: p.tableCategories.filter(c => c.id !== cat.id)}))} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">{t('manage_field_types')}</h3>
                    <button onClick={addFieldType} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                      <Plus size={14} /> {t('add_field')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {localSettings.fieldTypes.map((ft, idx) => (
                      <div key={ft.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group">
                        <div className="p-1.5 bg-slate-50 rounded text-slate-400"><Type size={14} /></div>
                        <input type="text" value={ft.name} onChange={e => { const updated = [...localSettings.fieldTypes]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, fieldTypes: updated }); }} className="flex-1 bg-transparent text-sm font-medium focus:ring-0 border-0 p-0" />
                        <button onClick={() => setLocalSettings(p => ({ ...p, fieldTypes: p.fieldTypes.filter(s => s.id !== ft.id)}))} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">{t('manage_data_sources')}</h3>
                    <button onClick={addDataSource} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                      <Plus size={14} /> {t('add_field')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {localSettings.dataSources.map((src, idx) => (
                      <div key={src.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group">
                        <div className="p-1.5 bg-slate-50 rounded text-slate-400"><Database size={14} /></div>
                        <input type="text" value={src.name} onChange={e => { const updated = [...localSettings.dataSources]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, dataSources: updated }); }} className="flex-1 bg-transparent text-sm font-medium focus:ring-0 border-0 p-0" />
                        <button onClick={() => setLocalSettings(p => ({ ...p, dataSources: p.dataSources.filter(s => s.id !== src.id)}))} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'logic' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">{t('logic_node_types')}</h3><button onClick={addLogicCategory} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"><Plus size={14} /> {t('add_field')}</button></div>
                {localSettings.logicCategories.map((cat, idx) => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group">
                    <input type="color" value={cat.color} onChange={e => { const updated = [...localSettings.logicCategories]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, logicCategories: updated }); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <input type="text" value={cat.name} onChange={e => { const updated = [...localSettings.logicCategories]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, logicCategories: updated }); }} className="flex-1 bg-transparent text-sm font-medium focus:ring-0 border-0 p-0" />
                    <button onClick={() => setLocalSettings(p => ({ ...p, logicCategories: p.logicCategories.filter(c => c.id !== cat.id)}))} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'edges' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">{t('link_setting')}</h3><button onClick={addConnectionType} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"><Plus size={14} /> {t('add_field')}</button></div>
                {localSettings.connectionTypes.map((conn, idx) => (
                  <div key={conn.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 group relative shadow-sm">
                    <div className="flex items-center gap-3">
                      <input type="color" value={conn.color} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="w-6 h-6 rounded cursor-pointer" />
                      <input type="text" value={conn.name} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="flex-1 font-semibold text-sm border-0 focus:ring-0 p-0" />
                      <button onClick={() => setLocalSettings(p => ({ ...p, connectionTypes: p.connectionTypes.filter(c => c.id !== conn.id)}))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">{t('weight')}</label>
                        <input type="range" min="1" max="5" value={conn.width} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].width = parseInt(e.target.value); setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">{t('style')}</label>
                        <select value={conn.dashStyle} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].dashStyle = e.target.value as any; setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="w-full text-xs p-1.5 border border-slate-200 rounded-lg">
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">{t('label_max_width')}</label>
                        <input 
                          type="number" 
                          min="50" 
                          max="500" 
                          value={conn.labelMaxWidth || 150} 
                          onChange={e => { 
                            const updated = [...localSettings.connectionTypes]; 
                            updated[idx].labelMaxWidth = parseInt(e.target.value) || 150; 
                            setLocalSettings({ ...localSettings, connectionTypes: updated }); 
                          }} 
                          className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500" 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">{t('label_position')}</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                          {(['source', 'center', 'target'] as LabelPosition[]).map(pos => (
                            <button 
                              key={pos}
                              onClick={() => {
                                const updated = [...localSettings.connectionTypes];
                                updated[idx].labelPosition = pos;
                                setLocalSettings({ ...localSettings, connectionTypes: updated });
                              }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${conn.labelPosition === pos ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              {pos === 'center' && <AlignCenter size={12} />}
                              {pos === 'source' && <AlignLeft size={12} />}
                              {pos === 'target' && <AlignRight size={12} />}
                              {t(`pos_${pos}` as any)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'tags' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">{t('tag_setting')}</h3>
                  <button onClick={addTag} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                    <Plus size={14} /> {t('add_field')}
                  </button>
                </div>
                {(localSettings.tags || []).map((tag, idx) => (
                  <div key={tag.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group">
                    <input type="color" value={tag.color} onChange={e => { const updated = [...(localSettings.tags || [])]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, tags: updated }); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <input type="text" value={tag.name} onChange={e => { const updated = [...(localSettings.tags || [])]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, tags: updated }); }} className="flex-1 bg-transparent text-sm font-medium focus:ring-0 border-0 p-0" />
                    <button onClick={() => setLocalSettings(p => ({ ...p, tags: (p.tags || []).filter(t => t.id !== tag.id)}))} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 text-sm font-semibold">{t('cancel')}</button>
          <button onClick={() => { onSave(localSettings); onClose(); }} className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200">{t('apply_config')}</button>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Palette, Link2, Layout, FileText, Database, 
  Type, Tag as TagIcon, AlignCenter, AlignLeft, AlignRight,
  User, Building2, ListOrdered, Globe, Sliders, Settings2, ArrowUp, ArrowDown
} from 'lucide-react';
import { GlobalSettings, AppearanceSettings, FontSizeScale, TableCategory, LogicCategory, ConnectionType, DataSource, FieldType, Tag, LabelPosition, TagPosition } from '../types.ts';
import { translations } from '../translations.ts';

interface StudioSettingsModalProps {
  settings: GlobalSettings;
  appearance: AppearanceSettings;
  initialTab?: 'general' | 'tables' | 'logic' | 'edges' | 'tags';
  onClose: () => void;
  onSave: (settings: GlobalSettings, appearance: AppearanceSettings) => void;
}

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({ 
  settings, 
  appearance, 
  initialTab = 'general',
  onClose, 
  onSave 
}) => {
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings);
  const [localAppearance, setLocalAppearance] = useState<AppearanceSettings>(appearance);
  const [activeTab, setActiveTab] = useState(initialTab);

  const t = (key: keyof typeof translations.en) => translations[localAppearance.language][key] || key;

  // --- Handlers for Settings ---
  const addTableCategory = () => {
    const newCat: TableCategory = { id: `cat-${Date.now()}`, name: t('new_table_category'), color: '#3b82f6' };
    setLocalSettings(prev => ({ ...prev, tableCategories: [...prev.tableCategories, newCat] }));
  };

  const addLogicCategory = () => {
    const newCat: LogicCategory = { id: `log-${Date.now()}`, name: t('new_logic_category'), color: '#9333ea' };
    setLocalSettings(prev => ({ ...prev, logicCategories: [...prev.logicCategories, newCat] }));
  };

  const addConnectionType = () => {
    const newConn: ConnectionType = { id: `conn-${Date.now()}`, name: t('new_link_type'), color: '#94a3b8', width: 2, dashStyle: 'solid', labelPosition: 'center', labelMaxWidth: 150 };
    setLocalSettings(prev => ({ ...prev, connectionTypes: [...prev.connectionTypes, newConn] }));
  };

  const addDataSource = () => {
    const newSrc: DataSource = { id: `src-${Date.now()}`, name: t('new_data_source') };
    setLocalSettings(prev => ({ ...prev, dataSources: [...prev.dataSources, newSrc] }));
  };

  const addFieldType = () => {
    const newType: FieldType = { id: `ft-${Date.now()}`, name: t('new_field_type') };
    setLocalSettings(prev => ({ ...prev, fieldTypes: [...prev.fieldTypes, newType] }));
  };

  const addTag = () => {
    const newTag: Tag = { id: `tag-${Date.now()}`, name: t('new_tag'), color: '#10b981', position: 'left' };
    setLocalSettings(prev => ({ ...prev, tags: [...(prev.tags || []), newTag] }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-[760px] h-[680px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><Settings2 size={22} /></div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Studio Settings</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration & Identity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Nav */}
          <div className="w-56 bg-slate-50 border-r border-slate-100 p-6 space-y-1.5">
            <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <Sliders size={18} /> {t('general_setting')}
            </button>
            <div className="h-px bg-slate-200/50 my-2 mx-2" />
            <button onClick={() => setActiveTab('tables')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'tables' ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <Database size={18} /> {t('table_setting')}
            </button>
            <button onClick={() => setActiveTab('logic')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'logic' ? 'bg-white text-purple-600 shadow-md ring-1 ring-purple-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <FileText size={18} /> {t('logic_setting')}
            </button>
            <button onClick={() => setActiveTab('edges')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'edges' ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <Link2 size={18} /> {t('link_setting')}
            </button>
            <button onClick={() => setActiveTab('tags')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'tags' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <TagIcon size={18} /> {t('tag_setting')}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
            {activeTab === 'general' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2"><User size={16} className="text-slate-400" /><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Identity</h3></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">{t('user_name')}</label>
                      <input type="text" value={localAppearance.userName} onChange={e => setLocalAppearance({...localAppearance, userName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">{t('org_name')}</label>
                      <input type="text" value={localAppearance.organizationName} onChange={e => setLocalAppearance({...localAppearance, organizationName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2"><Globe size={16} className="text-slate-400" /><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('language')}</h3></div>
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {(['en', 'zh'] as const).map(lang => (
                      <button key={lang} onClick={() => setLocalAppearance({...localAppearance, language: lang})} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${localAppearance.language === lang ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                        {lang === 'en' ? 'English' : '简体中文'}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2"><Palette size={16} className="text-slate-400" /><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('canvas_background')}</h3></div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input type="color" value={localAppearance.canvasBgColor} onChange={e => setLocalAppearance({...localAppearance, canvasBgColor: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent shadow-sm" />
                    <input type="text" value={localAppearance.canvasBgColor} onChange={e => setLocalAppearance({...localAppearance, canvasBgColor: e.target.value})} className="flex-1 bg-transparent text-sm font-mono font-bold text-slate-600 focus:ring-0 border-0 p-0" />
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2"><ListOrdered size={16} className="text-slate-400" /><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Preferences</h3></div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">{t('max_fields_label')}</label>
                      <input type="number" min="1" max="50" value={localAppearance.maxFieldsToShow} onChange={e => setLocalAppearance({...localAppearance, maxFieldsToShow: parseInt(e.target.value) || 6})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">{t('typography_scale')}</label>
                      <div className="space-y-3">
                        <div className="flex bg-slate-50 p-1 rounded-xl">
                          {(['sm', 'md', 'lg'] as FontSizeScale[]).map(size => (
                            <button key={size} onClick={() => setLocalAppearance({...localAppearance, headerFontSize: size})} className={`flex-1 py-1.5 text-[10px] font-black uppercase transition-all rounded-lg ${localAppearance.headerFontSize === size ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}>
                              {t(size === 'sm' ? 'small' : size === 'md' ? 'medium' : 'large')}
                            </button>
                          ))}
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-xl">
                          {(['sm', 'md', 'lg'] as FontSizeScale[]).map(size => (
                            <button key={size} onClick={() => setLocalAppearance({...localAppearance, contentFontSize: size})} className={`flex-1 py-1.5 text-[10px] font-black uppercase transition-all rounded-lg ${localAppearance.contentFontSize === size ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>
                              {t(size === 'sm' ? 'small' : size === 'md' ? 'medium' : 'large')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'tables' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('table_categories')}</h3>
                    <button onClick={addTableCategory} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase transition-all">
                      <Plus size={14} strokeWidth={3} /> {t('add_field')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {localSettings.tableCategories.map((cat, idx) => (
                      <div key={cat.id} className="flex items-center gap-4 p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl group hover:bg-white hover:shadow-sm transition-all">
                        <input type="color" value={cat.color} onChange={e => { const updated = [...localSettings.tableCategories]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, tableCategories: updated }); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shadow-sm" />
                        <input type="text" value={cat.name} onChange={e => { const updated = [...localSettings.tableCategories]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, tableCategories: updated }); }} className="flex-1 bg-transparent text-sm font-bold text-slate-700 border-0 p-0 focus:ring-0" />
                        <button onClick={() => setLocalSettings(p => ({ ...p, tableCategories: p.tableCategories.filter(c => c.id !== cat.id)}))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('manage_field_types')}</h3>
                    <button onClick={addFieldType} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase transition-all">
                      <Plus size={14} strokeWidth={3} /> {t('add_field')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {localSettings.fieldTypes.map((ft, idx) => (
                      <div key={ft.id} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-200 rounded-xl group hover:bg-white transition-all">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400"><Type size={14} /></div>
                        <input type="text" value={ft.name} onChange={e => { const updated = [...localSettings.fieldTypes]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, fieldTypes: updated }); }} className="flex-1 bg-transparent text-xs font-bold text-slate-600 border-0 p-0 focus:ring-0" />
                        <button onClick={() => setLocalSettings(p => ({ ...p, fieldTypes: p.fieldTypes.filter(s => s.id !== ft.id)}))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'logic' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('logic_node_types')}</h3>
                    <button onClick={addLogicCategory} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase transition-all">
                      <Plus size={14} strokeWidth={3} /> {t('add_field')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {localSettings.logicCategories.map((cat, idx) => (
                      <div key={cat.id} className="flex items-center gap-4 p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl group hover:bg-white hover:shadow-sm transition-all">
                        <input type="color" value={cat.color} onChange={e => { const updated = [...localSettings.logicCategories]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, logicCategories: updated }); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shadow-sm" />
                        <input type="text" value={cat.name} onChange={e => { const updated = [...localSettings.logicCategories]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, logicCategories: updated }); }} className="flex-1 bg-transparent text-sm font-bold text-slate-700 border-0 p-0 focus:ring-0" />
                        <button onClick={() => setLocalSettings(p => ({ ...p, logicCategories: p.logicCategories.filter(c => c.id !== cat.id)}))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'edges' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('link_setting')}</h3>
                  <button onClick={addConnectionType} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase transition-all">
                    <Plus size={14} strokeWidth={3} /> {t('add_field')}
                  </button>
                </div>
                {localSettings.connectionTypes.map((conn, idx) => (
                  <div key={conn.id} className="p-5 bg-slate-50/30 border border-slate-200 rounded-3xl space-y-5 group relative hover:bg-white hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <input type="color" value={conn.color} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="w-8 h-8 rounded-lg cursor-pointer shadow-sm border-0" />
                      <input type="text" value={conn.name} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="flex-1 font-black text-sm text-slate-800 border-0 focus:ring-0 p-0 bg-transparent uppercase tracking-tight" />
                      <button onClick={() => setLocalSettings(p => ({ ...p, connectionTypes: p.connectionTypes.filter(c => c.id !== conn.id)}))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-2 border-t border-slate-100">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">{t('weight')}</label>
                        <input type="range" min="1" max="5" value={conn.width} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].width = parseInt(e.target.value); setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">{t('style')}</label>
                        <select value={conn.dashStyle} onChange={e => { const updated = [...localSettings.connectionTypes]; updated[idx].dashStyle = e.target.value as any; setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className="w-full text-xs font-bold py-1.5 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all">
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-3">{t('label_position')}</label>
                        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
                          {(['source', 'center', 'target'] as LabelPosition[]).map(pos => (
                            <button key={pos} onClick={() => { const updated = [...localSettings.connectionTypes]; updated[idx].labelPosition = pos; setLocalSettings({ ...localSettings, connectionTypes: updated }); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${conn.labelPosition === pos ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                              {pos === 'center' && <AlignCenter size={12} strokeWidth={3} />}
                              {pos === 'source' && <AlignLeft size={12} strokeWidth={3} />}
                              {pos === 'target' && <AlignRight size={12} strokeWidth={3} />}
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
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tag_setting')}</h3>
                    <button onClick={addTag} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase transition-all">
                      <Plus size={14} strokeWidth={3} /> {t('add_field')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {(localSettings.tags || []).map((tag, idx) => (
                      <div key={tag.id} className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl group hover:bg-white hover:shadow-md transition-all space-y-4">
                        <div className="flex items-center gap-4">
                          <input type="color" value={tag.color} onChange={e => { const updated = [...(localSettings.tags || [])]; updated[idx].color = e.target.value; setLocalSettings({ ...localSettings, tags: updated }); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent shadow-sm" />
                          <input type="text" value={tag.name} onChange={e => { const updated = [...(localSettings.tags || [])]; updated[idx].name = e.target.value; setLocalSettings({ ...localSettings, tags: updated }); }} className="flex-1 bg-transparent text-sm font-bold text-slate-700 border-0 p-0 focus:ring-0" />
                          <button onClick={() => setLocalSettings(p => ({ ...p, tags: (p.tags || []).filter(t => t.id !== tag.id)}))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                        </div>
                        
                        <div className="pt-3 border-t border-slate-100">
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">{t('tag_position')}</label>
                          <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100">
                            {(['left', 'right', 'top', 'bottom'] as TagPosition[]).map(pos => (
                              <button 
                                key={pos} 
                                onClick={() => { 
                                  const updated = [...(localSettings.tags || [])]; 
                                  updated[idx].position = pos; 
                                  setLocalSettings({ ...localSettings, tags: updated }); 
                                }} 
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${tag.position === pos || (!tag.position && pos === 'left') ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                {pos === 'left' && <AlignLeft size={10} />}
                                {pos === 'right' && <AlignRight size={10} />}
                                {pos === 'top' && <ArrowUp size={10} />}
                                {pos === 'bottom' && <ArrowDown size={10} />}
                                {t(`pos_${pos}` as any)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 text-slate-400 text-sm font-black uppercase tracking-widest hover:text-slate-600 transition-colors">{t('cancel')}</button>
          <button onClick={() => { onSave(localSettings, localAppearance); onClose(); }} className="px-12 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 transition-all active:scale-95">{t('apply_config')}</button>
        </div>
      </div>
    </div>
  );
};
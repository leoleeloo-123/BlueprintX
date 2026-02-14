
import React, { useState } from 'react';
import { X, Plus, Trash2, Palette, Link2, Layout } from 'lucide-react';
import { GlobalSettings, TableCategory, ConnectionType } from '../types.ts';

interface SettingsModalProps {
  settings: GlobalSettings;
  onClose: () => void;
  onSave: (settings: GlobalSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings);
  const [activeTab, setActiveTab] = useState<'tables' | 'edges'>('tables');

  const addTableCategory = () => {
    const newCat: TableCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      color: '#3b82f6'
    };
    setLocalSettings(prev => ({
      ...prev,
      tableCategories: [...prev.tableCategories, newCat]
    }));
  };

  const addConnectionType = () => {
    const newConn: ConnectionType = {
      id: `conn-${Date.now()}`,
      name: 'New Link Type',
      color: '#94a3b8',
      width: 2,
      dashStyle: 'solid'
    };
    setLocalSettings(prev => ({
      ...prev,
      connectionTypes: [...prev.connectionTypes, newConn]
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg"><Palette size={20} /></div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Global Config</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('tables')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tables' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Layout size={16} /> Table Styles
            </button>
            <button 
              onClick={() => setActiveTab('edges')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'edges' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Link2 size={16} /> Edge Styles
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {activeTab === 'tables' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">Data Table Categories</h3>
                  <button onClick={addTableCategory} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"><Plus size={14} /> Add New</button>
                </div>
                {localSettings.tableCategories.map((cat, idx) => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group">
                    <input type="color" value={cat.color} onChange={e => {
                      const updated = [...localSettings.tableCategories];
                      updated[idx].color = e.target.value;
                      setLocalSettings({ ...localSettings, tableCategories: updated });
                    }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <input type="text" value={cat.name} onChange={e => {
                      const updated = [...localSettings.tableCategories];
                      updated[idx].name = e.target.value;
                      setLocalSettings({ ...localSettings, tableCategories: updated });
                    }} className="flex-1 bg-transparent text-sm font-medium focus:ring-0 border-0 p-0" />
                    <button onClick={() => setLocalSettings(p => ({ ...p, tableCategories: p.tableCategories.filter(c => c.id !== cat.id)}))} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">Connection Line Styles</h3>
                  <button onClick={addConnectionType} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"><Plus size={14} /> Add New</button>
                </div>
                {localSettings.connectionTypes.map((conn, idx) => (
                  <div key={conn.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 group relative">
                    <div className="flex items-center gap-3">
                      <input type="color" value={conn.color} onChange={e => {
                        const updated = [...localSettings.connectionTypes];
                        updated[idx].color = e.target.value;
                        setLocalSettings({ ...localSettings, connectionTypes: updated });
                      }} className="w-6 h-6 rounded cursor-pointer" />
                      <input type="text" value={conn.name} onChange={e => {
                        const updated = [...localSettings.connectionTypes];
                        updated[idx].name = e.target.value;
                        setLocalSettings({ ...localSettings, connectionTypes: updated });
                      }} className="flex-1 font-semibold text-sm border-0 focus:ring-0 p-0" />
                      <button onClick={() => setLocalSettings(p => ({ ...p, connectionTypes: p.connectionTypes.filter(c => c.id !== conn.id)}))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Weight</label>
                        <input type="range" min="1" max="5" value={conn.width} onChange={e => {
                          const updated = [...localSettings.connectionTypes];
                          updated[idx].width = parseInt(e.target.value);
                          setLocalSettings({ ...localSettings, connectionTypes: updated });
                        }} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Style</label>
                        <select value={conn.dashStyle} onChange={e => {
                          const updated = [...localSettings.connectionTypes];
                          updated[idx].dashStyle = e.target.value as any;
                          setLocalSettings({ ...localSettings, connectionTypes: updated });
                        }} className="w-full text-xs p-1 border border-slate-200 rounded">
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 text-sm font-semibold">Cancel</button>
          <button onClick={() => { onSave(localSettings); onClose(); }} className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200">Apply Config</button>
        </div>
      </div>
    </div>
  );
};

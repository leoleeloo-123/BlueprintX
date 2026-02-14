
import React, { useState } from 'react';
import { X, Sliders, Globe, Palette, Type, User, Building2 } from 'lucide-react';
import { AppearanceSettings, FontSizeScale } from '../types.ts';
import { translations } from '../translations.ts';

interface GeneralSettingsModalProps {
  appearance: AppearanceSettings;
  onClose: () => void;
  onSave: (settings: AppearanceSettings) => void;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({ appearance, onClose, onSave }) => {
  const [local, setLocal] = useState<AppearanceSettings>(appearance);
  
  const t = (key: keyof typeof translations.en) => translations[local.language][key] || key;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg"><Sliders size={20} /></div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{t('general_settings')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Profile Identity */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Profile Identity</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-tight">{t('user_name')}</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    value={local.userName} 
                    onChange={e => setLocal({...local, userName: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter name"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-tight">{t('org_name')}</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    value={local.organizationName} 
                    onChange={e => setLocal({...local, organizationName: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter org"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Language Selection */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-slate-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('language')}</h3>
            </div>
            <div className="flex gap-2">
              {(['en', 'zh'] as const).map(lang => (
                <button 
                  key={lang}
                  onClick={() => setLocal({...local, language: lang})}
                  className={`flex-1 py-2 px-4 rounded-xl border text-sm font-bold transition-all ${local.language === lang ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  {lang === 'en' ? 'English' : '简体中文'}
                </button>
              ))}
            </div>
          </section>

          {/* Canvas Background */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-slate-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('canvas_background')}</h3>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input 
                type="color" 
                value={local.canvasBgColor} 
                onChange={e => setLocal({...local, canvasBgColor: e.target.value})}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input 
                type="text" 
                value={local.canvasBgColor} 
                onChange={e => setLocal({...local, canvasBgColor: e.target.value})}
                className="flex-1 bg-transparent text-sm font-mono text-slate-600 focus:ring-0 border-0 p-0"
              />
            </div>
          </section>

          {/* Global Font Sizes */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-slate-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('typography_scale')}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block">{t('header_font_size')}</label>
                <div className="flex gap-1.5">
                  {(['sm', 'md', 'lg'] as FontSizeScale[]).map(size => (
                    <button 
                      key={`header-${size}`}
                      onClick={() => setLocal({...local, headerFontSize: size})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${local.headerFontSize === size ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                    >
                      {t(size === 'sm' ? 'small' : size === 'md' ? 'medium' : 'large')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-2 block">{t('content_font_size')}</label>
                <div className="flex gap-1.5">
                  {(['sm', 'md', 'lg'] as FontSizeScale[]).map(size => (
                    <button 
                      key={`content-${size}`}
                      onClick={() => setLocal({...local, contentFontSize: size})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${local.contentFontSize === size ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                    >
                      {t(size === 'sm' ? 'small' : size === 'md' ? 'medium' : 'large')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 text-sm font-bold">{t('cancel')}</button>
          <button onClick={() => { onSave(local); onClose(); }} className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">{t('apply_settings')}</button>
        </div>
      </div>
    </div>
  );
};
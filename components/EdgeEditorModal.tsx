
import React, { useState } from 'react';
import { X, Link2, Type, ArrowRight } from 'lucide-react';
import { Edge } from 'reactflow';

interface EdgeEditorModalProps {
  edge: Edge;
  onClose: () => void;
  onSave: (data: { label: string; hasArrow: boolean }) => void;
}

export const EdgeEditorModal: React.FC<EdgeEditorModalProps> = ({ edge, onClose, onSave }) => {
  const [label, setLabel] = useState(edge.label?.toString() || '');
  const [hasArrow, setHasArrow] = useState(edge.markerEnd !== undefined);

  const handleSave = () => {
    onSave({ label, hasArrow });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Edit Mapping</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Type size={14} /> Mapping Label
            </label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="e.g. primary key join, lookup..."
              autoFocus
            />
            <p className="mt-2 text-[10px] text-slate-400">This text will appear on the connection line.</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <ArrowRight size={16} className="text-slate-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-700">Directional Arrow</span>
                <p className="text-[10px] text-slate-400">Show direction of data flow</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={hasArrow} 
                onChange={(e) => setHasArrow(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-slate-900 text-white font-semibold hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-200 transition-all text-sm"
          >
            Update Mapping
          </button>
        </div>
      </div>
    </div>
  );
};

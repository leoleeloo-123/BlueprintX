
import React, { useState } from 'react';
import { X, Plus, Trash2, Database, FileText, BarChart2 } from 'lucide-react';
import { Node, NodeProps } from 'reactflow';
import { NodeData, NodeCardType, TableColumn } from '../types';

interface EditorModalProps {
  node: Node<NodeData>;
  onClose: () => void;
  onSave: (data: Partial<NodeData>) => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({ node, onClose, onSave }) => {
  const [label, setLabel] = useState(node.data.label);
  const [cardType, setCardType] = useState<NodeCardType>(node.data.cardType);
  const [columns, setColumns] = useState<TableColumn[]>(node.data.columns || []);
  const [description, setDescription] = useState(node.data.description || '');
  const [bulletPoints, setBulletPoints] = useState<string[]>(node.data.bulletPoints || []);

  const handleAddColumn = () => {
    setColumns([...columns, { id: Date.now().toString(), name: 'New Column' }]);
  };

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const handleUpdateColumn = (id: string, name: string) => {
    setColumns(columns.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleAddBullet = () => {
    setBulletPoints([...bulletPoints, 'New point']);
  };

  const handleRemoveBullet = (index: number) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index));
  };

  const handleUpdateBullet = (index: number, text: string) => {
    const newPoints = [...bulletPoints];
    newPoints[index] = text;
    setBulletPoints(newPoints);
  };

  const handleSave = () => {
    onSave({
      label,
      cardType,
      columns: cardType === NodeCardType.TABLE ? columns : [],
      description: (cardType === NodeCardType.LOGIC_NOTE || cardType === NodeCardType.REPORT) ? description : '',
      bulletPoints: (cardType === NodeCardType.LOGIC_NOTE || cardType === NodeCardType.REPORT) ? bulletPoints : []
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Edit Node Properties</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Label Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Node Name</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Sales Data"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Node Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: NodeCardType.TABLE, icon: Database, label: 'Table', color: 'blue' },
                { type: NodeCardType.LOGIC_NOTE, icon: FileText, label: 'Logic Note', color: 'purple' },
                { type: NodeCardType.REPORT, icon: BarChart2, label: 'Report', color: 'orange' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setCardType(item.type)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    cardType === item.type 
                    ? `border-${item.color}-500 bg-${item.color}-50 text-${item.color}-700` 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Content */}
          <div className="pt-4 border-t border-slate-100">
            {cardType === NodeCardType.TABLE ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Columns</label>
                  <button 
                    onClick={handleAddColumn}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Column
                  </button>
                </div>
                <div className="space-y-2">
                  {columns.map((col) => (
                    <div key={col.id} className="flex gap-2">
                      <input 
                        type="text"
                        value={col.name}
                        onChange={(e) => handleUpdateColumn(col.id, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                      />
                      <button 
                        onClick={() => handleRemoveColumn(col.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {columns.length === 0 && (
                    <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <span className="text-xs text-slate-400">No columns added yet.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter short description..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Key Points</label>
                    <button 
                      onClick={handleAddBullet}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Point
                    </button>
                  </div>
                  <div className="space-y-2">
                    {bulletPoints.map((point, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text"
                          value={point}
                          onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                        />
                        <button 
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-slate-800 text-white font-semibold hover:bg-slate-900 rounded-xl shadow-lg shadow-slate-200 transition-all text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

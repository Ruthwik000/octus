import { useState } from 'react';

const ColumnManager = ({ columns, onSave, onClose }) => {
  const [customColumns, setCustomColumns] = useState(columns);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');

  const defaultColumns = [
    { id: 'name', label: 'Task Name', type: 'text', required: true, editable: true },
    { id: 'assignee', label: 'Assignee', type: 'text', required: false, editable: true },
    { id: 'dueDate', label: 'Due Date', type: 'date', required: false, editable: true },
    { id: 'storyPoints', label: 'Story Points', type: 'number', required: false, editable: true },
    { id: 'risk', label: 'Risk', type: 'calculated', required: false, editable: false },
    { id: 'status', label: 'Status', type: 'select', required: false, editable: true }
  ];

  const addColumn = () => {
    if (!newColumnName.trim()) {
      alert('Please enter a column name');
      return;
    }

    const columnId = newColumnName.toLowerCase().replace(/\s+/g, '_');
    
    if (customColumns.some(col => col.id === columnId)) {
      alert('Column already exists');
      return;
    }

    const newColumn = {
      id: columnId,
      label: newColumnName,
      type: newColumnType,
      required: false,
      editable: true,
      custom: true
    };

    setCustomColumns([...customColumns, newColumn]);
    setNewColumnName('');
    setNewColumnType('text');
  };

  const removeColumn = (columnId) => {
    const column = customColumns.find(col => col.id === columnId);
    if (column?.required) {
      alert('Cannot remove required columns');
      return;
    }
    setCustomColumns(customColumns.filter(col => col.id !== columnId));
  };

  const toggleColumnVisibility = (columnId) => {
    setCustomColumns(customColumns.map(col => 
      col.id === columnId ? { ...col, hidden: !col.hidden } : col
    ));
  };

  const handleSave = () => {
    onSave(customColumns);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="card-dark rounded-2xl shadow-2xl p-8 max-w-3xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Manage Columns</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add New Column */}
        <div className="bg-dark-900 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add Custom Column</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark-200 mb-2">Column Name</label>
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., Risk Probability, Priority, Complexity"
                className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                style={{ 
                  color: '#ffffff',
                  WebkitTextFillColor: '#ffffff',
                  caretColor: '#ffffff'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Type</label>
              <select
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                style={{ 
                  color: '#ffffff',
                  WebkitTextFillColor: '#ffffff'
                }}
              >
                <option value="text" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Text</option>
                <option value="number" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Number</option>
                <option value="date" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Date</option>
                <option value="select" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Dropdown</option>
                <option value="percentage" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Percentage</option>
              </select>
            </div>
          </div>
          <button
            onClick={addColumn}
            className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/20 font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Column</span>
          </button>
        </div>

        {/* Existing Columns */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Current Columns</h3>
          <div className="space-y-2">
            {customColumns.map((column) => (
              <div
                key={column.id}
                className="flex items-center justify-between bg-dark-900 rounded-xl p-4 hover:bg-dark-800 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <button
                    onClick={() => toggleColumnVisibility(column.id)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      column.hidden ? 'bg-dark-700 text-dark-500' : 'bg-primary-500/10 text-primary-500'
                    }`}
                  >
                    {column.hidden ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="text-white font-medium">{column.label}</div>
                    <div className="text-dark-400 text-sm flex items-center space-x-2">
                      <span className="capitalize">{column.type}</span>
                      {column.required && <span className="px-2 py-0.5 bg-danger-500/10 text-danger-500 rounded text-xs">Required</span>}
                      {column.custom && <span className="px-2 py-0.5 bg-primary-500/10 text-primary-500 rounded text-xs">Custom</span>}
                    </div>
                  </div>
                </div>

                {!column.required && (
                  <button
                    onClick={() => removeColumn(column.id)}
                    className="text-danger-500 hover:text-danger-400 transition-colors p-2"
                    title="Remove column"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-dark-700 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-success-600 to-success-500 text-white rounded-xl hover:from-success-500 hover:to-success-600 transition-all shadow-lg shadow-success-500/20 font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnManager;

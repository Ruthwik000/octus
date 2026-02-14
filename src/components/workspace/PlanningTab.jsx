import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectTasks, createTask, updateTask, deleteTask } from '../../services/taskService';
import DataImportModal from '../DataImportModal';
import ColumnManager from './ColumnManager';

const PlanningTab = ({ projectId }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showRiskDrawer, setShowRiskDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { taskId, field }
  const [editValue, setEditValue] = useState('');
  const [columns, setColumns] = useState([
    { id: 'name', label: 'Task Name', type: 'text', required: true, editable: true },
    { id: 'assignee', label: 'Assignee', type: 'text', required: false, editable: true },
    { id: 'dueDate', label: 'Due Date', type: 'date', required: false, editable: true },
    { id: 'storyPoints', label: 'Story Points', type: 'number', required: false, editable: true },
    { id: 'risk', label: 'Risk', type: 'calculated', required: false, editable: false },
    { id: 'status', label: 'Status', type: 'select', required: false, editable: true }
  ]);
  const [formData, setFormData] = useState({
    name: '',
    assignee: '',
    dueDate: '',
    storyPoints: '',
    status: 'todo'
  });

  useEffect(() => {
    loadTasks();
    loadColumns();
  }, [projectId]);

  const loadColumns = () => {
    const savedColumns = localStorage.getItem(`project_${projectId}_columns`);
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  };

  const saveColumns = (newColumns) => {
    setColumns(newColumns);
    localStorage.setItem(`project_${projectId}_columns`, JSON.stringify(newColumns));
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getProjectTasks(projectId);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask({ ...formData, projectId });
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ name: '', assignee: '', dueDate: '', storyPoints: '', status: 'todo' });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      assignee: task.assignee,
      dueDate: task.dueDate,
      storyPoints: task.storyPoints,
      status: task.status
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(taskId);
        loadTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImportTasks = async (importedTasks) => {
    try {
      for (const task of importedTasks) {
        await createTask(task);
      }
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to import some tasks');
    }
  };

  const startEditing = (taskId, field, currentValue) => {
    setEditingCell({ taskId, field });
    setEditValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveInlineEdit = async (taskId) => {
    if (!editingCell) return;
    
    try {
      await updateTask(taskId, {
        [editingCell.field]: editValue
      });
      setEditingCell(null);
      setEditValue('');
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update task');
    }
  };

  const handleKeyPress = (e, taskId) => {
    if (e.key === 'Enter') {
      saveInlineEdit(taskId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const renderCell = (task, column) => {
    const value = task[column.id];
    const isEditing = editingCell?.taskId === task.id && editingCell?.field === column.id;

    if (column.id === 'risk') {
      return getRiskBadge(task.storyPoints);
    }

    if (column.id === 'status') {
      if (isEditing) {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveInlineEdit(task.id)}
            autoFocus
            className="px-2 py-1 bg-dark-800 border-2 border-primary-500 rounded text-white focus:outline-none"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
          >
            <option value="todo" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>To Do</option>
            <option value="in-progress" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>In Progress</option>
            <option value="done" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Done</option>
          </select>
        );
      }
      return getStatusBadge(value);
    }

    if (column.id === 'assignee' && !isEditing) {
      return (
        <div className="flex items-center space-x-2 hover:text-primary-400 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
            {value?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm text-dark-300">{value || 'Unassigned'}</span>
        </div>
      );
    }

    if (isEditing) {
      const inputType = column.type === 'number' ? 'number' : 
                       column.type === 'date' ? 'date' : 
                       column.type === 'percentage' ? 'number' : 'text';
      
      return (
        <input
          type={inputType}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => saveInlineEdit(task.id)}
          onKeyDown={(e) => handleKeyPress(e, task.id)}
          autoFocus
          min={column.type === 'percentage' ? 0 : undefined}
          max={column.type === 'percentage' ? 100 : undefined}
          className="w-full px-2 py-1 bg-dark-800 border-2 border-primary-500 rounded text-white focus:outline-none"
          style={{ 
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
            caretColor: '#ffffff',
            colorScheme: column.type === 'date' ? 'dark' : 'normal'
          }}
        />
      );
    }

    const displayValue = column.type === 'percentage' && value ? `${value}%` : value || '-';
    return <span className="hover:text-primary-400 transition-colors">{displayValue}</span>;
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowRiskDrawer(true);
  };

  const getRiskScore = (points) => Math.min(Math.floor((points || 0) * 10), 100);

  const getRiskBadge = (points) => {
    const risk = getRiskScore(points);
    const color = risk > 70 ? 'bg-danger-500/10 text-danger-500 border-danger-500/30' : 
                  risk > 40 ? 'bg-warning-500/10 text-warning-500 border-warning-500/30' : 
                  'bg-success-500/10 text-success-500 border-success-500/30';
    return <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${color}`}>{risk}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      'todo': 'bg-dark-700 text-dark-300',
      'in-progress': 'bg-primary-500/10 text-primary-400 border border-primary-500/30',
      'done': 'bg-success-500/10 text-success-500 border border-success-500/30'
    };
    const labels = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done'
    };
    return <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${colors[status]}`}>{labels[status]}</span>;
  };

  const avgRisk = tasks.length > 0 ? Math.floor(tasks.reduce((acc, t) => acc + getRiskScore(t.storyPoints), 0) / tasks.length) : 0;
  const highRiskTasks = tasks.filter(t => getRiskScore(t.storyPoints) > 70).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  
  // Calculate predicted delay based on high-risk tasks
  const predictedDelay = Math.floor(highRiskTasks * 0.5); // Each high-risk task adds 0.5 days delay

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-700 border-t-primary-500 mx-auto mb-4"></div>
        <p className="text-dark-400">Loading tasks...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card-dark rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-dark-400">Overall Risk Score</div>
            <div className="w-10 h-10 bg-warning-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{avgRisk}</div>
          <div className={`text-sm font-medium ${avgRisk > 70 ? 'text-danger-500' : avgRisk > 40 ? 'text-warning-500' : 'text-success-500'}`}>
            {avgRisk > 70 ? 'High Risk' : avgRisk > 40 ? 'Moderate Risk' : 'Low Risk'}
          </div>
        </div>

        <div className="card-dark rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-dark-400">Predicted Delay</div>
            <div className="w-10 h-10 bg-danger-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-danger-500 mb-2">+{predictedDelay}</div>
          <div className="text-sm font-medium text-dark-400">days</div>
        </div>

        <div className="card-dark rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-dark-400">High-Risk Tasks</div>
            <div className="w-10 h-10 bg-danger-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{highRiskTasks}</div>
          <div className="text-sm font-medium text-dark-400">tasks</div>
        </div>

        <div className="card-dark rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-dark-400">Total Tasks</div>
            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{totalTasks}</div>
          <div className="text-sm font-medium text-dark-400">active</div>
        </div>
      </div>

      {/* AI Health Summary */}
      <div className="bg-gradient-to-r from-primary-900/30 to-primary-800/20 border border-primary-500/30 rounded-2xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-white">AI Project Health Summary</h3>
              <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-xs font-semibold">Live Analysis</span>
            </div>
            <p className="text-dark-200 leading-relaxed">
              {totalTasks === 0 ? (
                'No tasks yet. Add tasks to get AI-powered insights and recommendations.'
              ) : (
                <>
                  Project is at <span className={`font-semibold ${avgRisk > 70 ? 'text-danger-500' : avgRisk > 40 ? 'text-warning-500' : 'text-success-500'}`}>
                    {avgRisk > 70 ? 'High' : avgRisk > 40 ? 'Moderate' : 'Low'} Risk ({avgRisk}%)
                  </span>.
                  {highRiskTasks > 0 && <> <span className="text-danger-500 font-semibold">{highRiskTasks} tasks</span> likely to slip.</>}
                  {' '}
                  {completedTasks > 0 && <span className="text-success-500 font-semibold">{completedTasks} completed</span>}
                  {inProgressTasks > 0 && <>, <span className="text-primary-400 font-semibold">{inProgressTasks} in progress</span></>}.
                  {highRiskTasks > 2 && ' Recommended to reprioritize high-complexity items and review resource allocation.'}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Tasks</h2>
            <p className="text-sm text-dark-400 mt-1">Manage and track project tasks</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowColumnManager(true)}
              className="bg-dark-800 border border-dark-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-dark-700 transition-all flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Manage Columns</span>
            </button>
            <button
              onClick={() => navigate(`/project/${projectId}/ai-analysis`)}
              className="bg-gradient-to-r from-warning-600 to-warning-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-warning-500 hover:to-warning-600 transition-all shadow-lg shadow-warning-500/20 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI Analysis</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-dark-800 border border-dark-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-dark-700 transition-all flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Import Data</span>
            </button>
            <button
              onClick={() => {
                setEditingTask(null);
                setFormData({ name: '', assignee: '', dueDate: '', storyPoints: '', status: 'todo' });
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/20 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-900 border-b border-dark-800">
              <tr>
                {columns.filter(col => !col.hidden).map((column) => (
                  <th key={column.id} className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-dark-900/50 transition-colors">
                  {columns.filter(col => !col.hidden).map((column) => (
                    <td
                      key={column.id}
                      className={`px-6 py-4 text-sm ${column.editable ? 'cursor-pointer' : ''} ${
                        column.id === 'name' ? 'font-medium text-white' : 
                        column.id === 'storyPoints' ? 'font-semibold text-white' : 
                        'text-dark-300'
                      }`}
                      onClick={() => column.editable && editingCell?.taskId !== task.id && startEditing(task.id, column.id, task[column.id])}
                    >
                      {renderCell(task, column)}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleTaskClick(task)} 
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                        title="View Risk Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button onClick={() => handleEdit(task)} className="text-warning-400 hover:text-warning-300 transition-colors" title="Edit in Modal">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="text-danger-500 hover:text-danger-400 transition-colors" title="Delete">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-900 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-dark-400 text-lg">No tasks yet</p>
              <p className="text-dark-500 text-sm mt-1">Add your first task or import from CSV to get started</p>
              <button
                onClick={() => setShowImportModal(true)}
                className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-medium"
              >
                Import Sample Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="card-dark rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Task Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Implement user authentication"
                  style={{ 
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                    caretColor: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Assignee</label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="John Doe"
                  style={{ 
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                    caretColor: '#ffffff'
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    style={{ 
                      color: '#ffffff',
                      WebkitTextFillColor: '#ffffff',
                      caretColor: '#ffffff',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Story Points</label>
                  <input
                    type="number"
                    value={formData.storyPoints}
                    onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="5"
                    style={{ 
                      color: '#ffffff',
                      WebkitTextFillColor: '#ffffff',
                      caretColor: '#ffffff'
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  style={{ 
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff'
                  }}
                >
                  <option value="todo" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>To Do</option>
                  <option value="in-progress" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>In Progress</option>
                  <option value="done" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Done</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-dark-700 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/20 font-semibold"
                >
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Risk Breakdown Drawer */}
      {showRiskDrawer && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-end z-50" onClick={() => setShowRiskDrawer(false)}>
          <div className="w-full max-w-md h-full bg-dark-900 shadow-2xl p-8 overflow-y-auto animate-slide-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Risk Breakdown</h2>
              <button onClick={() => setShowRiskDrawer(false)} className="text-dark-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="card-dark rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-white mb-2">{selectedTask.name}</h3>
              <p className="text-sm text-dark-400">Assigned to: {selectedTask.assignee || 'Unassigned'}</p>
            </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card-dark rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Current State</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-dark-300">Assignee:</span>
              <span className="text-white font-medium">{selectedTask.assignee || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Story Points:</span>
              <span className="text-white font-medium">{selectedTask.storyPoints || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Due Date:</span>
              <span className="text-white font-medium">{selectedTask.dueDate || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Status:</span>
              <span className="text-white font-medium capitalize">{selectedTask.status?.replace('-', ' ') || 'To Do'}</span>
            </div>
          </div>
        </div>

        <div className="card-dark rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Risk Analysis</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Complexity', value: Math.min(selectedTask.storyPoints * 10, 40), color: 'danger' },
              { label: 'Timeline Risk', value: selectedTask.dueDate ? 20 : 30, color: 'warning' },
              { label: 'Resource Load', value: selectedTask.assignee ? 15 : 25, color: 'warning' }
            ].map((factor, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-dark-200">{factor.label}</span>
                  <span className={`text-sm font-bold text-${factor.color}-500`}>+{factor.value}</span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <div 
                    className={`bg-${factor.color}-500 h-2 rounded-full transition-all`}
                    style={{ width: `${factor.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-danger-900/30 to-danger-800/20 border border-danger-500/30 rounded-xl">
        <div className="text-sm font-medium text-dark-300 mb-2">Total Risk Score</div>
        <div className="text-5xl font-bold text-danger-500">{getRiskScore(selectedTask.storyPoints)}/100</div>
        <p className="text-sm text-dark-400 mt-2">
          Based on complexity, timeline, and resource allocation analysis
        </p>
      </div>
          </div>
        </div>
      )}

      {/* Column Manager Modal */}
      {showColumnManager && (
        <ColumnManager
          columns={columns}
          onSave={saveColumns}
          onClose={() => setShowColumnManager(false)}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <DataImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportTasks}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default PlanningTab;

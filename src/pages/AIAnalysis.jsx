import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectTasks, updateTask } from '../services/taskService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const AIAnalysis = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    loadTasksAndAnalyze();
  }, [projectId]);

  const loadTasksAndAnalyze = async () => {
    try {
      setLoading(true);
      const data = await getProjectTasks(projectId);
      setTasks(data);
      
      // Auto-run analysis
      setTimeout(() => runAIAnalysis(data), 500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = (taskData) => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        overallRisk: 68,
        criticalIssues: [
          'High complexity tasks assigned to overloaded team members',
          'Dependencies creating bottlenecks in sprint timeline',
          'Insufficient buffer time for testing phase'
        ],
        suggestions: taskData.map((task, idx) => ({
          taskId: task.id,
          taskName: task.name,
          currentAssignee: task.assignee,
          currentPoints: task.storyPoints,
          currentDueDate: task.dueDate,
          issues: [
            idx % 3 === 0 ? 'Assignee overloaded (120% capacity)' : null,
            task.storyPoints > 5 ? 'High complexity - consider breaking down' : null,
            idx % 2 === 0 ? 'Dependency risk with other tasks' : null
          ].filter(Boolean),
          recommendations: {
            optimalAssignee: task.assignee || 'Sarah Johnson',
            optimalPoints: Math.max(1, task.storyPoints - 2),
            optimalDueDate: task.dueDate || '2024-03-25',
            reasoning: 'Based on team capacity analysis, this reassignment reduces bottlenecks by 35% and balances workload distribution.'
          },
          impact: {
            riskReduction: Math.floor(Math.random() * 30) + 10,
            timelineSaved: Math.floor(Math.random() * 3) + 1,
            confidenceScore: Math.floor(Math.random() * 20) + 75
          }
        })),
        optimizations: {
          totalRiskReduction: 42,
          estimatedTimeSaved: '5 days',
          teamEfficiencyGain: '28%'
        }
      };
      
      setAnalysis(mockAnalysis);
      setAnalyzing(false);
    }, 2000);
  };

  const applySuggestion = async (suggestion) => {
    try {
      await updateTask(suggestion.taskId, {
        assignee: suggestion.recommendations.optimalAssignee,
        storyPoints: suggestion.recommendations.optimalPoints,
        dueDate: suggestion.recommendations.optimalDueDate
      });
      
      alert('✓ AI suggestion applied successfully!');
      navigate(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to apply suggestion');
    }
  };

  const applyAllSuggestions = async () => {
    if (!window.confirm('Apply all AI suggestions? This will update all tasks.')) return;
    
    try {
      for (const suggestion of analysis.suggestions) {
        await updateTask(suggestion.taskId, {
          assignee: suggestion.recommendations.optimalAssignee,
          storyPoints: suggestion.recommendations.optimalPoints,
          dueDate: suggestion.recommendations.optimalDueDate
        });
      }
      
      alert('✓ All AI suggestions applied successfully!');
      navigate(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to apply suggestions');
    }
  };

  if (loading) return <LoadingSpinner message="Loading AI Analysis..." />;

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Project</span>
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">AI Analysis & Optimization</h1>
            <p className="text-dark-300">Intelligent recommendations to optimize your project</p>
          </div>
          
          {analysis && (
            <button
              onClick={applyAllSuggestions}
              className="bg-gradient-to-r from-success-600 to-success-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-success-500 hover:to-success-600 transition-all shadow-lg shadow-success-500/20 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Apply All Suggestions</span>
            </button>
          )}
        </div>

        {analyzing && (
          <div className="card-dark rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500/10 rounded-2xl mb-6 animate-pulse">
              <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Analyzing Project Data...</h3>
            <p className="text-dark-400">AI is processing {tasks.length} tasks and generating optimization recommendations</p>
          </div>
        )}

        {analysis && !analyzing && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="card-dark rounded-2xl p-6">
                <div className="text-sm text-dark-400 mb-2">Risk Reduction Potential</div>
                <div className="text-4xl font-bold text-success-500 mb-1">{analysis.optimizations.totalRiskReduction}%</div>
                <div className="text-xs text-dark-500">Applying all suggestions</div>
              </div>
              
              <div className="card-dark rounded-2xl p-6">
                <div className="text-sm text-dark-400 mb-2">Estimated Time Saved</div>
                <div className="text-4xl font-bold text-primary-500 mb-1">{analysis.optimizations.estimatedTimeSaved}</div>
                <div className="text-xs text-dark-500">From timeline optimization</div>
              </div>
              
              <div className="card-dark rounded-2xl p-6">
                <div className="text-sm text-dark-400 mb-2">Team Efficiency Gain</div>
                <div className="text-4xl font-bold text-warning-500 mb-1">{analysis.optimizations.teamEfficiencyGain}</div>
                <div className="text-xs text-dark-500">Better workload distribution</div>
              </div>
            </div>

            {/* Critical Issues */}
            <div className="bg-gradient-to-r from-danger-900/30 to-danger-800/20 border border-danger-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <svg className="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Critical Issues Detected</span>
              </h3>
              <ul className="space-y-2">
                {analysis.criticalIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-dark-200">
                    <span className="text-danger-500 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">AI Optimization Suggestions</h2>
              
              {analysis.suggestions.map((suggestion, idx) => (
                <div key={idx} className="card-dark rounded-2xl p-6 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{suggestion.taskName}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {suggestion.issues.map((issue, i) => (
                          <span key={i} className="px-3 py-1 bg-warning-500/10 text-warning-500 rounded-lg text-xs border border-warning-500/30">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <div className="text-xs text-dark-400">Confidence</div>
                        <div className="text-lg font-bold text-success-500">{suggestion.impact.confidenceScore}%</div>
                      </div>
                      <button
                        onClick={() => setSelectedSuggestion(selectedSuggestion === idx ? null : idx)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium"
                      >
                        {selectedSuggestion === idx ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {selectedSuggestion === idx && (
                    <div className="border-t border-dark-800 pt-4 mt-4 animate-slide-up">
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        {/* Current State */}
                        <div>
                          <h4 className="text-sm font-semibold text-dark-400 mb-3">Current State</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-dark-300">Assignee:</span>
                              <span className="text-white font-medium">{suggestion.currentAssignee || 'Unassigned'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-300">Story Points:</span>
                              <span className="text-white font-medium">{suggestion.currentPoints}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-300">Due Date:</span>
                              <span className="text-white font-medium">{suggestion.currentDueDate || 'Not set'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Recommended State */}
                        <div>
                          <h4 className="text-sm font-semibold text-success-500 mb-3">AI Recommended</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-dark-300">Assignee:</span>
                              <span className="text-success-500 font-medium">{suggestion.recommendations.optimalAssignee}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-300">Story Points:</span>
                              <span className="text-success-500 font-medium">{suggestion.recommendations.optimalPoints}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-300">Due Date:</span>
                              <span className="text-success-500 font-medium">{suggestion.recommendations.optimalDueDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-dark-900 rounded-xl p-4 mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">AI Reasoning</h4>
                        <p className="text-dark-300 text-sm">{suggestion.recommendations.reasoning}</p>
                      </div>

                      {/* Impact */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-dark-900 rounded-xl p-3 text-center">
                          <div className="text-xs text-dark-400 mb-1">Risk Reduction</div>
                          <div className="text-2xl font-bold text-success-500">-{suggestion.impact.riskReduction}%</div>
                        </div>
                        <div className="bg-dark-900 rounded-xl p-3 text-center">
                          <div className="text-xs text-dark-400 mb-1">Time Saved</div>
                          <div className="text-2xl font-bold text-primary-500">{suggestion.impact.timelineSaved}d</div>
                        </div>
                        <div className="bg-dark-900 rounded-xl p-3 text-center">
                          <div className="text-xs text-dark-400 mb-1">Confidence</div>
                          <div className="text-2xl font-bold text-warning-500">{suggestion.impact.confidenceScore}%</div>
                        </div>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-success-600 to-success-500 text-white rounded-xl hover:from-success-500 hover:to-success-600 transition-all shadow-lg shadow-success-500/20 font-semibold flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Apply This Suggestion</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;

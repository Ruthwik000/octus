import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById } from '../services/projectService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import PlanningTab from '../components/workspace/PlanningTab';
import VisualQATab from '../components/workspace/VisualQATab';
import TestGenerationTab from '../components/workspace/TestGenerationTab';
import InsightsTab from '../components/workspace/InsightsTab';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planning');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
        <p className="text-dark-400">The project you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'planning', label: 'Planning', icon: '📋', description: 'AI-Assisted Planning' },
    { id: 'visual-qa', label: 'Visual QA', icon: '👁️', description: 'Regression Detection' },
    { id: 'test-generation', label: 'Test Generation', icon: '🧪', description: 'AI Test Cases' },
    { id: 'insights', label: 'Insights', icon: '📊', description: 'Release Analytics' }
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-72 bg-dark-900 border-r border-dark-800">
          <div className="p-6 border-b border-dark-800">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">{project.name}</h2>
                <p className="text-sm text-dark-400 mt-1 line-clamp-2">{project.description}</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2 pb-40">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all group ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <div className="flex-1 text-left">
                  <div className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-dark-200 group-hover:text-white'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs ${activeTab === tab.id ? 'text-primary-100' : 'text-dark-500'}`}>
                    {tab.description}
                  </div>
                </div>
                {activeTab === tab.id && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800 bg-dark-900">
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-dark-300">AI Engine Active</span>
              </div>
              <p className="text-xs text-dark-500">Real-time analysis enabled</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-dark-950">
          {activeTab === 'planning' && <PlanningTab projectId={projectId} />}
          {activeTab === 'visual-qa' && <VisualQATab projectId={projectId} />}
          {activeTab === 'test-generation' && <TestGenerationTab projectId={projectId} />}
          {activeTab === 'insights' && <InsightsTab projectId={projectId} />}
        </main>
      </div>
    </div>
  );
};

export default ProjectWorkspace;

const VisualRegressionResults = ({ results }) => {
  if (!results) return null;

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      {results.overall_health && (
        <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl p-6 border border-blue-700">
          <h3 className="text-xl font-bold text-white mb-4">Overall Health</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthColor(results.overall_health.health_score)}`}>
                {results.overall_health.health_score}
              </div>
              <div className="text-sm text-gray-300 mt-1">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">
                {results.overall_health.total_issues}
              </div>
              <div className="text-sm text-gray-300 mt-1">Total Issues</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400">
                {results.overall_health.critical_issues_count}
              </div>
              <div className="text-sm text-gray-300 mt-1">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                results.overall_health.status?.toLowerCase() === 'good' 
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : results.overall_health.status?.toLowerCase() === 'warning'
                  ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}>
                {results.overall_health.status}
              </div>
              <div className="text-sm text-gray-300 mt-1">Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Broken Components */}
      {results.broken_components && results.broken_components.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-red-400">🔴</span>
            Broken Components ({results.broken_components.length})
          </h3>
          <div className="space-y-3">
            {results.broken_components.map((component, idx) => (
              <div key={idx} className="border-l-4 border-red-500 bg-red-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{component.name || component.component}</div>
                <p className="text-sm text-gray-300">{component.description || component.issue}</p>
                {component.severity && (
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(component.severity)}`}>
                    {component.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlapping Elements */}
      {results.overlapping_elements && results.overlapping_elements.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-orange-400">🟠</span>
            Overlapping Elements ({results.overlapping_elements.length})
          </h3>
          <div className="space-y-3">
            {results.overlapping_elements.map((element, idx) => (
              <div key={idx} className="border-l-4 border-orange-500 bg-orange-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{element.elements || element.name}</div>
                <p className="text-sm text-gray-300">{element.description || element.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Issues */}
      {results.layout_issues && results.layout_issues.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">🟡</span>
            Layout Issues ({results.layout_issues.length})
          </h3>
          <div className="space-y-3">
            {results.layout_issues.map((issue, idx) => (
              <div key={idx} className="border-l-4 border-yellow-500 bg-yellow-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{issue.area || issue.name}</div>
                <p className="text-sm text-gray-300">{issue.description || issue.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text Issues */}
      {results.text_issues && results.text_issues.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📝</span>
            Text Issues ({results.text_issues.length})
          </h3>
          <div className="space-y-3">
            {results.text_issues.map((issue, idx) => (
              <div key={idx} className="border-l-4 border-purple-500 bg-purple-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{issue.element || issue.name}</div>
                <p className="text-sm text-gray-300">{issue.description || issue.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Issues */}
      {results.image_issues && results.image_issues.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🖼️</span>
            Image Issues ({results.image_issues.length})
          </h3>
          <div className="space-y-3">
            {results.image_issues.map((issue, idx) => (
              <div key={idx} className="border-l-4 border-pink-500 bg-pink-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{issue.image || issue.name}</div>
                <p className="text-sm text-gray-300">{issue.description || issue.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Contrast Issues */}
      {results.color_contrast_issues && results.color_contrast_issues.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🎨</span>
            Color Contrast Issues ({results.color_contrast_issues.length})
          </h3>
          <div className="space-y-3">
            {results.color_contrast_issues.map((issue, idx) => (
              <div key={idx} className="border-l-4 border-indigo-500 bg-indigo-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{issue.element || issue.name}</div>
                <p className="text-sm text-gray-300">{issue.description || issue.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responsive Issues */}
      {results.responsive_issues && results.responsive_issues.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📱</span>
            Responsive Issues ({results.responsive_issues.length})
          </h3>
          <div className="space-y-3">
            {results.responsive_issues.map((issue, idx) => (
              <div key={idx} className="border-l-4 border-teal-500 bg-teal-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{issue.element || issue.name}</div>
                <p className="text-sm text-gray-300">{issue.description || issue.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accessibility Concerns */}
      {results.accessibility_concerns && results.accessibility_concerns.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>♿</span>
            Accessibility Concerns ({results.accessibility_concerns.length})
          </h3>
          <div className="space-y-3">
            {results.accessibility_concerns.map((concern, idx) => (
              <div key={idx} className="border-l-4 border-red-500 bg-red-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{concern.element || concern.name}</div>
                <p className="text-sm text-gray-300">{concern.description || concern.issue}</p>
                {concern.wcag_level && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-900/50 text-red-300 border border-red-700">
                    WCAG {concern.wcag_level}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Design Inconsistencies */}
      {results.design_inconsistencies && results.design_inconsistencies.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>✨</span>
            Design Inconsistencies ({results.design_inconsistencies.length})
          </h3>
          <div className="space-y-3">
            {results.design_inconsistencies.map((inconsistency, idx) => (
              <div key={idx} className="border-l-4 border-gray-500 bg-gray-700/50 p-4 rounded">
                <div className="font-semibold text-white mb-1">{inconsistency.area || inconsistency.name}</div>
                <p className="text-sm text-gray-300">{inconsistency.description || inconsistency.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive Findings */}
      {results.positive_findings && results.positive_findings.length > 0 && (
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-6 border border-green-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>✅</span>
            Positive Findings ({results.positive_findings.length})
          </h3>
          <div className="space-y-2">
            {results.positive_findings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <p className="text-sm text-gray-300">{finding.description || finding}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>💡</span>
            Recommendations ({results.recommendations.length})
          </h3>
          <div className="space-y-3">
            {results.recommendations.map((rec, idx) => (
              <div key={idx} className={`border-l-4 p-4 rounded ${
                rec.priority === 'high' || rec.priority === 'critical'
                  ? 'border-red-500 bg-red-900/20'
                  : rec.priority === 'medium'
                  ? 'border-yellow-500 bg-yellow-900/20'
                  : 'border-blue-500 bg-blue-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {rec.priority && (
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${
                      rec.priority === 'high' || rec.priority === 'critical'
                        ? 'bg-red-900/50 text-red-300 border-red-700'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                        : 'bg-blue-900/50 text-blue-300 border-blue-700'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  )}
                  <span className="font-semibold text-white">{rec.title || rec.category}</span>
                </div>
                <p className="text-sm text-gray-300">{rec.description || rec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualRegressionResults;

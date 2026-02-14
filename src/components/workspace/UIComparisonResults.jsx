const UIComparisonResults = ({ results }) => {
  if (!results || !results.diff_report) return null;

  const { diff_report, metadata } = results;
  const { summary, visual_regressions, missing_elements, layout_shifts, color_contrast_issues } = diff_report;

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getChangeTypeIcon = (changeType) => {
    switch (changeType?.toLowerCase()) {
      case 'shifted':
        return '↔️';
      case 'size_change':
        return '📏';
      case 'text_change':
        return '📝';
      case 'added':
        return '➕';
      case 'removed':
        return '➖';
      default:
        return '🔄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <div className={`rounded-xl p-6 border-2 ${
          summary.pass_fail_status === 'pass'
            ? 'bg-green-900/30 border-green-700'
            : 'bg-red-900/30 border-red-700'
        }`}>
          <h3 className="text-xl font-bold text-white mb-4">Comparison Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">
                {summary.total_changes}
              </div>
              <div className="text-sm text-gray-300 mt-1">Total Changes</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg inline-block border ${
                summary.severity === 'high'
                  ? 'bg-red-900/50 text-red-300 border-red-700'
                  : summary.severity === 'medium'
                  ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                  : 'bg-green-900/50 text-green-300 border-green-700'
              }`}>
                {summary.severity?.toUpperCase()}
              </div>
              <div className="text-sm text-gray-300 mt-1">Severity</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg inline-block border ${
                summary.pass_fail_status === 'pass'
                  ? 'bg-green-900/50 text-green-300 border-green-700'
                  : 'bg-red-900/50 text-red-300 border-red-700'
              }`}>
                {summary.pass_fail_status?.toUpperCase()}
              </div>
              <div className="text-sm text-gray-300 mt-1">Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {metadata && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-300">Baseline Size:</span>
              <span className="text-gray-400 ml-2">{metadata.baseline_size}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-300">Comparison Size:</span>
              <span className="text-gray-400 ml-2">{metadata.comparison_size}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-300">Tolerance:</span>
              <span className="text-gray-400 ml-2">{metadata.tolerance}%</span>
            </div>
            {metadata.test_description && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-300">Description:</span>
                <span className="text-gray-400 ml-2">{metadata.test_description}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Regressions */}
      {visual_regressions && visual_regressions.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🔍</span>
            Visual Regressions ({visual_regressions.length})
          </h3>
          <div className="space-y-4">
            {visual_regressions.map((regression, idx) => (
              <div key={idx} className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getChangeTypeIcon(regression.change_type)}</span>
                    <div>
                      <h4 className="font-semibold text-white">{regression.element_name}</h4>
                      <span className="text-xs text-gray-400 uppercase">{regression.change_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(regression.severity)}`}>
                    {regression.severity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{regression.description}</p>
                
                <div className="grid grid-cols-2 gap-4 bg-gray-800 rounded-lg p-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Baseline State</div>
                    <div className="text-sm text-gray-200">{regression.baseline_state}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Comparison State</div>
                    <div className="text-sm text-gray-200">{regression.comparison_state}</div>
                  </div>
                </div>

                {regression.coordinates && (
                  <div className="mt-3 text-xs text-gray-400">
                    Position: ({regression.coordinates.x}, {regression.coordinates.y}) | 
                    Size: {regression.coordinates.width}×{regression.coordinates.height}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Elements */}
      {missing_elements && missing_elements.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-red-400">❌</span>
            Missing Elements ({missing_elements.length})
          </h3>
          <div className="space-y-3">
            {missing_elements.map((element, idx) => (
              <div key={idx} className="border-l-4 border-red-500 bg-red-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{element.element_name}</div>
                <p className="text-sm text-gray-300 mb-2">{element.description}</p>
                {element.expected_location && (
                  <div className="text-xs text-gray-400">
                    Expected at: ({element.expected_location.x}, {element.expected_location.y})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Shifts */}
      {layout_shifts && layout_shifts.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📐</span>
            Layout Shifts ({layout_shifts.length})
          </h3>
          <div className="space-y-3">
            {layout_shifts.map((shift, idx) => (
              <div key={idx} className={`border-l-4 p-4 rounded ${
                shift.exceeds_tolerance 
                  ? 'border-orange-500 bg-orange-900/20' 
                  : 'border-blue-500 bg-blue-900/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-white">{shift.element_name}</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      shift.exceeds_tolerance 
                        ? 'bg-orange-900/50 text-orange-300 border-orange-700' 
                        : 'bg-blue-900/50 text-blue-300 border-blue-700'
                    }`}>
                      {shift.shift_percentage}% shift
                    </span>
                    {shift.exceeds_tolerance && (
                      <span className="text-xs text-orange-400 font-semibold">⚠️ Exceeds Tolerance</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Baseline Position</div>
                    <div className="text-gray-200">
                      ({shift.baseline_position?.x}, {shift.baseline_position?.y})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Comparison Position</div>
                    <div className="text-gray-200">
                      ({shift.comparison_position?.x}, {shift.comparison_position?.y})
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Contrast Issues */}
      {color_contrast_issues && color_contrast_issues.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🎨</span>
            Color Contrast Issues ({color_contrast_issues.length})
          </h3>
          <div className="space-y-3">
            {color_contrast_issues.map((issue, idx) => (
              <div key={idx} className="border-l-4 border-purple-500 bg-purple-900/20 p-4 rounded">
                <div className="font-semibold text-white mb-1">{issue.element_name}</div>
                <div className="text-xs text-gray-400 mb-2 uppercase">{issue.issue_type?.replace('_', ' ')}</div>
                <p className="text-sm text-gray-300">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UIComparisonResults;

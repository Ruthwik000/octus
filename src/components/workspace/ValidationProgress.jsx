const ValidationProgress = ({ checks }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-5 h-5 border-3 border-green-400 border-t-transparent rounded-full animate-spin"></div>
        );
      case 'completed':
        return (
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'pending':
        return (
          <div className="w-5 h-5 border-2 border-gray-600 rounded-full"></div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-bold text-white mb-4">Validation Progress</h3>
      <div className="space-y-4">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getStatusIcon(check.status)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{check.title}</div>
              <div className="text-sm text-gray-300">{check.description}</div>
            </div>
            {check.status === 'loading' && (
              <div className="flex-shrink-0">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationProgress;

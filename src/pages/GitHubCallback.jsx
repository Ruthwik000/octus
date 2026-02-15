import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const GitHubCallback = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Completing GitHub authentication...');

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setMessage(`Authentication failed: ${error}`);
            return;
        }

        if (code) {
            if (window.opener) {
                // Send the code back to the main window
                window.opener.postMessage(
                    { type: 'github-oauth-callback', code },
                    window.location.origin
                );
                setStatus('success');
                setMessage('Authentication successful! You can close this window.');

                // Close the window after a short delay
                setTimeout(() => {
                    window.close();
                }, 1500);
            } else {
                setStatus('error');
                setMessage('Error: Original window not found. Please try again.');
            }
        } else {
            setStatus('error');
            setMessage('No authentication code received.');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="flex justify-center mb-4">
                    {status === 'processing' && <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />}
                    {status === 'success' && <CheckCircle2 className="w-12 h-12 text-emerald-500" />}
                    {status === 'error' && <XCircle className="w-12 h-12 text-red-500" />}
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                    {status === 'processing' ? 'Connecting...' :
                        status === 'success' ? 'Connected!' : 'Connection Failed'}
                </h2>
                <p className="text-gray-400 text-sm">{message}</p>
            </div>
        </div>
    );
};

export default GitHubCallback;

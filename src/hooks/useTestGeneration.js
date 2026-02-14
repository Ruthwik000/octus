import { useState, useCallback } from 'react';
import { generateTests, listSuites, deleteSuite, exportSuite } from '../api/testGenApi';

/**
 * Custom hook encapsulating test generation state and actions.
 * Handles loading, errors, suite data, and history.
 */
export function useTestGeneration(projectId = null) {
    const [suite, setSuite] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generate = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                user_story: formData.userStory,
                acceptance_criteria: formData.acceptanceCriteria
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                component_context: formData.component || 'General',
                priority: formData.priority || 'P1',
                target_format: formData.format || 'gherkin',
                project_id: projectId,
                github_repo: formData.githubRepo,
                github_file_path: formData.githubFilePath,
                github_token: formData.githubToken,
            };
            const { data } = await generateTests(payload);
            setSuite(data);
            return data;
        } catch (err) {
            const msg =
                err.response?.data?.detail || err.message || 'Generation failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const loadHistory = useCallback(async () => {
        try {
            const { data } = await listSuites(projectId);
            setHistory(Array.isArray(data) ? data : []);
        } catch {
            // non-critical — silently fail
        }
    }, [projectId]);

    const removeSuite = useCallback(async (suiteId) => {
        await deleteSuite(suiteId);
        setHistory((prev) => prev.filter((s) => s.suite_id !== suiteId));
        if (suite?.suite_id === suiteId) setSuite(null);
    }, [suite]);

    const handleExport = useCallback(async (suiteId, format) => {
        const { data } = await exportSuite(suiteId, format);
        const ext = { json: 'json', feature: 'feature', csv: 'csv', pytest: 'py' }[format] || format;
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${suiteId}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    return {
        suite,
        setSuite,
        history,
        loading,
        error,
        generate,
        loadHistory,
        removeSuite,
        handleExport,
    };
}

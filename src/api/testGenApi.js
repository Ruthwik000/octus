/**
 * API client for the TestGen AI backend.
 * All requests are proxied through Vite (/tests → http://localhost:8000/tests).
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/tests',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000, // AI generation can take up to 2 minutes
});

/**
 * POST /tests/generate
 * @param {{ user_story: string, acceptance_criteria: string[], component_context: string, priority: string, target_format: string, project_id?: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const generateTests = (payload) => api.post('/generate', payload);

/**
 * GET /tests/{suiteId}
 */
export const getSuite = (suiteId) => api.get(`/${suiteId}`);

/**
 * GET /tests/?project_id=xxx
 */
export const listSuites = (projectId = null) =>
  api.get('/', { params: projectId ? { project_id: projectId } : {} });

/**
 * GET /tests/{suiteId}/export/{format}
 */
export const exportSuite = (suiteId, format) =>
  api.get(`/${suiteId}/export/${format}`, { responseType: 'blob' });

/**
 * DELETE /tests/{suiteId}
 */
export const deleteSuite = (suiteId) => api.delete(`/${suiteId}`);

export default api;

const API_BASE = '/api/proxy';

async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;

    const config = {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        },
        credentials: 'include',
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

export const api = {
    login: (usr, pwd) =>
        apiRequest('login', {
            method: 'POST',
            body: { usr, pwd }
        }),

    logout: () =>
        apiRequest('logout', { method: 'POST' }),

    getDashboardSummary: () =>
        apiRequest('dms.api.dashboard.get_dashboard_summary'),

    getDashboardData: (params = {}) => {
        const { start = 0, page_length = 20, filters = {}, fetch_meta = 1 } = params;
        const queryParams = new URLSearchParams({
            start: start.toString(),
            page_length: page_length.toString(),
            fetch_meta: fetch_meta.toString(),
        });

        if (Object.keys(filters).length > 0) {
            queryParams.set('filters', JSON.stringify(filters));
        }

        return apiRequest(`dms.api.dashboard.get_dashboard_data?${queryParams.toString()}`);
    },

    getProjectsDashboard: () =>
        apiRequest('dms.api.dashboard.get_projects_dashboard_data'),
};

export default api;

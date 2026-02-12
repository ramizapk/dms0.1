const API_BASE = '/api/proxy';

async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;

    const defaultHeaders = {
        'Accept': 'application/json',
        ...headers,
    };

    // Only add JSON content type if it's not FormData and not explicitly removed
    if (!(body instanceof FormData) && !headers['Content-Type']) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
        method,
        headers: defaultHeaders,
        credentials: 'include',
    };

    if (body) {
        // If body is FormData, let browser set Content-Type with boundary
        config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        let errorMessage = data.message || 'Request failed';
        let serverMessages = [];

        // Try to parse Frappe _server_messages
        if (data._server_messages) {
            try {
                const messagesList = JSON.parse(data._server_messages);
                serverMessages = messagesList.map(m => {
                    try { return JSON.parse(m); }
                    catch (e) { return { message: m }; }
                });

                if (serverMessages.length > 0) {
                    errorMessage = serverMessages[serverMessages.length - 1].message || errorMessage;
                }
            } catch (e) {
                console.error('Failed to parse server messages', e);
            }
        }

        const error = new Error(errorMessage);
        error.data = data;
        error.serverMessages = serverMessages;
        error.status = response.status;
        throw error;
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
        return apiRequest('dms.api.dashboard.get_dashboard_data', {
            method: 'POST',
            body: {
                start,
                page_length,
                filters,
                fetch_meta
            }
        });
    },

    getProjectsDashboard: () =>
        apiRequest('dms.api.dashboard.get_projects_dashboard_data'),

    getArchiveFull: (params = {}) => {
        const { start = 0, page_length = 20, filters = {} } = params;
        const queryParams = new URLSearchParams({
            start: start.toString(),
            page_length: page_length.toString(),
        });

        if (Object.keys(filters).length > 0) {
            queryParams.set('filters', JSON.stringify(filters));
        }

        return apiRequest(`dms.api.dashboard.get_archive_full?${queryParams.toString()}`);
    },

    getUsers: () => {
        const fields = JSON.stringify([
            "name", "full_name", "email", "mobile_no", "department",
            "designation", "role_profile_name", "enabled", "user_type",
            "creation", "owner", "user_image"
        ]);
        return apiRequest(`api/resource/User?fields=${encodeURIComponent(fields)}`);
    },

    getUser: (userId) => apiRequest(`api/resource/User/${encodeURIComponent(userId)}`),

    updateUser: (userId, data) =>
        apiRequest(`api/resource/User/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            body: data
        }),

    createUser: (userData) =>
        apiRequest('api/resource/User', {
            method: 'POST',
            body: userData
        }),

    getRoleProfiles: () => apiRequest('api/resource/Role Profile'),

    getDepartments: () => apiRequest('api/resource/Department'),

    getDesignations: () => apiRequest('api/resource/Designation'),

    uploadFile: (formData) => {
        return apiRequest('api/method/upload_file', {
            method: 'POST',
            body: formData,
        });
    },
};

export default api;

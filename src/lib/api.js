const API_BASE = '/api/proxy';

async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;

    const defaultHeaders = {
        'Accept': 'application/json',
        ...headers,
    };

    // Only add JSON content type if it's not FormData, not explicitly removed, and not a GET request
    if (!(body instanceof FormData) && !headers['Content-Type'] && method.toUpperCase() !== 'GET') {
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

    updatePassword: (data) =>
        apiRequest('api/method/dms.api.auth.update_password', {
            method: 'POST',
            body: data
        }),

    logout: () =>
        apiRequest('logout', { method: 'POST' }),

    getDashboardSummary: () =>
        apiRequest('dms.api.dashboard.get_dashboard_summary'),

    getDashboardData: (params = {}) => {
        const body = {
            start: 0,
            page_length: 20,
            fetch_meta: 1,
            ...params
        };
        return apiRequest('dms.api.dashboard.get_dashboard_data', {
            method: 'POST',
            body: body
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
        const filters = JSON.stringify([["enabled", "=", "1"]]);
        return apiRequest(`api/resource/User?fields=${encodeURIComponent(fields)}&filters=${encodeURIComponent(filters)}`);
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

    disableUser: (email) =>
        apiRequest(`api/method/dms.api.users.disable_user?name=${encodeURIComponent(email)}`, {
            method: 'GET'
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

    // Documents
    getProjects: () => apiRequest('api/resource/Project?fields=["name","project_name"]'),

    getProject: (name) =>
        apiRequest(`api/method/dms.api.project.get_project?name=${encodeURIComponent(name)}`),

    getProjectManagers: async () => {
        try {
            // Try standard Employee resource first as a robust fallback
            const fields = JSON.stringify(["name", "employee_name"]);
            const response = await apiRequest(`api/resource/Employee?fields=${encodeURIComponent(fields)}&limit_page_length=100`);

            // Transform standard API response to match custom API expected format
            if (response.data) {
                return {
                    message: {
                        success: true,
                        data: response.data.map(emp => ({
                            value: emp.name,
                            label: emp.employee_name || emp.name,
                            employee_id: emp.name,
                            employee_name: emp.employee_name
                        }))
                    }
                };
            }
            return response;
        } catch (error) {
            console.warn('Failed to fetch employees, trying custom endpoint as backup...');
            return apiRequest('dms.api.project.get_project_managers_list');
        }
    },

    createProject: (data) =>
        apiRequest('api/method/dms.api.project.create_project', {
            method: 'POST',
            body: data
        }),

    updateProject: (data) =>
        apiRequest('api/method/dms.api.project.update_project', {
            method: 'POST',
            body: data
        }),

    getProjectParties: (projectName) =>
        apiRequest(`dms.api.documents.get_project_parties?project_name=${encodeURIComponent(projectName)}`),

    getDocumentTypes: () => apiRequest('api/resource/Masar Document Type'),

    createDocument: (data) =>
        apiRequest('api/method/dms.api.documents.create_document', {
            method: 'POST',
            body: data
        }),

    getDocument: (name) =>
        apiRequest(`api/method/dms.api.documents.get_document?name=${encodeURIComponent(name)}`),

    updateDocument: (data) =>
        apiRequest('api/method/dms.api.documents.update_document', {
            method: 'POST',
            body: data
        }),

    // Workflow
    getWorkflowHistory: (doctype, name) =>
        apiRequest(`api/method/dms.api.workflow.get_workflow_history?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`),

    getAllWorkflowStates: () =>
        apiRequest('api/method/dms.api.workflow.get_all_states'),

    getAvailableActions: (doctype, name) =>
        apiRequest(`api/method/dms.api.workflow.get_available_actions?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(name)}`),

    getConsultantSpecialistEngineers: () =>
        apiRequest('api/method/dms.api.workflow.get_consultant_specialist_engineers'),

    applyAction: (data) =>
        apiRequest('api/method/dms.api.workflow.apply_action', {
            method: 'POST',
            body: data
        }),

    // Notifications
    getNotifications: (page = 1, pageSize = 20) =>
        apiRequest(`api/method/dms.api.notifications.get_notifications?page=${page}&page_size=${pageSize}`),

    markAsRead: (notificationId) =>
        apiRequest('api/method/dms.api.notifications.mark_as_read', {
            method: 'POST',
            body: { name: notificationId }
        }),

    markAllAsRead: () =>
        apiRequest('api/method/dms.api.notifications.mark_all_as_read', { method: 'POST' }),

    deleteNotification: (notificationId) =>
        apiRequest('api/method/dms.api.notifications.delete_notification', {
            method: 'POST',
            body: { name: notificationId }
        }),

    // Files
    getFiles: (attachedToName) => {
        const filters = JSON.stringify([["attached_to_name", "=", attachedToName]]);
        const fields = JSON.stringify(["file_url", "file_name", "is_private", "file_type"]); // Added file_type just in case backend supports it, otherwise logic will handle
        return apiRequest(`api/resource/File?filters=${encodeURIComponent(filters)}&fields=${encodeURIComponent(fields)}`);
    },
};

export default api;

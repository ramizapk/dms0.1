'use client';

import { useAuth } from '@/hooks/useAuth';

/**
 * PermissionGate
 * 
 * Conditionally renders content based on user permissions.
 * 
 * @param {string} resource - The resource name (e.g., 'Project', 'Masar Document')
 * @param {string} action - The action to check (e.g., 'create', 'write', 'delete')
 * @param {ReactNode} children - The content to render if permission is granted
 * @param {ReactNode} fallback - Optional content to render if permission is denied
 */
export default function PermissionGate({ resource, action, children, fallback = null }) {
    const { can } = useAuth();

    if (!can(resource, action)) {
        return fallback;
    }

    return <>{children}</>;
}

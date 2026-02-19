'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * WorkspaceGuard
 * 
 * Protects a page or section based on the user's available workspaces.
 * Redirects to dashboard if the user doesn't have the required workspace.
 * 
 * @param {string} workspace - The workspace name to check (e.g., 'المشاريع')
 * @param {ReactNode} children - The content to render
 */
export default function WorkspaceGuard({ workspace, children }) {
    const { hasWorkspace, user, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null); // null = checking

    useEffect(() => {
        // Wait for auth to be ready (user object populated)
        if (!isLoading && user) {
            if (hasWorkspace(workspace)) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                // Optional: Redirect immediately or show access denied
                // router.push('/dashboard'); 
            }
        }
    }, [user, isLoading, hasWorkspace, workspace, router]);

    if (isLoading || isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    You do not have access to the <strong>{workspace}</strong> workspace. Please contact your administrator if you believe this is a mistake.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return <>{children}</>;
}

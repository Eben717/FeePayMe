import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Audit Fees', path: '/dashboard' },
        // { icon: Settings, label: 'Settings', path: '/settings' }, // hidden for now
    ];

    return (
        <div className="flex flex-row h-screen w-full bg-background" style={{ display: 'flex', height: '100vh', width: '100%' }}>
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-border flex flex-col shadow-sm z-10" style={{ width: '16rem', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface)' }}>
                <div className="h-16 flex items-center px-6 border-b border-border" style={{ height: '4rem', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h1 className="text-xl font-bold text-primary tracking-tight" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>FeePayMe<span className="text-secondary" style={{ color: 'var(--secondary)' }}>.</span></h1>
                </div>

                <nav className="flex-1 px-4 py-6 flex flex-col gap-2" style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        const activeStyle = isActive ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' } : { color: 'var(--secondary)' };
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium hover:bg-background cursor-pointer"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left', ...activeStyle }}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-secondary hover:text-danger hover:bg-danger-light rounded-md transition-colors text-sm font-medium cursor-pointer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.625rem 0.75rem', color: 'var(--secondary)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* Header */}
                <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 shadow-sm z-0" style={{ height: '4rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
                    <h2 className="font-semibold text-lg text-main" style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-main)' }}>Audit Fee Management</h2>
                    <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="text-sm text-secondary font-medium" style={{ fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: 500 }}>Welcome, Admin</span>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm" style={{ width: '2rem', height: '2rem', borderRadius: '9999px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                            A
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-auto p-8 bg-background" style={{ flex: 1, overflow: 'auto', padding: '2rem', backgroundColor: 'var(--background)' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;

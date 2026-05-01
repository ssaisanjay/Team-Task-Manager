"use client";

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { LayoutDashboard, FolderKanban, LogOut, CheckCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || pathname.startsWith('/auth')) return null;

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>
          <CheckCircle size={24} />
          TaskSync
        </Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500,
            color: pathname === '/dashboard' ? 'var(--accent)' : 'var(--text-secondary)'
          }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/projects" style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500,
            color: pathname.startsWith('/projects') ? 'var(--accent)' : 'var(--text-secondary)'
          }}>
            <FolderKanban size={18} /> Projects
          </Link>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
          <span className="badge badge-in_progress" style={{ fontSize: '0.65rem' }}>{user.role}</span>
        </div>
        <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px' }} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}

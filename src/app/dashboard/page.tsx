"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { LayoutDashboard, CheckCircle, Clock, ListTodo, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><div className="spinner" style={{ width: '40px', height: '40px' }} /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="heading-1">Dashboard</h1>
        <p className="text-muted">Welcome back, {user?.name}. Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-4">
        <div className="card glass" style={{ borderTop: '4px solid var(--accent)' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Total Tasks</span>
            <ListTodo size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats?.totalTasks || 0}</div>
        </div>

        <div className="card glass" style={{ borderTop: '4px solid var(--warning)' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>In Progress</span>
            <Clock size={20} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats?.inProgressTasks || 0}</div>
        </div>

        <div className="card glass" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Completed</span>
            <CheckCircle size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats?.doneTasks || 0}</div>
        </div>

        <div className="card glass" style={{ borderTop: '4px solid var(--danger)' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Overdue</span>
            <AlertCircle size={20} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats?.overdueTasks || 0}</div>
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
         <h2 className="heading-2">Recent Activity</h2>
         <div className="card glass" style={{ padding: '40px', textAlign: 'center' }}>
            <p className="text-muted">No recent activity to display. Start by checking your <a href="/projects" style={{color: 'var(--accent)'}}>projects</a>.</p>
         </div>
      </div>
    </div>
  );
}

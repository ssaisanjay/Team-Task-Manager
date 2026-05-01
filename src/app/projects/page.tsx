"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { FolderKanban, Plus, Users, LayoutList } from 'lucide-react';

export default function ProjectsList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Project Modal State
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (user) {
      // Debounce search
      const timer = setTimeout(() => fetchData(searchQuery), 300);
      return () => clearTimeout(timer);
    }
  }, [user, searchQuery]);

  async function fetchData(query: string = '') {
    try {
      const [projRes, userRes] = await Promise.all([
        fetch('/api/projects'),
        user?.role === 'ADMIN' ? fetch(`/api/users?search=${encodeURIComponent(query)}`) : Promise.resolve(null)
      ]);
      
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.projects);
      }
      
      if (userRes && userRes.ok) {
        const data = await userRes.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
          memberIds: selectedMembers
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
        setSelectedMembers([]);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><div className="spinner" style={{ width: '40px', height: '40px' }} /></div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="heading-1">Projects</h1>
          <p className="text-muted">Manage your team's projects and boards</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-3">
        {projects.map(project => (
          <Link href={`/projects/${project.id}`} key={project.id}>
            <div className="card glass" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--accent-light)', padding: '12px', borderRadius: '12px', color: 'var(--accent)' }}>
                  <FolderKanban size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{project.name}</h3>
              </div>
              <p className="text-muted" style={{ flexGrow: 1, marginBottom: '24px' }}>
                {project.description || 'No description provided.'}
              </p>
              <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Users size={16} /> {project.members?.length || 0} Members
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <LayoutList size={16} /> {project.tasks?.length || 0} Tasks
                </div>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }} className="card glass">
            <FolderKanban size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No projects yet</h3>
            <p className="text-muted">Create a project to start managing tasks.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="heading-2" style={{ marginBottom: '24px' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Project Name</label>
                <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Description</label>
                <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} rows={3} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Assign Members</label>
                <input 
                  type="text" 
                  placeholder="Search users by name or email..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  style={{ marginBottom: '12px' }}
                />
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px' }}>
                  {users.length === 0 ? <p className="text-muted" style={{fontSize: '0.8rem'}}>No users found matching your search.</p> : users.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedMembers.includes(u.id)} onChange={() => toggleMember(u.id)} />
                      <span>{u.name} ({u.email})</span>
                    </label>
                  ))}
                </div>
                {selectedMembers.length > 0 && (
                   <p className="text-muted" style={{fontSize: '0.8rem', marginTop: '8px'}}>
                     {selectedMembers.length} member(s) selected
                   </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Plus, GripVertical, CheckCircle, Clock, CircleDashed } from 'lucide-react';

type Task = { id: string; title: string; description: string; status: string; assigneeId?: string; assignee?: { name: string } };

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [searchAssignee, setSearchAssignee] = useState('');

  useEffect(() => {
    fetchProject();
  }, [resolvedParams.id]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          projectId: resolvedParams.id,
          assigneeId: newTaskAssignee || null,
        }),
      });
      if (res.ok) {
        setShowTaskModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskAssignee('');
        fetchProject();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setProject((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: Task) => t.id === taskId ? { ...t, status: newStatus } : t)
      }));

      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      fetchProject(); // Revert on error
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><div className="spinner" style={{ width: '40px', height: '40px' }} /></div>;
  if (!project) return <div>Project not found or access denied.</div>;

  const tasksByStatus = {
    TODO: project.tasks.filter((t: Task) => t.status === 'TODO'),
    IN_PROGRESS: project.tasks.filter((t: Task) => t.status === 'IN_PROGRESS'),
    DONE: project.tasks.filter((t: Task) => t.status === 'DONE'),
  };

  const getStatusIcon = (status: string) => {
    if (status === 'TODO') return <CircleDashed size={18} color="var(--text-secondary)" />;
    if (status === 'IN_PROGRESS') return <Clock size={18} color="var(--warning)" />;
    return <CheckCircle size={18} color="var(--success)" />;
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: '8px' }}>{project.name}</h1>
          <p className="text-muted">{project.description}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'flex-start' }}>
        {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map(status => (
          <div key={status} className="card glass" style={{ padding: '16px', background: 'rgba(30, 41, 59, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              {getStatusIcon(status)}
              <h3 style={{ fontWeight: 600 }}>{status.replace('_', ' ')}</h3>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', marginLeft: 'auto' }}>
                {tasksByStatus[status].length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '150px' }}
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                   e.preventDefault();
                   const taskId = e.dataTransfer.getData('taskId');
                   if (taskId) updateTaskStatus(taskId, status);
                 }}>
              {tasksByStatus[status].map((task: Task) => (
                <div key={task.id} 
                     draggable 
                     onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                     className="card" 
                     style={{ padding: '16px', cursor: 'grab', background: 'var(--bg-secondary)' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{task.title}</h4>
                    <GripVertical size={16} color="var(--text-secondary)" />
                  </div>
                  {task.description && <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>{task.description}</p>}
                  
                  <div className="flex-between" style={{ marginTop: '12px' }}>
                    {task.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {task.assignee.name}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unassigned</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="heading-2" style={{ marginBottom: '24px' }}>Add New Task</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Task Title</label>
                <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Description</label>
                <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} rows={3} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Assignee</label>
                <input 
                  type="text" 
                  placeholder="Search members to assign..." 
                  value={searchAssignee} 
                  onChange={e => setSearchAssignee(e.target.value)} 
                  style={{ marginBottom: '12px' }}
                />
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="assignee" checked={newTaskAssignee === ''} onChange={() => setNewTaskAssignee('')} />
                    <span>Unassigned</span>
                  </label>
                  {project.members
                    .filter((m: any) => m.user.name.toLowerCase().includes(searchAssignee.toLowerCase()) || m.user.email.toLowerCase().includes(searchAssignee.toLowerCase()))
                    .map((m: any) => (
                    <label key={m.user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="assignee" checked={newTaskAssignee === m.user.id} onChange={() => setNewTaskAssignee(m.user.id)} />
                      <span>{m.user.name} ({m.user.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { id } = await params;
    
    const project: any = await Project.findById(id).populate('members', '_id name email').lean();
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isMember = project.members.some((m: any) => m._id.toString() === user.id);
    if (user.role !== 'ADMIN' && !isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tasks: any[] = await Task.find({ project: project._id }).populate('assignee', '_id name').lean();

    const formattedProject = {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      members: project.members.map((m: any) => ({ user: { id: m._id.toString(), name: m.name, email: m.email } })),
      tasks: tasks.map(t => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        projectId: t.project.toString(),
        assigneeId: t.assignee ? t.assignee._id.toString() : null,
        assignee: t.assignee ? { id: t.assignee._id.toString(), name: t.assignee.name } : null
      }))
    };

    return NextResponse.json({ project: formattedProject });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

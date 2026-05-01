import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getUserFromToken } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { id } = await params;
    const { status, assigneeId } = await req.json();

    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    if (user.role !== 'ADMIN' && task.assignee?.toString() !== user.id) {
       const project = await Project.findById(task.project);
       if (!project || !project.members.includes(user.id as any)) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }

    if (status) task.status = status;
    if (user.role === 'ADMIN' && assigneeId !== undefined) {
      task.assignee = assigneeId === '' ? undefined : assigneeId;
    }

    await task.save();

    return NextResponse.json({ task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

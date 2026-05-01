import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });

  try {
    await dbConnect();
    const { title, description, status, dueDate, projectId, assigneeId } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and projectId are required' }, { status: 400 });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'TODO',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      project: projectId,
      assignee: assigneeId || undefined,
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    let projects;
    if (user.role === 'ADMIN') {
      projects = await Project.find().populate('members', '_id name email').lean();
    } else {
      projects = await Project.find({ members: user.id }).populate('members', '_id name email').lean();
    }
    
    // Fetch task counts manually since Mongoose doesn't auto-include virtuals easily like Prisma
    const projectsWithTasks = await Promise.all(projects.map(async (p: any) => {
      const tasks = await Task.find({ project: p._id }).lean();
      return {
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        members: p.members.map((m: any) => ({ user: { id: m._id.toString(), name: m.name, email: m.email } })),
        tasks: tasks.map(t => ({ id: t._id.toString() }))
      };
    }));

    return NextResponse.json({ projects: projectsWithTasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });

  try {
    await dbConnect();
    const { name, description, memberIds } = await req.json();

    if (!name) return NextResponse.json({ error: 'Project name required' }, { status: 400 });

    const members = memberIds || [];
    if (!members.includes(user.id)) {
      members.push(user.id);
    }

    const project = await Project.create({
      name,
      description,
      members
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

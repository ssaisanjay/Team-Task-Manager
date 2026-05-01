import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const filter = user.role === 'ADMIN' ? {} : { assignee: user.id };
    
    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'TODO' }),
      Task.countDocuments({ ...filter, status: 'IN_PROGRESS' }),
      Task.countDocuments({ ...filter, status: 'DONE' }),
      Task.countDocuments({
        ...filter,
        status: { $ne: 'DONE' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

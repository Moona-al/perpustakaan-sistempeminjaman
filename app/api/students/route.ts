import { NextResponse } from 'next/server';
import { getStudents, upsertStudent } from '@/lib/database';

export async function GET() {
  try {
    const students = await getStudents();
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, name, class: className } = body;

    if (!username || !name || !className) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const student = {
      username: username.toLowerCase().trim(),
      name:     name.trim(),
      class:    className,
    };

    await upsertStudent(student);
    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Error saving student:', error);
    return NextResponse.json({ error: 'Failed to save student' }, { status: 500 });
  }
}

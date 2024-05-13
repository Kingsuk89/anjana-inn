import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { formatZodError } from '@/lib/zodError';
import { feedbackSchema } from '@/validation/feedback/feedbackShema';
import { db } from '@/lib/db';
import { authOptions, CustomSession } from '../auth/[...nextauth]/options';

export async function POST(req: NextRequest) {
  try {
    const session: CustomSession | null = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Please login' }, { status: 401 });
    }
    const body = await req.json();
    const { error, data } = feedbackSchema.safeParse(body);

    if (error) {
      return NextResponse.json(
        { message: 'Invalid request', error: formatZodError(error) },
        { status: 400 }
      );
    }
    // TODO: add session id
    await db.feedback.create({
      data: {
        message: data.message,
        rating: data.rating,
        auther_id: session?.user?.id?.toString()!
      }
    });
    return NextResponse.json({ message: 'you feedback successfully submit thank you 😊' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Internal server issue' }, { status: 500 });
  }
}
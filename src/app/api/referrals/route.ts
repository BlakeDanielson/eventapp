import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { name, eventId } = body;

  const referral = await prisma.referral.create({
    data: {
      name,
      eventId,
    },
  });

  return NextResponse.json(referral);
}

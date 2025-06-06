import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for creating answers
const createAnswerSchema = z.object({
  content: z.string().min(5, "Answer must be at least 5 characters").max(2000, "Answer too long"),
  answererName: z.string().min(1, "Name is required").max(100, "Name too long"),
  answererEmail: z.string().email("Valid email required"),
  isOfficial: z.boolean().optional().default(true),
});

// GET /api/events/[id]/questions/[questionId]/answers - Get all answers for a question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id: eventId, questionId } = await params;

    // Verify question exists and belongs to the event
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        eventId: eventId,
        isApproved: true,
        isHidden: false
      }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Get all answers for the question
    const answers = await prisma.answer.findMany({
      where: { questionId },
      orderBy: [
        { isOfficial: 'desc' }, // Official answers first
        { createdAt: 'asc' }    // Then chronological order
      ]
    });

    return NextResponse.json({ answers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/questions/[questionId]/answers - Create a new answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id: eventId, questionId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = createAnswerSchema.parse(body);

    // Verify question exists and belongs to the event
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        eventId: eventId,
        isApproved: true,
        isHidden: false
      }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Verify event exists and check if user is authorized to answer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, userId: true, status: true }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Determine if this is an official organizer answer
    const isOfficialAnswer = event.userId === validatedData.answererEmail || validatedData.isOfficial;

    // Create the answer
    const answer = await prisma.answer.create({
      data: {
        questionId,
        content: validatedData.content,
        answererName: validatedData.answererName,
        answererEmail: validatedData.answererEmail,
        isOfficial: isOfficialAnswer,
      }
    });

    // Mark question as answered if this is the first answer
    const answerCount = await prisma.answer.count({
      where: { questionId }
    });

    if (answerCount === 1) {
      await prisma.question.update({
        where: { id: questionId },
        data: { isAnswered: true }
      });
    }

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to create answer" },
      { status: 500 }
    );
  }
} 
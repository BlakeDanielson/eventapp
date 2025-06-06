import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for creating questions
const createQuestionSchema = z.object({
  content: z.string().min(10, "Question must be at least 10 characters").max(1000, "Question too long"),
  askerName: z.string().min(1, "Name is required").max(100, "Name too long"),
  askerEmail: z.string().email("Valid email required"),
  isPublic: z.boolean().optional().default(true),
});

// GET /api/events/[id]/questions - Get all questions for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    // Verify event exists and is accessible
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, userId: true }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get questions with answers and upvote info
    const questions = await prisma.question.findMany({
      where: {
        eventId,
        isApproved: true,
        isHidden: false,
        ...(event.status === 'private' ? {} : { isPublic: true }) // Show all questions for private events
      },
      include: {
        answers: {
          orderBy: { createdAt: 'asc' }
        },
        upvotedBy: userEmail ? {
          where: { voterEmail: userEmail }
        } : false,
        _count: {
          select: { upvotedBy: true }
        }
      },
      orderBy: [
        { upvotes: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform questions to include upvote status for current user
    const questionsWithUpvoteStatus = questions.map(question => ({
      ...question,
      hasUserUpvoted: userEmail ? question.upvotedBy.length > 0 : false,
      upvotes: question._count.upvotedBy,
      upvotedBy: undefined,
      _count: undefined
    }));

    return NextResponse.json({ questions: questionsWithUpvoteStatus });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/questions - Create a new question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = createQuestionSchema.parse(body);

    // Verify event exists and is accessible
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, date: true }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event hasn't ended (allow questions until 24 hours after event)
    const eventEndTime = new Date(event.date);
    eventEndTime.setHours(eventEndTime.getHours() + 24);
    
    if (new Date() > eventEndTime) {
      return NextResponse.json(
        { error: "Questions are no longer being accepted for this event" },
        { status: 400 }
      );
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        eventId,
        content: validatedData.content,
        askerName: validatedData.askerName,
        askerEmail: validatedData.askerEmail,
        isPublic: validatedData.isPublic,
      },
      include: {
        answers: true,
        _count: {
          select: { upvotedBy: true }
        }
      }
    });

    return NextResponse.json({
      question: {
        ...question,
        upvotes: question._count.upvotedBy,
        hasUserUpvoted: false,
        _count: undefined
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
} 
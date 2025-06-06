import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for upvoting questions
const upvoteQuestionSchema = z.object({
  voterEmail: z.string().email("Valid email required"),
  voterName: z.string().optional(),
});

// PATCH /api/events/[id]/questions/[questionId] - Upvote/downvote a question
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id: eventId, questionId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'upvote') {
      const validatedData = upvoteQuestionSchema.parse(body);

      // Check if user already upvoted this question
      const existingUpvote = await prisma.questionUpvote.findUnique({
        where: {
          questionId_voterEmail: {
            questionId,
            voterEmail: validatedData.voterEmail
          }
        }
      });

      if (existingUpvote) {
        // Remove upvote (toggle off)
        await prisma.questionUpvote.delete({
          where: { id: existingUpvote.id }
        });

        // Update question upvote count
        const question = await prisma.question.update({
          where: { id: questionId },
          data: {
            upvotes: {
              decrement: 1
            }
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
            hasUserUpvoted: false,
            upvotes: question._count.upvotedBy,
            _count: undefined
          }
        });
      } else {
        // Add upvote
        await prisma.questionUpvote.create({
          data: {
            questionId,
            voterEmail: validatedData.voterEmail,
            voterName: validatedData.voterName
          }
        });

        // Update question upvote count
        const question = await prisma.question.update({
          where: { id: questionId },
          data: {
            upvotes: {
              increment: 1
            }
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
            hasUserUpvoted: true,
            upvotes: question._count.upvotedBy,
            _count: undefined
          }
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/questions/[questionId] - Hide/delete a question (organizer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id: eventId, questionId } = await params;
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email required" },
        { status: 400 }
      );
    }

    // Verify user is the event organizer
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userEmail // Assuming userId stores the organizer's email
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Unauthorized - only event organizers can moderate questions" },
        { status: 403 }
      );
    }

    // Hide the question instead of deleting it
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { isHidden: true },
      include: {
        answers: true,
        _count: {
          select: { upvotedBy: true }
        }
      }
    });

    return NextResponse.json({
      message: "Question hidden successfully",
      question: {
        ...question,
        upvotes: question._count.upvotedBy,
        _count: undefined
      }
    });
  } catch (error) {
    console.error("Error hiding question:", error);
    return NextResponse.json(
      { error: "Failed to hide question" },
      { status: 500 }
    );
  }
} 
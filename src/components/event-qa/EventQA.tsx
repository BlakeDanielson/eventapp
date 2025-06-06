"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Loader2 } from "lucide-react";
import { QuestionItem } from "./QuestionItem";
import { QuestionForm } from "./QuestionForm";
import { useEventQA } from "./hooks/useEventQA";

interface EventQAProps {
  eventId: string;
  isOrganizer?: boolean;
  userEmail?: string;
  userName?: string;
  eventDate: Date | string;
  qaEnabled?: boolean;
}

export function EventQA({ 
  eventId, 
  isOrganizer = false, 
  userEmail, 
  userName, 
  eventDate, 
  qaEnabled = true 
}: EventQAProps) {
  const {
    questions,
    isLoading,
    isSubmitting,
    handleSubmitQuestion,
    handleUpvote,
    handleAnswer,
    handleHide,
  } = useEventQA(eventId, userEmail, userName);

  if (!qaEnabled) {
    return (
      <Card className="bg-black/40 border-white/[0.08]">
        <CardContent className="p-6">
          <div className="text-center text-white/60">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Q&A is not enabled for this event</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/40 border-white/[0.08]">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Questions & Answers
            </div>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Question Form */}
      <QuestionForm
        onSubmit={handleSubmitQuestion}
        isSubmitting={isSubmitting}
        userEmail={userEmail}
        eventDate={eventDate}
      />

      {/* Questions List */}
      {isLoading ? (
        <Card className="bg-black/40 border-white/[0.08]">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2 text-white/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading questions...</span>
            </div>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="bg-black/40 border-white/[0.08]">
          <CardContent className="p-6">
            <div className="text-center text-white/60">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              isOrganizer={isOrganizer}
              userEmail={userEmail}
              userName={userName}
              onUpvote={handleUpvote}
              onAnswer={handleAnswer}
              onHide={handleHide}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
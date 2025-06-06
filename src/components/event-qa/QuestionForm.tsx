"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare } from "lucide-react";

interface QuestionFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  isSubmitting: boolean;
  userEmail?: string;
  eventDate: Date | string;
}

export function QuestionForm({ onSubmit, isSubmitting, userEmail, eventDate }: QuestionFormProps) {
  const [questionContent, setQuestionContent] = useState("");

  const handleSubmit = async () => {
    const success = await onSubmit(questionContent);
    if (success) {
      setQuestionContent("");
    }
  };

  // Convert eventDate to Date object if it's a string
  const eventDateObj = eventDate instanceof Date ? eventDate : new Date(eventDate);
  const isEventToday = new Date().toDateString() === eventDateObj.toDateString();
  const canSubmitQuestions = userEmail && (isEventToday || new Date() < eventDateObj);

  if (!canSubmitQuestions) {
    return (
      <Card className="bg-black/40 border-white/[0.08] mb-6">
        <CardContent className="p-6">
          <div className="text-center text-white/60">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>
              {!userEmail 
                ? "Please sign in to ask questions" 
                : "Q&A is available on the day of the event"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-white/[0.08] mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="What would you like to know about this event?"
          value={questionContent}
          onChange={(e) => setQuestionContent(e.target.value)}
          className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!questionContent.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Ask Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
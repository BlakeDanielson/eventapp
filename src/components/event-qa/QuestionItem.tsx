"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  Send,
  EyeOff,
  Crown
} from "lucide-react";
import { QuestionWithAnswers } from "@/types/event";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuestionItemProps {
  question: QuestionWithAnswers;
  isOrganizer: boolean;
  userEmail?: string;
  userName?: string;
  onUpvote: (questionId: string) => Promise<void>;
  onAnswer: (questionId: string, content: string) => Promise<void>;
  onHide: (questionId: string) => Promise<void>;
}

export function QuestionItem({
  question,
  isOrganizer,
  userEmail,
  userName,
  onUpvote,
  onAnswer,
  onHide
}: QuestionItemProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleAnswer = async () => {
    if (!answerContent.trim() || !userEmail || !userName) return;

    setIsSubmittingAnswer(true);
    try {
      await onAnswer(question.id, answerContent);
      setAnswerContent("");
      setIsAnswering(false);
      toast.success("Answer posted successfully!");
    } catch (error) {
      toast.error("Failed to post answer");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleUpvote = async () => {
    if (!userEmail || isUpvoting) return;

    setIsUpvoting(true);
    try {
      await onUpvote(question.id);
    } catch (error) {
      toast.error("Failed to upvote question");
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleHide = async () => {
    if (!isOrganizer) return;
    
    try {
      await onHide(question.id);
      toast.success("Question hidden successfully");
    } catch (error) {
      toast.error("Failed to hide question");
    }
  };

  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${question.askerName}`} />
              <AvatarFallback className="bg-white/[0.05] text-white">
                {question.askerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{question.askerName}</p>
                <p className="text-xs text-white/50">
                  {new Date(question.createdAt).toLocaleDateString()}
                </p>
                {question.isAnswered && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Answered
                  </Badge>
                )}
              </div>
              <p className="text-white/90 mt-2">{question.content}</p>
            </div>
          </div>
          {isOrganizer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHide}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Question Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={cn(
                "text-white/70 hover:text-blue-400",
                question.hasUserUpvoted && "text-blue-400"
              )}
            >
              <ThumbsUp
                className={cn(
                  "w-4 h-4 mr-1",
                  question.hasUserUpvoted && "fill-current"
                )}
              />
              {question.upvotes}
            </Button>
            
            {(isOrganizer || userEmail) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAnswering(!isAnswering)}
                className="text-white/70 hover:text-emerald-400"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Answer
              </Button>
            )}
          </div>
        </div>

        {/* Answer Form */}
        {isAnswering && (
          <div className="space-y-3 mb-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
            <Textarea
              placeholder="Write your answer..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAnswering(false);
                  setAnswerContent("");
                }}
                className="text-white/70"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAnswer}
                disabled={!answerContent.trim() || isSubmittingAnswer}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-1" />
                {isSubmittingAnswer ? "Posting..." : "Post Answer"}
              </Button>
            </div>
          </div>
        )}

        {/* Answers */}
        {question.answers && question.answers.length > 0 && (
          <div className="space-y-3">
            <Separator className="bg-white/[0.08]" />
            <div className="space-y-3">
              {question.answers.map((answer) => (
                <div key={answer.id} className="flex space-x-3">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${answer.answererName}`} />
                    <AvatarFallback className="bg-white/[0.05] text-white text-xs">
                      {answer.answererName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{answer.answererName}</p>
                      {answer.isOfficial && (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                          <Crown className="w-3 h-3 mr-1" />
                          Organizer
                        </Badge>
                      )}
                      <p className="text-xs text-white/50">
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-white/80 text-sm">{answer.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
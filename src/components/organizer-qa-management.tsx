"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  Send,
  EyeOff,
  Crown,
  MessageCircle
} from "lucide-react";
import { QuestionWithAnswers, CreateAnswerRequest } from "@/types/event";

import { toast } from "sonner";

interface OrganizerQAManagementProps {
  eventId: string;
  organizerEmail: string;
  organizerName: string;
}

interface QuestionItemProps {
  question: QuestionWithAnswers;
  onAnswer: (questionId: string, content: string) => Promise<void>;
  onHide: (questionId: string) => Promise<void>;
}

function QuestionManagementItem({
  question,
  onAnswer,
  onHide
}: QuestionItemProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const handleAnswer = async () => {
    if (!answerContent.trim()) return;

    setIsSubmittingAnswer(true);
    try {
      await onAnswer(question.id, answerContent);
      setAnswerContent("");
      setIsAnswering(false);
      toast.success("Answer posted successfully!");
    } catch {
      toast.error("Failed to post answer");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleHide = async () => {
    try {
      await onHide(question.id);
      toast.success("Question hidden successfully");
    } catch {
      toast.error("Failed to hide question");
    }
  };

  const hasOrganizerAnswer = question.answers?.some(answer => answer.isOfficial);

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
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white">{question.askerName}</p>
                <p className="text-xs text-white/50">
                  {new Date(question.createdAt).toLocaleDateString()}
                </p>
                {hasOrganizerAnswer ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Answered
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Needs Answer
                  </Badge>
                )}
                <Badge variant="outline" className="border-white/20 text-white/70">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {question.upvotes} upvotes
                </Badge>
              </div>
              <p className="text-white/90 mt-2">{question.content}</p>
              <p className="text-xs text-white/40 mt-1">{question.askerEmail}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!hasOrganizerAnswer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnswering(!isAnswering)}
                className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Answer
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleHide}
              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Answer Form */}
        {isAnswering && (
          <div className="space-y-3 mb-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
            <Textarea
              placeholder="Write your official answer..."
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
                {isSubmittingAnswer ? "Posting..." : "Post Official Answer"}
              </Button>
            </div>
          </div>
        )}

        {/* Existing Answers */}
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
                          Official
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

export function OrganizerQAManagement({ 
  eventId, 
  organizerEmail, 
  organizerName 
}: OrganizerQAManagementProps) {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('all');

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle answering
  const handleAnswer = async (questionId: string, content: string) => {
    try {
      const answerData: CreateAnswerRequest = {
        content: content.trim(),
        answererName: organizerName,
        answererEmail: organizerEmail
      };

      const response = await fetch(`/api/events/${eventId}/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answerData)
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(prev =>
          prev.map(q =>
            q.id === questionId
              ? {
                  ...q,
                  answers: [...(q.answers || []), data.answer],
                  isAnswered: true
                }
              : q
          )
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post answer");
      }
    } catch (error) {
      console.error("Error posting answer:", error);
      throw error;
    }
  };

  // Handle hiding questions
  const handleHide = async (questionId: string) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/questions/${questionId}?userEmail=${encodeURIComponent(organizerEmail)}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to hide question");
      }
    } catch (error) {
      console.error("Error hiding question:", error);
      throw error;
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    if (filter === 'answered') {
      return question.answers?.some(answer => answer.isOfficial);
    }
    if (filter === 'unanswered') {
      return !question.answers?.some(answer => answer.isOfficial);
    }
    return true;
  });

  const stats = {
    total: questions.length,
    answered: questions.filter(q => q.answers?.some(a => a.isOfficial)).length,
    unanswered: questions.filter(q => !q.answers?.some(a => a.isOfficial)).length,
    totalUpvotes: questions.reduce((sum, q) => sum + q.upvotes, 0)
  };

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-white/[0.08]">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <p className="text-white/50">Loading Q&A management...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/[0.08]">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-sm">Total Questions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-white/[0.08]">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.answered}</p>
              <p className="text-white/50 text-sm">Answered</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-white/[0.08]">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.unanswered}</p>
              <p className="text-white/50 text-sm">Need Answers</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-white/[0.08]">
          <CardContent className="pt-6">
            <div className="text-center">
              <ThumbsUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalUpvotes}</p>
              <p className="text-white/50 text-sm">Total Upvotes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="bg-black/40 border-white/[0.08]">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-white">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
            Q&A Management
          </CardTitle>
          <CardDescription className="text-white/50">
            Manage questions from your event attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-blue-600 text-white' : 'border-white/20 text-white/70'}
            >
              All Questions ({stats.total})
            </Button>
            <Button
              variant={filter === 'unanswered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unanswered')}
              className={filter === 'unanswered' ? 'bg-yellow-600 text-white' : 'border-white/20 text-white/70'}
            >
              Need Answers ({stats.unanswered})
            </Button>
            <Button
              variant={filter === 'answered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('answered')}
              className={filter === 'answered' ? 'bg-green-600 text-white' : 'border-white/20 text-white/70'}
            >
              Answered ({stats.answered})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card className="bg-black/40 border-white/[0.08]">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">
                {filter === 'all' ? 'No questions yet' : 
                 filter === 'unanswered' ? 'No unanswered questions' : 
                 'No answered questions'}
              </p>
              <p className="text-white/30 text-sm">
                {filter === 'all' ? 'Questions will appear here when attendees ask them.' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionManagementItem
              key={question.id}
              question={question}
              onAnswer={handleAnswer}
              onHide={handleHide}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
import { useState, useEffect, useCallback } from "react";
import { QuestionWithAnswers } from "@/types/event";
import { toast } from "sonner";

export function useEventQA(eventId: string, userEmail?: string, userName?: string) {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const handleSubmitQuestion = async (questionContent: string): Promise<boolean> => {
    if (!questionContent.trim() || !userEmail || !userName) return false;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: questionContent,
          askerEmail: userEmail,
          askerName: userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit question');
      }

      const newQuestion = await response.json();
      setQuestions(prev => [newQuestion, ...prev]);
      toast.success("Question submitted successfully!");
      
      return true;
    } catch (error: unknown) {
      console.error('Error submitting question:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit question");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: string) => {
    if (!userEmail) return;

    try {
      const response = await fetch(`/api/events/${eventId}/questions/${questionId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upvote question');
      }

      const updatedQuestion = await response.json();
      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId 
            ? { 
                ...q, 
                upvotes: updatedQuestion.upvotes, 
                hasUserUpvoted: updatedQuestion.hasUserUpvoted 
              }
            : q
        )
      );
    } catch (error) {
      console.error('Error upvoting question:', error);
      throw error;
    }
  };

  const handleAnswer = async (questionId: string, content: string) => {
    if (!userEmail || !userName) return;

    try {
      const response = await fetch(`/api/events/${eventId}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          answererEmail: userEmail,
          answererName: userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post answer');
      }

      const newAnswer = await response.json();
      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId 
            ? { 
                ...q, 
                answers: [...(q.answers || []), newAnswer],
                isAnswered: true 
              }
            : q
        )
      );
    } catch (error) {
      console.error('Error posting answer:', error);
      throw error;
    }
  };

  const handleHide = async (questionId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to hide question');
      }

      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error hiding question:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    isLoading,
    isSubmitting,
    handleSubmitQuestion,
    handleUpvote,
    handleAnswer,
    handleHide,
    refetchQuestions: fetchQuestions,
  };
} 
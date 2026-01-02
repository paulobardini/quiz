"use client";

import { useState, useEffect } from "react";

export default function QuizCard({
  question,
  options,
  progress,
  onAnswer,
  isSubmitting = false,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const progressPercentage = (progress.answered / progress.total) * 100;

  // Reset do estado quando a pergunta muda
  useEffect(() => {
    setSelectedOptionId(null);
    setIsProcessing(false);
  }, [question?.id]);

  // Reset isProcessing quando isSubmitting voltar a false
  useEffect(() => {
    if (!isSubmitting) {
      setIsProcessing(false);
    }
  }, [isSubmitting]);

  const handleOptionClick = (optionId) => {
    // Prevenir cliques duplicados
    if (isSubmitting || isProcessing) return;
    
    setIsProcessing(true);
    setSelectedOptionId(optionId);
    
    // Pequeno delay visual antes de processar
    setTimeout(() => {
      onAnswer(optionId);
    }, 150);
  };

  return (
    <div className="page-card quiz-card" style={{ maxWidth: "680px", width: "100%", borderRadius: "26px", padding: "56px 48px", textAlign: "left", position: "relative", overflow: "hidden" }}>
      {isSubmitting && (
        <div className="quiz-loading-overlay" style={{ display: "flex" }}>
          <div className="quiz-loading-spinner-wrapper">
            <div className="quiz-loading-spinner" />
            <div className="quiz-loading-pulse" />
          </div>
        </div>
      )}
      
      <div className={isSubmitting ? "quiz-content-blurred" : ""} style={{ position: "relative", zIndex: 1 }}>
        <div className="quiz-progress-wrapper">
          <div className="quiz-progress-header">
            <span className="quiz-progress-percent">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <h2 className="quiz-question">
          {question.prompt}
        </h2>

        <div className="quiz-options">
          {options
            .sort((a, b) => {
              if (a.position !== undefined && b.position !== undefined) {
                return a.position - b.position;
              }
              return 0;
            })
            .map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={isSubmitting || isProcessing}
                  className={`quiz-option ${isSelected ? "quiz-option-selected" : ""} ${isSubmitting || isProcessing ? "quiz-option-disabled" : ""}`}
                >
                  {option.label}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}


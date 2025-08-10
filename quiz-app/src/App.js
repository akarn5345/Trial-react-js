import React, { useState, useEffect } from "react";
import "./App.css";

// Import exam data
import upscData from "./data/upscData";
import sscData from "./data/sscData";
import bankData from "./data/bankData";

export default function App() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 min = 600 seconds
  const [submitted, setSubmitted] = useState(false);

  const exams = [
    { id: "upsc", title: "UPSC Prelims", description: "Civil Services Prelims" },
    { id: "ssc", title: "SSC CGL", description: "Staff Selection Commission" },
    { id: "bank", title: "Bank PO", description: "Banking exams" }
  ];

  // Load selected exam questions
  useEffect(() => {
    if (selectedExam) {
      let data = [];
      if (selectedExam === "upsc") data = upscData;
      else if (selectedExam === "ssc") data = sscData;
      else if (selectedExam === "bank") data = bankData;
      setQuestions(data);
      setAnswers({});
      setTimeLeft(600);
      setSubmitted(false);
    }
  }, [selectedExam]);

  // Timer
  useEffect(() => {
    if (!selectedExam || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedExam, timeLeft, submitted]);

  // Handle option select (can still change answers anytime before submit)
  const handleOptionChange = (qIndex, optionIndex) => {
    if (submitted) return; // Disable changes after submit
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex
    }));
  };

  // Handle submission
  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Score calculation
  const score = submitted
    ? questions.reduce((acc, q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswerId = q.answerId;
      const userOption = q.options.find(opt => opt.optionId === userAnswer)?.text;
      const correctOption = q.options.find(opt => opt.optionId === correctAnswerId)?.text;
      console.log(`Q${idx + 1}: userAnswer=${userAnswer}, userOption=${userOption}, correctAnswerId=${correctAnswerId}, correctOption=${correctOption}`);
      return acc + (userAnswer !== undefined && userOption === correctOption ? 1 : 0);
    }, 0)
    : null;

  // Total possible score (number of answered questions)
  const totalAnswered = submitted
    ? Object.keys(answers).length
    : 0;

  // Format timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Exam selection screen
  if (!selectedExam) {
    return (
      <div className="exam-selection">
        <h2>Choose Exam Category</h2>
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="exam-card"
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "10px",
              background: "#fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
          >
            <h3 style={{ margin: "0 0 5px" }}>{exam.title}</h3>
            <p style={{ margin: "0 0 10px", color: "#0e0e0e81" }}>
              {exam.description}
            </p>
            <button onClick={() => setSelectedExam(exam.id)}>Open</button>
          </div>
        ))}
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="quiz-container">
      <h1>{exams.find((e) => e.id === selectedExam)?.title}</h1>
      <div className="timer">Time Taken: {formatTime(600 - timeLeft)}</div>

      {submitted ? (
        <div className="results">
          <h2>Exam Finished!</h2>
          <p>
            Your Score: {score} / {questions.length} <br /><br />
            Answered: {totalAnswered} Wrong: {totalAnswered - score}
          </p>

          {questions.map((q, index) => (
            <div key={q.id || index} className="question-card">
              <p>
                <strong>Q{index + 1}:</strong> {q.question}
              </p>
              {q.options.map((option, i) => {
                const isSelected = answers[index] === option.optionId;
                const isCorrect = q.answerId === option.optionId;
                let labelClass = "option";
                console.log(`Q${index + 1} - Option ${option.optionId}: isSelected=${isSelected}, isCorrect=${isCorrect}, userAnswer=${answers[index]}, correctAnswerId=${q.answerId}`);

                if (isCorrect) {
                  labelClass += " correct"; // green for correct answer
                  console.log(`Q${index + 1}: Option ${option.optionId} is correct`);
                } else if (isSelected && !isCorrect) {
                  labelClass += " wrong"; // red for wrong chosen answer
                  console.log(`Q${index + 1}: Option ${option.optionId} is wrong and selected`);
                } else {
                  console.log(`Q${index + 1}: Option ${option.optionId} is neither`);
                }

                return (
                  <label key={i} className={labelClass}>
                    <input
                      type="radio"
                      name={`q${index}`}
                      value={option.optionId}
                      checked={isSelected}
                      disabled // disable after submit
                      readOnly
                    />
                    {option.text}
                  </label>
                );
              })}
            </div>
          ))}

          <button onClick={() => setSelectedExam(null)}>Go Back</button>
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setTimeLeft(600);
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {questions.map((q, index) => (
            <div key={q.id || index} className="question-card">
              <p>
                <strong>Q{index + 1}:</strong> {q.question}
              </p>
              {q.options.map((option, i) => (
                <label key={i} className="option">
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option.optionId}
                    checked={answers[index] === option.optionId}
                    onChange={() => handleOptionChange(index, option.optionId)}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          ))}
          <button className="submit-btn" onClick={handleSubmit}>
            Submit Exam
          </button>
        </>
      )}
    </div>
  );
}
// Triggering GitHub Pages deploy

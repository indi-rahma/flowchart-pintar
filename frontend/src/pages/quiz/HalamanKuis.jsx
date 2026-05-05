import { useEffect, useState } from "react";
import MCQQuiz from "./KuisMCQ";
import KuisDragAndDrop from "./KuisDragAndDrop";

const API_URL = "http://localhost:5000";

function HalamanKuis({ moduleId, onFinish }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [dndItems, setDndItems] = useState([]);
  const [isDndCorrect, setIsDndCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const activeQuestion = questions[activeIndex];

  const isDndType = (type) => type === "drag_drop" || type === "dnd";

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setQuiz(null);
        setQuestions([]);
        setActiveIndex(0);
        setSelectedAnswer("");
        setDndItems([]);
        setIsDndCorrect(false);
        setScore(0);
        setFeedback(null);

        const quizRes = await fetch(`${API_URL}/api/quizzes/module/${moduleId}`);

        if (!quizRes.ok) {
          throw new Error("Quiz belum tersedia.");
        }

        const quizData = await quizRes.json();
        setQuiz(quizData);

        const questionRes = await fetch(
          `${API_URL}/api/quiz-questions?quizId=${quizData.id}`
        );

        if (!questionRes.ok) {
          throw new Error("Gagal mengambil soal quiz.");
        }

        const questionData = await questionRes.json();
        setQuestions(Array.isArray(questionData) ? questionData : []);
      } catch (err) {
        console.error("FETCH QUIZ ERROR:", err);
        showFeedback("error", "Quiz belum tersedia 😭");
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) fetchQuiz();
  }, [moduleId]);

  useEffect(() => {
    const fetchDndItems = async () => {
      if (!activeQuestion || !isDndType(activeQuestion.type)) {
        setDndItems([]);
        setIsDndCorrect(false);
        return;
      }

      try {
        setIsDndCorrect(false);

        const res = await fetch(
          `${API_URL}/api/quiz-dnd-items?questionId=${activeQuestion.id}`
        );

        if (!res.ok) {
          throw new Error("Gagal mengambil item drag & drop.");
        }

        const data = await res.json();
        setDndItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("FETCH DND ITEMS ERROR:", err);
        setDndItems([]);
        showFeedback("error", "Item drag & drop gagal dimuat 😭");
      }
    };

    fetchDndItems();
  }, [activeQuestion]);

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback(null);
    }, 2200);

    return () => clearTimeout(timer);
  }, [feedback]);

  const saveQuizResult = async (finalScore) => {
    if (!quiz || !userId) return;

    const passingScore = Number(quiz.passing_score || 75);
    const isPass = finalScore >= passingScore ? 1 : 0;

    const res = await fetch(`${API_URL}/api/user-quiz-results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        quiz_id: quiz.id,
        score: finalScore,
        is_pass: isPass,
      }),
    });

    if (!res.ok) {
      throw new Error("Gagal menyimpan hasil quiz.");
    }
  };

  const handleNextQuestion = async () => {
    if (!activeQuestion || saving) return;

    let point = 0;

    if (activeQuestion.type === "mcq") {
      if (!selectedAnswer) {
        showFeedback("error", "Pilih jawaban dulu yaa 🍼");
        return;
      }

      const isCorrect =
        String(selectedAnswer).trim().toUpperCase() ===
        String(activeQuestion.correct_answer).trim().toUpperCase();

      if (!isCorrect) {
        showFeedback("error", "Jawaban belum tepat 😭 coba lagi yaa");
        return;
      }

      point = 1;
      showFeedback("success", "Benarrr 🎉");
    }

    if (isDndType(activeQuestion.type)) {
      if (!isDndCorrect) {
        showFeedback("error", "Urutan drag & drop belum benar yaa 🧩");
        return;
      }

      point = 1;
      showFeedback("success", "Urutannya sudah benar 🎉");
    }

    const nextScore = score + point;
    const isLastQuestion = activeIndex >= questions.length - 1;

    if (!isLastQuestion) {
      setTimeout(() => {
        setScore(nextScore);
        setSelectedAnswer("");
        setIsDndCorrect(false);
        setFeedback(null);
        setActiveIndex((prev) => prev + 1);
      }, 600);
      return;
    }

    try {
      setSaving(true);

      const finalScore = questions.length
        ? Math.round((nextScore / questions.length) * 100)
        : 0;

      await saveQuizResult(finalScore);
      await onFinish();
    } catch (err) {
      console.error("SUBMIT QUIZ ERROR:", err);
      showFeedback("error", "Gagal menyimpan quiz 😭");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={emptyStyle}>Memuat quiz...</div>;
  }

  if (!quiz || !activeQuestion) {
    return <div style={emptyStyle}>Quiz belum tersedia.</div>;
  }

  return (
    <div style={quizContainerStyle}>
      <div style={quizHeaderStyle}>
        <div>
          <h3 style={quizTitleStyle}>
            {activeQuestion.type === "mcq"
              ? "Quiz Pilihan Ganda"
              : "Drag & Drop"}
          </h3>
          <p style={quizSubtitleStyle}>
            Soal {activeIndex + 1} dari {questions.length}
          </p>
        </div>

        <div style={scoreBadgeStyle}>
          Skor:{" "}
          {questions.length
            ? Math.round((score / questions.length) * 100)
            : 0}
        </div>
      </div>

      {feedback && (
        <div
          style={{
            ...feedbackStyle,
            background: feedback.type === "success" ? "#dcfce7" : "#fee2e2",
            color: feedback.type === "success" ? "#166534" : "#991b1b",
            borderColor: feedback.type === "success" ? "#86efac" : "#fecaca",
          }}
        >
          <span style={feedbackIconStyle}>
            {feedback.type === "success" ? "✅" : "⚠️"}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      <div style={quizBodyStyle}>
        {activeQuestion.type === "mcq" ? (
          <MCQQuiz
            data={activeQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
          />
        ) : (
          <KuisDragAndDrop
            data={activeQuestion}
            items={dndItems}
            onCorrectChange={setIsDndCorrect}
          />
        )}
      </div>

      <div style={quizFooterStyle}>
        <button
          onClick={handleNextQuestion}
          disabled={saving}
          style={{
            ...primaryButtonStyle,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving
            ? "Menyimpan..."
            : activeIndex >= questions.length - 1
            ? "Selesai & Lanjut →"
            : "Soal Selanjutnya →"}
        </button>
      </div>
    </div>
  );
}

const quizContainerStyle = {
  width: "100%",
  minHeight: "560px",
  background: "#fff",
  borderRadius: "18px",
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
};

const quizHeaderStyle = {
  padding: "16px 20px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const quizTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "18px",
};

const quizSubtitleStyle = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: "13px",
};

const scoreBadgeStyle = {
  background: "#eef2ff",
  color: "#4338ca",
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const feedbackStyle = {
  margin: "14px 20px 0",
  padding: "13px 16px",
  borderRadius: "14px",
  border: "1px solid",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
};

const feedbackIconStyle = {
  fontSize: "18px",
};

const quizBodyStyle = {
  flex: 1,
  overflow: "auto",
};

const quizFooterStyle = {
  padding: "14px 20px",
  background: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
  textAlign: "right",
};

const primaryButtonStyle = {
  border: "none",
  background: "#22c55e",
  color: "#fff",
  padding: "11px 18px",
  borderRadius: "12px",
  fontWeight: 800,
};

const emptyStyle = {
  minHeight: "320px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
};

export default HalamanKuis;
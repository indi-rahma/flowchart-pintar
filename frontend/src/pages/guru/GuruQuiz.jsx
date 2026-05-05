import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DndForm from "./quiz/DndForm";
import McqForm from "./quiz/McqForm";

function GuruQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const moduleId = Number(id);
  const API_BASE = "http://localhost:5000";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quiz, setQuiz] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(75);
  const [quizType, setQuizType] = useState("mcq");
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  const [builderMode, setBuilderMode] = useState("choose");

  const [questions, setQuestions] = useState([]);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  const [mcqForm, setMcqForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    image: null,
    option_a_image: null,
    option_b_image: null,
    option_c_image: null,
    option_d_image: null,
  });

  const [dndQuestion, setDndQuestion] = useState("");
  const [dndQuestionId, setDndQuestionId] = useState(null);
  const [isSavingDndQuestion, setIsSavingDndQuestion] = useState(false);

  const [dndItems, setDndItems] = useState([]);
  const [isSavingDndItem, setIsSavingDndItem] = useState(false);
  const [dndItemForm, setDndItemForm] = useState({
    text: "",
    correct_order: 1,
    node_type: "process",
  });

  const quizReady = useMemo(() => !!quiz?.id, [quiz]);

  const getImageUrl = (path) => {
    if (!path) return "";
    return `${API_BASE}/uploads/${path}`;
  };

  const resetMcqForm = () => {
    setMcqForm({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      image: null,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null,
    });
  };

  const safeJson = async (res) => {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  };

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/quizzes?moduleId=${moduleId}`);
      const data = await safeJson(res);

      const q = Array.isArray(data) ? data[0] : data;
      setQuiz(q);

      if (!q) {
        setQuestions([]);
        return;
      }

      setQuizType(q.quiz_type || "mcq");
      setBuilderMode("choose");

      const qRes = await fetch(`${API_BASE}/api/quiz-questions?quizId=${q.id}`);
      const qData = await safeJson(qRes);

      setQuestions(Array.isArray(qData) ? qData : []);
    } catch (err) {
      console.error(err);
      setError("Gagal load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    try {
      setIsCreatingQuiz(true);

      const res = await fetch(`${API_BASE}/api/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: moduleId,
          title,
          description,
          passing_score: passingScore,
          quiz_type: quizType,
        }),
      });

      const data = await safeJson(res);

      setQuiz(data);
      setBuilderMode("choose");
    } catch (err) {
      console.error(err);
      alert("Gagal membuat quiz");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const buildMcqFormData = () => {
    const formData = new FormData();

    formData.append("quiz_id", quiz.id);
    formData.append("question", mcqForm.question);
    formData.append("option_a", mcqForm.option_a);
    formData.append("option_b", mcqForm.option_b);
    formData.append("option_c", mcqForm.option_c);
    formData.append("option_d", mcqForm.option_d);
    formData.append("correct_answer", mcqForm.correct_answer);

    if (mcqForm.image) formData.append("image", mcqForm.image);
    if (mcqForm.option_a_image) {
      formData.append("option_a_image", mcqForm.option_a_image);
    }
    if (mcqForm.option_b_image) {
      formData.append("option_b_image", mcqForm.option_b_image);
    }
    if (mcqForm.option_c_image) {
      formData.append("option_c_image", mcqForm.option_c_image);
    }
    if (mcqForm.option_d_image) {
      formData.append("option_d_image", mcqForm.option_d_image);
    }

    return formData;
  };

  const handleSaveMcqQuestion = async (e) => {
    e.preventDefault();

    if (!quizReady) {
      alert("Quiz belum tersedia");
      return;
    }

    try {
      setIsSavingQuestion(true);

      const formData = buildMcqFormData();

      const res = await fetch(`${API_BASE}/api/quiz-questions`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Gagal simpan soal");
      }

      await fetchQuizData();
      resetMcqForm();
      setBuilderMode("builder");
      setQuizType("mcq");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan soal MCQ");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleUpdateMcqQuestion = async (e, questionId) => {
    e.preventDefault();

    if (!questionId) {
      alert("ID soal tidak ditemukan");
      return;
    }

    try {
      setIsSavingQuestion(true);

      const formData = buildMcqFormData();

      const res = await fetch(`${API_BASE}/api/quiz-questions/${questionId}`, {
        method: "PUT",
        body: formData,
      });

      const responseText = await res.text();
      console.log("UPDATE RESPONSE:", responseText);

      if (!res.ok) {
        throw new Error(responseText || "Gagal update soal");
      }

      await fetchQuizData();
      resetMcqForm();
      setBuilderMode("builder");
      setQuizType("mcq");
    } catch (err) {
      console.error("UPDATE MCQ FRONTEND ERROR:", err);
      alert("Gagal update soal MCQ: " + err.message);
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleSaveDndQuestion = async (e) => {
    e.preventDefault();

    if (!quizReady) {
      alert("Quiz belum tersedia");
      return;
    }

    if (!dndQuestion.trim()) {
      alert("Pertanyaan DND wajib diisi");
      return;
    }

    try {
      setIsSavingDndQuestion(true);

      const res = await fetch(`${API_BASE}/api/quiz-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quiz.id,
          question: dndQuestion,
          type: "dnd",
        }),
      });

      const data = await safeJson(res);
      console.log("DND QUESTION RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat pertanyaan DND");
      }

      const newId =
        data.id ||
        data.insertId ||
        data.question_id ||
        data.questionId ||
        data.data?.id ||
        data.data?.insertId;

      if (!newId) {
        alert("Pertanyaan masuk database, tapi backend tidak mengirim ID. Cek console DND QUESTION RESPONSE.");
        return;
      }

      setDndQuestionId(newId);
      setDndItems([]);
      setDndItemForm((prev) => ({
        text: "",
        correct_order: Number(prev.correct_order) + 1,
        node_type: "process",
      }));
    } catch (err) {
      console.error(err);
      alert("Gagal membuat pertanyaan DND: " + err.message);
    } finally {
      setIsSavingDndQuestion(false);
    }
  };

  const handleSaveDndItem = async (e) => {
    e.preventDefault();

    if (!dndQuestionId) {
      alert("Buat pertanyaan DND dulu");
      return;
    }

    try {
      setIsSavingDndItem(true);

      const res = await fetch(`${API_BASE}/api/quiz-dnd-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: dndQuestionId,
          text: dndItemForm.text,
          correct_order: Number(dndItemForm.correct_order),
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Gagal simpan node DND");
      }

      setDndItems((prev) => [...prev, data]);

      setDndItemForm((prev) => ({
        text: "",
        correct_order: Number(prev.correct_order) + 1,
      }));
    } finally {
      setIsSavingDndItem(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

  const selectedType = quizType;

  return (
    <div style={styles.page}>
      <style>{animationStyles}</style>

      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Kelola Quiz</h1>
          <p style={styles.subtitle}>
            Buat quiz MCQ atau Drag & Drop dengan flow editor.
          </p>
        </div>

        <button type="button" style={styles.backModuleBtn} onClick={() => navigate(-1)}>
          ← Kembali
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {!quiz ? (
        <form onSubmit={handleCreateQuiz} style={styles.createCard}>
          <div>
            <h2 style={styles.cardTitle}>Buat Quiz Baru</h2>
            <p style={styles.cardSubtitle}>
              Pilih tipe quiz awal. Setelah quiz dibuat, kamu bisa masuk ke builder.
            </p>
          </div>

          <input
            style={styles.input}
            placeholder="Judul quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            style={styles.textarea}
            placeholder="Deskripsi quiz"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            style={styles.input}
            type="number"
            min="0"
            max="100"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            placeholder="Passing score"
          />

          <div style={styles.chooseWrap}>
            <button
              type="button"
              onClick={() => setQuizType("mcq")}
              style={{
                ...styles.bigChooseCard,
                ...(quizType === "mcq" ? styles.activeChooseCard : {}),
              }}
            >
              <span style={styles.chooseIcon}>📝</span>
              <strong>MCQ</strong>
              <small>Pilihan ganda</small>
            </button>

            <button
              type="button"
              onClick={() => setQuizType("dnd")}
              style={{
                ...styles.bigChooseCard,
                ...(quizType === "dnd" ? styles.activeChooseCard : {}),
              }}
            >
              <span style={styles.chooseIcon}>🧩</span>
              <strong>DND</strong>
              <small>Drag & Drop flowchart</small>
            </button>
          </div>

          <button type="submit" style={styles.primaryBtn} disabled={isCreatingQuiz}>
            {isCreatingQuiz ? "Membuat Quiz..." : "✨ Buat Quiz"}
          </button>
        </form>
      ) : (
        <>
          {builderMode === "choose" ? (
            <div style={styles.builderChoose}>
              <div style={styles.builderHeader}>
                <h2 style={styles.cardTitle}>Pilih Jenis Kuis yang Ingin Anda Buat</h2>
                <p style={styles.cardSubtitle}>
                  Mau tambah soal pilihan ganda atau flowchart drag & drop?
                </p>
              </div>

              <div style={styles.chooseWrap}>
                <button
                  type="button"
                  onClick={() => {
                    setQuizType("mcq");
                    setBuilderMode("builder");
                  }}
                  style={styles.bigChooseCard}
                >
                  <span style={styles.chooseIcon}>📝</span>
                  <strong>Tambah MCQ</strong>
                  <small>Buat soal pilihan ganda</small>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuizType("dnd");
                    setBuilderMode("builder");
                  }}
                  style={styles.bigChooseCard}
                >
                  <span style={styles.chooseIcon}>🧩</span>
                  <strong>Tambah DND</strong>
                  <small>Buat soal flowchart</small>
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setBuilderMode("choose")}
                style={styles.backBtn}
              >
                ← Pilih lagi
              </button>

              {selectedType === "mcq" ? (
                <McqForm
                  mcqForm={mcqForm}
                  setMcqForm={setMcqForm}
                  getImageUrl={getImageUrl}
                  questions={questions}
                  isSavingQuestion={isSavingQuestion}
                  handleSaveMcqQuestion={handleSaveMcqQuestion}
                  handleUpdateMcqQuestion={handleUpdateMcqQuestion}
                />
              ) : (
                <DndForm
                  dndQuestion={dndQuestion}
                  setDndQuestion={setDndQuestion}
                  dndQuestionId={dndQuestionId}
                  dndItemForm={dndItemForm}
                  setDndItemForm={setDndItemForm}
                  dndItems={dndItems}
                  isSavingDndQuestion={isSavingDndQuestion}
                  isSavingDndItem={isSavingDndItem}
                  handleSaveDndQuestion={handleSaveDndQuestion}
                  handleSaveDndItem={handleSaveDndItem}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 40,
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(250,204,21,0.28), transparent 34%), linear-gradient(135deg, #fffbeb, #f8fafc)",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#422006",
  },

  topBar: {
    marginBottom: 28,
    padding: 28,
    borderRadius: 28,
    background: "linear-gradient(135deg, #facc15, #f59e0b, #f97316)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 22px 45px rgba(245, 158, 11, 0.32)",
    animation: "fadeUp 0.45s ease both",
  },

  eyebrow: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#78350f",
  },

  title: {
    margin: 0,
    fontSize: 36,
    fontWeight: 900,
    color: "#422006",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#713f12",
    fontSize: 14,
  },

  backModuleBtn: {
    padding: "12px 16px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.55)",
    background: "rgba(255,255,255,0.35)",
    color: "#422006",
    fontWeight: 900,
    cursor: "pointer",
    transition: "0.25s ease",
  },

  createCard: {
    maxWidth: 760,
    margin: "0 auto",
    padding: 28,
    borderRadius: 28,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(251,191,36,0.4)",
    boxShadow: "0 18px 45px rgba(120,53,15,0.10)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    animation: "fadeUp 0.5s ease both",
  },

  builderChoose: {
    padding: 28,
    borderRadius: 28,
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(251,191,36,0.4)",
    boxShadow: "0 18px 45px rgba(120,53,15,0.10)",
    animation: "fadeUp 0.5s ease both",
  },

  builderHeader: {
    marginBottom: 20,
  },

  cardTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
    color: "#422006",
  },

  cardSubtitle: {
    margin: "6px 0 0",
    color: "#92400e",
    fontSize: 14,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #fcd34d",
    background: "#fffbeb",
    outline: "none",
    color: "#422006",
    fontSize: 14,
    transition: "0.25s ease",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #fcd34d",
    background: "#fffbeb",
    minHeight: 100,
    outline: "none",
    color: "#422006",
    fontSize: 14,
    resize: "vertical",
    transition: "0.25s ease",
  },

  primaryBtn: {
    marginTop: 8,
    padding: "15px 18px",
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #f59e0b, #f97316)",
    color: "white",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 25px rgba(249,115,22,0.32)",
    transition: "0.25s ease",
  },

  chooseWrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 8,
  },

  bigChooseCard: {
    padding: 30,
    borderRadius: 24,
    border: "1px solid #fde68a",
    background: "linear-gradient(180deg, #ffffff, #fffbeb)",
    boxShadow: "0 12px 28px rgba(120,53,15,0.10)",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
    textAlign: "center",
    transition: "all 0.25s ease",
    color: "#422006",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },

  activeChooseCard: {
    border: "2px solid #f59e0b",
    background: "linear-gradient(135deg, #fef3c7, #fffbeb)",
    boxShadow: "0 16px 34px rgba(245,158,11,0.24)",
  },

  chooseIcon: {
    fontSize: 42,
    marginBottom: 4,
  },

  backBtn: {
    marginBottom: 20,
    padding: "11px 16px",
    borderRadius: 999,
    border: "1px solid #f59e0b",
    background: "#fff7ed",
    color: "#92400e",
    fontWeight: 900,
    cursor: "pointer",
    transition: "0.25s ease",
    boxShadow: "0 8px 18px rgba(245,158,11,0.16)",
  },

  errorBox: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 16,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 800,
  },
};

const animationStyles = `
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

button:hover {
  transform: translateY(-3px);
  filter: brightness(1.03);
}

input:focus,
textarea:focus,
select:focus {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.16);
  background: #ffffff !important;
}

@media (max-width: 900px) {
  .dummy {}
}
`;

export default GuruQuiz;
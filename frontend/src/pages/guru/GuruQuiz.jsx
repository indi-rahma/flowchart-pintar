import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DndForm from "./quiz/DndForm";
import McqForm from "./quiz/McqForm";
import { API_BASE } from "../config";

function GuruQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const moduleId = Number(id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(75);
  const [quizType, setQuizType] = useState("mcq");
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isAttachingQuizId, setIsAttachingQuizId] = useState(null);

  const [builderMode, setBuilderMode] = useState("list");

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

  const quizReady = useMemo(() => !!selectedQuiz?.id, [selectedQuiz]);

  const safeJson = async (res) => {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  };

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

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/quizzes?moduleId=${moduleId}`);
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Gagal load quiz");
      }

      const quizList = Array.isArray(data) ? data : [];
      setQuizzes(quizList);

      if (selectedQuiz?.id) {
        const stillExists = quizList.find(
          (q) => String(q.id) === String(selectedQuiz.id)
        );
        if (stillExists) {
          setSelectedQuiz(stillExists);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Gagal load quiz");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsByQuiz = async (quizItem) => {
    if (!quizItem?.id) return;

    try {
      const qRes = await fetch(
        `${API_BASE}/api/quiz-questions?quizId=${quizItem.id}`
      );
      const qData = await safeJson(qRes);

      setQuestions(Array.isArray(qData) ? qData : []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Judul quiz wajib diisi");
      return;
    }

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

      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat quiz");
      }

      setTitle("");
      setDescription("");
      setPassingScore(75);
      setQuizType("mcq");

      await fetchQuizData();
      alert("Quiz berhasil dibuat ✅");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal membuat quiz");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleSelectQuiz = async (quizItem) => {
    setSelectedQuiz(quizItem);
    setQuizType(quizItem.quiz_type || "mcq");
    setBuilderMode("builder");
    setDndQuestionId(null);
    setDndQuestion("");
    setDndItems([]);
    resetMcqForm();

    await fetchQuestionsByQuiz(quizItem);
  };

  const handleAttachQuizToModule = async (quizItem) => {
  if (!quizItem?.id) return;

  try {
    setIsAttachingQuizId(quizItem.id);

    const qRes = await fetch(
      `${API_BASE}/api/quiz-questions?quizId=${quizItem.id}`
    );
    const qData = await safeJson(qRes);

    if (!qRes.ok) {
      throw new Error(qData.message || "Gagal mengecek jumlah soal quiz");
    }

    const questionList = Array.isArray(qData) ? qData : [];

    if (questionList.length === 0) {
      alert("Quiz ini belum punya soal. Tambahkan 1 soal dulu ya.");
      return;
    }

    if (questionList.length > 1) {
      alert(
        "Quiz ini punya lebih dari 1 soal. Kalau mau pretest 1 soal, buat quiz baru khusus pretest lalu isi 1 soal saja."
      );
      return;
    }

    const res = await fetch(`${API_BASE}/api/module-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
body: JSON.stringify({
  module_id: moduleId,
  title: `Yuk Latihan!: ${quizItem.title || quizItem.quiz_title || "Quiz"}`,
  type: "quiz",
  content_text: "Kerjakan quiz ini sebelum mulai materi.",
  quiz_id: quizItem.id,
  order_index: 0,
  is_locked: 0,
}),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      throw new Error(data.message || "Gagal memasukkan quiz ke modul");
    }

    alert("Quiz 1 soal berhasil dimasukkan ke daftar materi ✅");
  } catch (err) {
    console.error(err);
    alert(err.message || "Gagal memasukkan quiz ke modul");
  } finally {
    setIsAttachingQuizId(null);
  }
};

  const buildMcqFormData = () => {
    const formData = new FormData();

    formData.append("quiz_id", selectedQuiz.id);
    formData.append("question", mcqForm.question);
    formData.append("option_a", mcqForm.option_a);
    formData.append("option_b", mcqForm.option_b);
    formData.append("option_c", mcqForm.option_c);
    formData.append("option_d", mcqForm.option_d);
    formData.append("correct_answer", mcqForm.correct_answer);
    formData.append("type", "mcq");

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
      alert("Pilih quiz dulu");
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

      await fetchQuestionsByQuiz(selectedQuiz);
      resetMcqForm();
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

      if (!res.ok) {
        throw new Error(responseText || "Gagal update soal");
      }

      await fetchQuestionsByQuiz(selectedQuiz);
      resetMcqForm();
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
      alert("Pilih quiz dulu");
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
          quiz_id: selectedQuiz.id,
          question: dndQuestion,
          type: "dnd",
        }),
      });

      const data = await safeJson(res);

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
        alert("Pertanyaan masuk database, tapi backend tidak mengirim ID.");
        return;
      }

      setDndQuestionId(newId);
      setDndItems([]);
      await fetchQuestionsByQuiz(selectedQuiz);
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
          node_type: dndItemForm.node_type || "process",
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Gagal simpan node DND");
      }

      setDndItems((prev) => [...prev, data]);

      setDndItemForm((prev) => ({
        ...prev,
        text: "",
        correct_order: Number(prev.correct_order) + 1,
        node_type: "process",
      }));
    } finally {
      setIsSavingDndItem(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <style>{animationStyles}</style>

      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Kelola Quiz</h1>
          <p style={styles.subtitle}>
            Buat quiz MCQ atau Drag & Drop. Setiap quiz bisa dimasukkan ke modul
            satu per satu.
          </p>
        </div>

        <button
          type="button"
          style={styles.backModuleBtn}
          onClick={() => navigate(-1)}
        >
          ← Kembali
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleCreateQuiz} style={styles.createCard}>
        <div>
          <h2 style={styles.cardTitle}>Buat Quiz Baru</h2>
          <p style={styles.cardSubtitle}>
            Buat quiz terpisah. Misalnya: Pretest MCQ, Latihan DND, atau Quiz
            Akhir.
          </p>
        </div>

        <input
          name="quiz-title"
          style={styles.input}
          placeholder="Judul quiz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          name="quiz-description"
          style={styles.textarea}
          placeholder="Deskripsi quiz"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          name="passing-score"
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

      <section style={styles.quizListSection}>
        <h2 style={styles.cardTitle}>Daftar Quiz Modul Ini</h2>

        {quizzes.length === 0 ? (
          <div style={styles.emptyBox}>Belum ada quiz di modul ini.</div>
        ) : (
          <div style={styles.quizGrid}>
            {quizzes.map((quizItem) => (
              <article key={quizItem.id} style={styles.quizCard}>
                <div>
                  <span style={styles.quizBadge}>
                    {(quizItem.quiz_type || "mcq").toUpperCase()}
                  </span>
                  <h3 style={styles.quizTitle}>
                    {quizItem.title || `Quiz #${quizItem.id}`}
                  </h3>
                  <p style={styles.quizDesc}>
                    {quizItem.description || "Tidak ada deskripsi."}
                  </p>
                  <small style={styles.quizMeta}>
                    Passing score: {quizItem.passing_score || 75}
                  </small>
                </div>

                <div style={styles.quizActions}>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => handleSelectQuiz(quizItem)}
                  >
                    Kelola Quiz
                  </button>

                  <button
                    type="button"
                    style={styles.attachBtn}
                    onClick={() => handleAttachQuizToModule(quizItem)}
                    disabled={isAttachingQuizId === quizItem.id}
                  >
                    {isAttachingQuizId === quizItem.id
                      ? "Memasukkan..."
                      : "Masukkan ke Modul"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {builderMode === "builder" && selectedQuiz && (
        <section style={styles.builderPanel}>
          <button
            type="button"
            onClick={() => {
              setBuilderMode("list");
              setSelectedQuiz(null);
              setQuestions([]);
            }}
            style={styles.backBtn}
          >
            ← Kembali ke daftar quiz
          </button>

          <div style={styles.selectedQuizHeader}>
            <h2 style={styles.cardTitle}>{selectedQuiz.title}</h2>
            <p style={styles.cardSubtitle}>
              Tipe: {(selectedQuiz.quiz_type || quizType).toUpperCase()}
            </p>
          </div>

          {(selectedQuiz.quiz_type || quizType) === "mcq" ? (
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
        </section>
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
  },
  createCard: {
    maxWidth: 860,
    margin: "0 auto 28px",
    padding: 28,
    borderRadius: 28,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(251,191,36,0.4)",
    boxShadow: "0 18px 45px rgba(120,53,15,0.10)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
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
  },
  chooseWrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 8,
  },
  bigChooseCard: {
    padding: 24,
    borderRadius: 24,
    border: "1px solid #fde68a",
    background: "linear-gradient(180deg, #ffffff, #fffbeb)",
    boxShadow: "0 12px 28px rgba(120,53,15,0.10)",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
    textAlign: "center",
    color: "#422006",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },
  activeChooseCard: {
    border: "2px solid #f59e0b",
    background: "linear-gradient(135deg, #fef3c7, #fffbeb)",
  },
  chooseIcon: {
    fontSize: 42,
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
  },
  quizListSection: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  quizGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 18,
    marginTop: 16,
  },
  quizCard: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(251,191,36,0.5)",
    borderRadius: 22,
    padding: 20,
    boxShadow: "0 14px 32px rgba(120,53,15,0.10)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
  },
  quizBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 11,
    fontWeight: 900,
  },
  quizTitle: {
    margin: "12px 0 6px",
    fontSize: 20,
    fontWeight: 900,
  },
  quizDesc: {
    margin: 0,
    color: "#92400e",
    fontSize: 14,
    lineHeight: 1.6,
  },
  quizMeta: {
    display: "block",
    marginTop: 10,
    color: "#a16207",
    fontWeight: 800,
  },
  quizActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  secondaryBtn: {
    flex: 1,
    border: "1px solid #f59e0b",
    background: "#fff7ed",
    color: "#92400e",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
  },
  attachBtn: {
    flex: 1,
    border: "none",
    background: "#f59e0b",
    color: "#ffffff",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
  },
  builderPanel: {
    marginTop: 30,
    padding: 24,
    borderRadius: 28,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(251,191,36,0.4)",
  },
  selectedQuizHeader: {
    marginBottom: 20,
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
  },
  emptyBox: {
    marginTop: 16,
    padding: 24,
    borderRadius: 22,
    background: "rgba(255,255,255,0.8)",
    border: "1px dashed #f59e0b",
    color: "#92400e",
    fontWeight: 800,
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

button {
  transition: 0.25s ease;
}
`;

export default GuruQuiz;
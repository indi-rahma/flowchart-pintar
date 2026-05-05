import React from "react";

function McqForm({
  mcqForm,
  setMcqForm,
  questions = [],
  isSavingQuestion,
  handleSaveMcqQuestion,
  handleUpdateMcqQuestion,
  getImageUrl,
}) {
  const optionFields = [
    ["A", "option_a", "option_a_image"],
    ["B", "option_b", "option_b_image"],
    ["C", "option_c", "option_c_image"],
    ["D", "option_d", "option_d_image"],
  ];

  const [editingId, setEditingId] = React.useState(null);

  const resetForm = () => {
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

  const startEdit = (q) => {
    setEditingId(q.id);
    setMcqForm({
      question: q.question || "",
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_answer: q.correct_answer || "A",
      image: null,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleChange = (key, value) => {
    setMcqForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await handleUpdateMcqQuestion(e, editingId);
      setEditingId(null);
      resetForm();
      return;
    }

    await handleSaveMcqQuestion(e);
  };

  return (
    <section style={styles.wrapper}>
      <style>{animationStyles}</style>

      <div style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Membuat Kuis MCQ</p>
          <h2 style={styles.heroTitle}>
            {editingId ? "Edit Soal MCQ" : "Tambah Soal MCQ"}
          </h2>
          <p style={styles.heroSubtitle}>
            Buat pertanyaan pilihan ganda dengan tampilan clean, modern, dan fun.
          </p>
        </div>

        <div style={styles.heroBadge}>
          <span style={styles.badgeNumber}>{questions.length}</span>
          <span style={styles.badgeText}>Soal</span>
        </div>
      </div>

      <section style={styles.grid}>
        <div style={{ ...styles.card, animation: "fadeUp 0.45s ease both" }}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                {editingId ? "Mode Edit Soal" : "Form Soal"}
              </h3>
              <p style={styles.cardSubtitle}>
                {editingId
                  ? "Ubah data soal lalu klik update."
                  : "Isi pertanyaan dan opsi jawaban."}
              </p>
            </div>
            <div style={styles.iconBubble}>{editingId ? "🛠️" : "✍️"}</div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Pertanyaan</label>
              <textarea
                style={styles.textarea}
                value={mcqForm.question}
                onChange={(e) => handleChange("question", e.target.value)}
                placeholder="Masukkan pertanyaan..."
              />
            </div>

            <div style={styles.uploadBox}>
              <div>
                <label style={styles.label}>Gambar Soal</label>
                <p style={styles.helperText}>
                  Opsional. Saat edit, upload gambar baru hanya kalau mau mengganti.
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                style={styles.fileInput}
                onChange={(e) => handleChange("image", e.target.files?.[0] || null)}
              />

              {mcqForm.image && (
                <div style={styles.fileInfo}>📎 {mcqForm.image.name}</div>
              )}
            </div>

            <div style={styles.optionGrid}>
              {optionFields.map(([label, textKey, imageKey], index) => (
                <div
                  key={label}
                  style={{
                    ...styles.optionBox,
                    animation: `fadeUp 0.45s ease ${index * 0.07}s both`,
                  }}
                >
                  <div style={styles.optionHeader}>
                    <span style={styles.optionCircle}>{label}</span>
                    <label style={styles.optionLabel}>Opsi {label}</label>
                  </div>

                  <input
                    style={styles.input}
                    value={mcqForm[textKey]}
                    onChange={(e) => handleChange(textKey, e.target.value)}
                    placeholder={`Teks opsi ${label}`}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    style={styles.fileInputSmall}
                    onChange={(e) =>
                      handleChange(imageKey, e.target.files?.[0] || null)
                    }
                  />
                </div>
              ))}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Jawaban Benar</label>
              <select
                style={styles.input}
                value={mcqForm.correct_answer}
                onChange={(e) => handleChange("correct_answer", e.target.value)}
              >
                <option value="A">Opsi A</option>
                <option value="B">Opsi B</option>
                <option value="C">Opsi C</option>
                <option value="D">Opsi D</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                ...styles.primaryBtn,
                opacity: isSavingQuestion ? 0.7 : 1,
                cursor: isSavingQuestion ? "not-allowed" : "pointer",
              }}
              disabled={isSavingQuestion}
            >
              {isSavingQuestion
                ? "Menyimpan..."
                : editingId
                ? "💾 Update Soal"
                : "✨ Simpan Soal"}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
                Batal Edit
              </button>
            )}
          </form>
        </div>

        <div
          style={{
            ...styles.card,
            ...styles.listCard,
            animation: "fadeUp 0.55s ease 0.1s both",
          }}
        >
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Daftar Soal</h3>
              <p style={styles.cardSubtitle}>{questions.length} soal tersedia</p>
            </div>
            <div style={styles.iconBubble}>📚</div>
          </div>

          {questions.length > 0 ? (
            <div style={styles.questionList}>
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  style={{
                    ...styles.questionCard,
                    ...(editingId === q.id ? styles.activeEditCard : {}),
                    animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
                  }}
                >
                  <div style={styles.questionTop}>
                    <span style={styles.questionNumber}>Soal #{index + 1}</span>

                    <div style={styles.actionWrap}>
                      <button
                        type="button"
                        onClick={() => startEdit(q)}
                        style={styles.editBtn}
                      >
                        ✏️ Edit
                      </button>

                      <span style={styles.answerBadge}>
                        Jawaban {q.correct_answer}
                      </span>
                    </div>
                  </div>

                  <h4 style={styles.questionText}>{q.question}</h4>

                  {q.image && (
                    <img
                      src={getImageUrl(q.image)}
                      alt="soal"
                      style={styles.questionImage}
                    />
                  )}

                  <div style={styles.optionList}>
                    {optionFields.map(([label, textKey, imageKey]) => (
                      <div
                        key={label}
                        style={{
                          ...styles.optionItem,
                          ...(q.correct_answer === label
                            ? styles.correctOption
                            : {}),
                        }}
                      >
                        <div style={styles.optionItemText}>
                          <span style={styles.optionMiniCircle}>{label}</span>
                          <span>{q[textKey] || <em>Kosong</em>}</span>
                        </div>

                        {q[imageKey] && (
                          <img
                            src={getImageUrl(q[imageKey])}
                            alt={`opsi ${label}`}
                            style={styles.optionImage}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIcon}>🌟</div>
              <strong>Belum ada soal</strong>
              <p>Soal yang kamu simpan akan muncul di sini.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default McqForm;

const styles = {
  wrapper: {
    width: "100%",
  },

  hero: {
    marginBottom: 24,
    padding: 28,
    borderRadius: 28,
    background:
      "linear-gradient(135deg, #facc15 0%, #f59e0b 45%, #f97316 100%)",
    color: "#422006",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 22px 45px rgba(245, 158, 11, 0.35)",
    overflow: "hidden",
    position: "relative",
  },

  eyebrow: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.75,
  },

  heroTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
  },

  heroSubtitle: {
    margin: "8px 0 0",
    maxWidth: 560,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#713f12",
  },

  heroBadge: {
    width: 96,
    height: 96,
    borderRadius: 26,
    background: "rgba(255,255,255,0.38)",
    border: "1px solid rgba(255,255,255,0.55)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
    flexShrink: 0,
  },

  badgeNumber: {
    fontSize: 30,
    fontWeight: 900,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(360px, 0.95fr) minmax(420px, 1.05fr)",
    gap: 24,
    alignItems: "start",
  },

  card: {
    background: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: 26,
    border: "1px solid rgba(251, 191, 36, 0.35)",
    boxShadow: "0 18px 45px rgba(120, 53, 15, 0.10)",
    backdropFilter: "blur(14px)",
  },

  listCard: {
    maxHeight: "calc(100vh - 180px)",
    overflowY: "auto",
  },

  cardHeader: {
    marginBottom: 22,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },

  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    color: "#422006",
  },

  cardSubtitle: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#92400e",
  },

  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 18,
    background: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    boxShadow: "0 10px 20px rgba(245,158,11,0.20)",
    flexShrink: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#78350f",
  },

  helperText: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#92400e",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 16,
    border: "1px solid #fcd34d",
    background: "#fffbeb",
    outline: "none",
    fontSize: 14,
    color: "#422006",
    transition: "0.25s ease",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 120,
    padding: "14px",
    borderRadius: 18,
    border: "1px solid #fcd34d",
    background: "#fffbeb",
    outline: "none",
    resize: "vertical",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#422006",
    transition: "0.25s ease",
  },

  uploadBox: {
    padding: 16,
    borderRadius: 20,
    background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    border: "1px dashed #f59e0b",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  fileInput: {
    fontSize: 13,
    color: "#78350f",
  },

  fileInputSmall: {
    fontSize: 12,
    color: "#78350f",
  },

  fileInfo: {
    padding: "9px 11px",
    borderRadius: 12,
    background: "#fde68a",
    fontSize: 12,
    color: "#78350f",
    fontWeight: 700,
  },

  optionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  optionBox: {
    padding: 15,
    border: "1px solid #fde68a",
    borderRadius: 20,
    background: "linear-gradient(180deg, #ffffff, #fffbeb)",
    boxShadow: "0 10px 24px rgba(245,158,11,0.10)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "0.25s ease",
  },

  optionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  optionCircle: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#f59e0b",
    color: "#fff",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 16px rgba(245,158,11,0.28)",
  },

  optionLabel: {
    fontWeight: 900,
    fontSize: 13,
    color: "#78350f",
  },

  primaryBtn: {
    padding: "15px 18px",
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #f59e0b, #f97316)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 25px rgba(249,115,22,0.32)",
    transition: "0.25s ease",
  },

  cancelBtn: {
    padding: "13px 18px",
    borderRadius: 18,
    border: "1px solid #f59e0b",
    background: "#fff7ed",
    color: "#92400e",
    fontWeight: 900,
    cursor: "pointer",
    transition: "0.25s ease",
  },

  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  questionCard: {
    padding: 18,
    borderRadius: 22,
    background: "linear-gradient(135deg, #fff7ed, #fffbeb)",
    border: "1px solid #fed7aa",
    boxShadow: "0 12px 26px rgba(120,53,15,0.08)",
    transition: "0.25s ease",
  },

  activeEditCard: {
    border: "2px solid #f59e0b",
    boxShadow: "0 16px 34px rgba(245,158,11,0.24)",
  },

  questionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },

  questionNumber: {
    fontSize: 12,
    fontWeight: 900,
    color: "#92400e",
  },

  actionWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  editBtn: {
    border: "none",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(245,158,11,0.18)",
    transition: "0.25s ease",
  },

  questionText: {
    margin: "0 0 14px",
    fontSize: 16,
    lineHeight: 1.5,
    color: "#422006",
  },

  questionImage: {
    width: "100%",
    maxHeight: 220,
    objectFit: "cover",
    borderRadius: 18,
    marginBottom: 14,
    border: "1px solid #fde68a",
  },

  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },

  optionItem: {
    padding: 11,
    background: "#fff",
    borderRadius: 15,
    border: "1px solid #fde68a",
    transition: "0.2s ease",
  },

  correctOption: {
    background: "#fef3c7",
    border: "1px solid #f59e0b",
    boxShadow: "0 8px 18px rgba(245,158,11,0.16)",
  },

  optionItemText: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#422006",
    fontSize: 14,
  },

  optionMiniCircle: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#fbbf24",
    color: "#78350f",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  optionImage: {
    display: "block",
    marginTop: 9,
    maxWidth: 130,
    borderRadius: 12,
    border: "1px solid #fde68a",
  },

  answerBadge: {
    fontSize: 12,
    fontWeight: 900,
    background: "#f59e0b",
    color: "#fff",
    padding: "7px 11px",
    borderRadius: 999,
    boxShadow: "0 8px 16px rgba(245,158,11,0.25)",
    whiteSpace: "nowrap",
  },

  emptyBox: {
    minHeight: 300,
    textAlign: "center",
    padding: 28,
    color: "#92400e",
    borderRadius: 24,
    background:
      "radial-gradient(circle, #fde68a 1px, transparent 1px), #fffbeb",
    backgroundSize: "22px 22px",
    border: "2px dashed #fbbf24",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
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
  transform: translateY(-2px);
  filter: brightness(1.03);
}

input:focus,
textarea:focus,
select:focus {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.16);
  background: #ffffff !important;
}

div[style*="transition"]:hover {
  transform: translateY(-2px);
}

@media (max-width: 980px) {
  section {
    grid-template-columns: 1fr !important;
  }
}
`;
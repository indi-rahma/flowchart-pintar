import React, { useMemo, useState } from "react";

const getEvaluasiByScore = (score) => {
  const nilai = Number(score) || 0;

  if (nilai >= 90) {
    return {
      level: "Sangat Baik",
      message:
        "Pemahaman kamu sangat kuat. Pertahankan konsistensi dan coba latihan dengan tingkat kesulitan lebih tinggi.",
    };
  }

  if (nilai >= 80) {
    return {
      level: "Baik",
      message:
        "Hasil kamu sudah baik. Perhatikan kembali beberapa bagian kecil agar nilai makin stabil.",
    };
  }

  if (nilai >= 70) {
    return {
      level: "Cukup",
      message:
        "Pemahaman dasar sudah cukup. Latihan tambahan akan membantu meningkatkan ketepatan jawaban.",
    };
  }

  if (nilai >= 60) {
    return {
      level: "Perlu Latihan",
      message:
        "Kamu sudah mulai memahami materi, tapi masih perlu mengulang konsep utama dan latihan lagi.",
    };
  }

  return {
    level: "Perlu Bimbingan",
    message:
      "Materi ini masih perlu dipelajari ulang. Fokus ke konsep dasar terlebih dahulu sebelum mencoba kuis lagi.",
  };
};

const getQuizCategory = (title = "") => {
  const lower = String(title).toLowerCase();

  if (lower.includes("pretest")) return "Pretest";
  if (lower.includes("posttest")) return "Posttest";
  if (lower.includes("quiz") || lower.includes("kuis")) return "Quiz";

  return "Quiz";
};

const DaftarRiwayatKuis = ({ data = [] }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const groupedByModule = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];

    const latestByQuiz = new Map();

    safeData.forEach((item) => {
      const quizId = item?.quiz_id;
      if (!quizId) return;

      const existing = latestByQuiz.get(quizId);

      const currentTime = item?.taken_at
        ? new Date(item.taken_at).getTime()
        : 0;

      const existingTime = existing?.taken_at
        ? new Date(existing.taken_at).getTime()
        : 0;

      if (!existing || currentTime > existingTime || item.id > existing.id) {
        latestByQuiz.set(quizId, item);
      }
    });

    const moduleMap = new Map();

    Array.from(latestByQuiz.values()).forEach((item) => {
      const moduleId = item?.module_id || "unknown";
      const moduleTitle = item?.module_title || "Modul Tanpa Judul";

      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          module_id: moduleId,
          module_title: moduleTitle,
          quizzes: [],
        });
      }

      moduleMap.get(moduleId).quizzes.push(item);
    });

    return Array.from(moduleMap.values());
  }, [data]);

  const handleOpenEvaluation = (item) => {
    const evaluation = item?.evaluation || getEvaluasiByScore(item?.score);

    setSelectedEvaluation({
      ...item,
      evaluation,
    });
  };

  if (groupedByModule.length === 0) {
    return (
      <div className="riwayat-empty premium-card">
        <span className="riwayat-empty-icon">📘</span>
        <h3>Belum ada riwayat kuis</h3>
        <p>Hasil kuis yang sudah kamu kerjakan akan tampil di sini.</p>
      </div>
    );
  }

  return (
    <>
      <main className="riwayat-list-section">
        <div className="riwayat-list-title-row">
          <div>
            <h2>Riwayat Kuis</h2>
            <p>
              Menampilkan nilai terakhir Pretest dan Quiz berdasarkan setiap
              modul.
            </p>
          </div>

          <div className="riwayat-list-line"></div>
        </div>

        <div className="riwayat-stack-area">
          {groupedByModule.map((moduleItem, moduleIndex) => (
            <section
              key={moduleItem.module_id}
              className="premium-card"
              style={{
                padding: 20,
                borderRadius: 22,
                marginBottom: 18,
                animation: `cardPop 0.4s ease forwards ${
                  moduleIndex * 0.05
                }s`,
              }}
            >
              <h3 style={{ margin: "0 0 14px" }}>
                {moduleItem.module_title}
              </h3>

              {moduleItem.quizzes.map((item, index) => {
                const isPass = item?.is_pass === 1 || item?.is_pass === true;
                const category = getQuizCategory(item?.quiz_title);

                return (
                  <article
                    key={item?.id || index}
                    className={`riwayat-history-card ${
                      isPass ? "is-pass" : "is-fail"
                    }`}
                    style={{ marginBottom: 12 }}
                  >
                    <div className="riwayat-card-info-group">
                      <div className="riwayat-index-box">
                        {category === "Pretest" ? "P" : "Q"}
                      </div>

                      <div className="riwayat-text-group">
                        <div className="riwayat-title-row">
                          <h4>
                            {category}:{" "}
                            {item?.quiz_title || "Kuis Tanpa Judul"}
                          </h4>

                          <span
                            className={
                              isPass
                                ? "riwayat-mini-tag pass"
                                : "riwayat-mini-tag fail"
                            }
                          >
                            {isPass ? "Lulus" : "Belum Lulus"}
                          </span>
                        </div>

                        <p>
                          Nilai terakhir pada{" "}
                          {item?.taken_at
                            ? new Date(item.taken_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Tanggal tidak tersedia"}
                        </p>
                      </div>
                    </div>

                    <div className="riwayat-card-result-group">
                      <div className="riwayat-score-box">
                        <span className="riwayat-score-label">Nilai</span>

                        <div
                          className={
                            isPass
                              ? "riwayat-score-number pass"
                              : "riwayat-score-number fail"
                          }
                        >
                          {item?.score ?? 0}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="riwayat-arrow-btn"
                        onClick={() => handleOpenEvaluation(item)}
                      >
                        Evaluasi
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      </main>

      {selectedEvaluation && (
        <div
          className="evaluasi-modal-overlay"
          onClick={() => setSelectedEvaluation(null)}
        >
          <div
            className="evaluasi-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="evaluasi-close-btn"
              onClick={() => setSelectedEvaluation(null)}
            >
              ×
            </button>

            <span className="evaluasi-label">Evaluasi Kuis</span>

            <h3>{selectedEvaluation?.quiz_title || "Kuis Tanpa Judul"}</h3>

            <div className="evaluasi-score-row">
              <div>
                <span>Nilai</span>
                <strong>{selectedEvaluation?.score ?? 0}</strong>
              </div>

              <div>
                <span>Status: </span>
                <strong>
                  {selectedEvaluation?.is_pass === 1 ||
                  selectedEvaluation?.is_pass === true
                    ? "Lulus"
                    : "Belum Lulus"}
                </strong>
              </div>
            </div>

            <div className="evaluasi-result-box">
              <h4>{selectedEvaluation?.evaluation?.level}</h4>
              <p>{selectedEvaluation?.evaluation?.message}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DaftarRiwayatKuis;
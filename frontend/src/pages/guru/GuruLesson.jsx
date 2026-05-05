import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormMateri from "./FormMateri";

function GuruLesson() {
  const { id } = useParams();
  const navigate = useNavigate();

  const moduleId = Number(id);
  const API_BASE = "http://localhost:5000";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [itemImages, setItemImages] = useState([]);
  const [materialImages, setMaterialImages] = useState({});
  const [orderIndex, setOrderIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [isAddingQuizToModule, setIsAddingQuizToModule] = useState(false);

  const safeReadJson = async (res) => {
    const rawText = await res.text();

    try {
      return rawText ? JSON.parse(rawText) : {};
    } catch {
      return { message: rawText };
    }
  };

  const fetchMaterialImages = async (itemsData) => {
    const imagesMap = {};

    for (const item of itemsData) {
      try {
        const res = await fetch(
          `${API_BASE}/api/material-images?materialId=${item.id}`
        );

        if (!res.ok) {
          imagesMap[item.id] = [];
          continue;
        }

        const data = await res.json();
        imagesMap[item.id] = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("GET MATERIAL IMAGES ERROR:", err);
        imagesMap[item.id] = [];
      }
    }

    setMaterialImages(imagesMap);
  };

  const fetchData = useCallback(async () => {
    if (!moduleId || Number.isNaN(moduleId)) {
      setError("Module ID tidak valid.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/module-items?moduleId=${moduleId}`);
      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil daftar materi.");
      }

      const filteredItems = Array.isArray(data)
        ? data
          .filter((item) => String(item.module_id) === String(moduleId))
          .sort(
            (a, b) =>
              Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
              Number(a.id) - Number(b.id)
          )
        : [];

      setItems(filteredItems);
      await fetchMaterialImages(filteredItems);

    } catch (err) {
      console.error("FETCH MODULE ITEMS ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat memuat materi.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, moduleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setEditingItemId(null);
    setTitle("");
    setContent("");
    setVideoUrl("");
    setImageUrl("");
    setOrderIndex(0);
    setIsLocked(false);
    setItemImages([]);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenQuizManager = () => {
    navigate(`/guru/modul/${moduleId}/quiz`);
  };

  const handleAttachQuizToModule = async () => {
    try {
      setIsAddingQuizToModule(true);

      const quizRes = await fetch(`${API_BASE}/api/quizzes?moduleId=${moduleId}`);
      const quizData = await safeReadJson(quizRes);

      if (!quizRes.ok) {
        throw new Error(quizData.message || "Gagal mengambil data quiz modul.");
      }

      const currentQuiz = Array.isArray(quizData) ? quizData[0] || null : null;

      if (!currentQuiz) {
        alert("Belum ada quiz untuk modul ini. Buat quiz dulu ya.");
        return;
      }

      const existingQuizItem = items.find(
        (item) =>
          item.type === "quiz" &&
          String(item.quiz_id) === String(currentQuiz.id)
      );

      if (existingQuizItem) {
        alert("Quiz ini sudah masuk ke modul.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/module-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module_id: moduleId,
          title: `Quiz: ${currentQuiz.title}`,
          content: currentQuiz.description || "",
          quiz_id: currentQuiz.id,
        }),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error(data.message || "Gagal memasukkan quiz ke modul.");
      }

      await fetchData();
      alert("Quiz berhasil dimasukkan ke modul ✅");
    } catch (err) {
      console.error("ATTACH QUIZ TO MODULE ERROR:", err);
      alert(err.message || "Terjadi kesalahan saat memasukkan quiz ke modul.");
    } finally {
      setIsAddingQuizToModule(false);
    }
  };

  const handleEditMateri = (item) => {
    setEditingItemId(item.id);
    setTitle(item.title || "");
    setContent(item.content_text || "");
    setOrderIndex(Number(item.order_index ?? 0));
    setIsLocked(Number(item.is_locked) === 1);
    setItemImages([]);

    if (item.type === "video") {
      setVideoUrl(item.content_url || "");
      setImageUrl("");
    } else {
      setVideoUrl("");
      setImageUrl(item.content_url || "");
    }

    setShowForm(true);
  };

  const handleSaveMateri = async (e) => {
    e.preventDefault();

    if (!moduleId || Number.isNaN(moduleId)) {
      alert("Module ID tidak valid.");
      return;
    }

    if (!title.trim()) {
      alert("Judul materi wajib diisi.");
      return;
    }

    if (!content.trim() && !videoUrl.trim() && !imageUrl.trim()) {
      alert("Isi materi, video, atau gambar minimal isi salah satu.");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingItemId
        ? `${API_BASE}/api/module-items/${editingItemId}`
        : `${API_BASE}/api/module-items`;

      const method = editingItemId ? "PUT" : "POST";

      const payload = {
        module_id: moduleId,
        title: title.trim(),
        content: content.trim(),
        video_url: videoUrl.trim(),
        image_url: imageUrl.trim(),
        order_index: Number(orderIndex) || 0,
        is_locked: isLocked ? 1 : 0,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error(
          data.sqlMessage ||
          data.error ||
          data.message ||
          "Gagal menyimpan materi."
        );
      }

      const materialId = editingItemId || data.id;

      if (itemImages.length > 0 && materialId) {
        for (let i = 0; i < itemImages.length; i++) {
          const formData = new FormData();
          formData.append("material_id", materialId);
          formData.append("image", itemImages[i]);
          formData.append("caption", "");
          formData.append("image_order", i + 1);

          const imgRes = await fetch(`${API_BASE}/api/material-images`, {
            method: "POST",
            body: formData,
          });

          if (!imgRes.ok) {
            console.warn("UPLOAD GAMBAR GAGAL:", itemImages[i].name);
          }
        }
      }

      alert("Materi berhasil disimpan ✅");

      resetForm();
      setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error("SAVE MODULE ITEM ERROR:", err);
      alert(err.message || "Terjadi kesalahan saat menyimpan materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMateri = async (itemId) => {
    const confirmed = window.confirm("Yakin mau menghapus materi ini?");
    if (!confirmed) return;

    try {
      setDeletingItemId(itemId);

      const res = await fetch(`${API_BASE}/api/module-items/${itemId}`, {
        method: "DELETE",
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error(
          data.sqlMessage ||
          data.error ||
          data.message ||
          "Gagal menghapus materi."
        );
      }

      if (editingItemId === itemId) {
        resetForm();
        setShowForm(false);
      }

      await fetchData();
      alert("Materi berhasil dihapus ✅");
    } catch (err) {
      console.error("DELETE MODULE ITEM ERROR:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus materi.");
    } finally {
      setDeletingItemId(null);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
    const match = url.match(regExp);

    return match?.[2]
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const quizItems = items.filter((item) => item.type === "quiz");
  const nonQuizItems = items.filter((item) => item.type !== "quiz");

  if (loading) {
    return (
      <div style={styles.loaderWrap}>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <div style={styles.pulseIcon}>📑</div>
        <p style={styles.loaderTxt}>MEMUAT ARSITEKTUR MATERI...</p>
      </div>
    );
  }

  const renderContentWithImages = (text, images = []) => {
  if (!text) return <p style={styles.lessonContentText}>-</p>;

  const parts = text.split(/(\[img\d+\])/g);

  return parts.map((part, index) => {
    const match = part.match(/\[img(\d+)\]/);

    // 🔥 kalau placeholder gambar
    if (match) {
      const imgIndex = Number(match[1]) - 1;
      const img = images[imgIndex];

      if (!img) {
        return (
          <div key={index} style={styles.missingImageBox}>
            Gambar {imgIndex + 1} belum tersedia
          </div>
        );
      }

      return (
        <figure key={index} style={styles.docsFigure}>
          <img
            src={`${API_BASE}/uploads/${img.image}`}
            alt={img.caption || "Gambar materi"}
            style={styles.docsImage}
          />
        </figure>
      );
    }

    // 🔥 teks biasa
    if (!part.trim()) return null;

    return (
      <p key={index} style={styles.lessonContentText}>
        {part}
      </p>
    );
  });
};

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        .lesson-card:hover { transform: translateX(10px); border-color: #000 !important; }
        .quiz-card:hover { transform: translateY(-3px); }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerNav}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ⬅ KEMBALI
          </button>
          <div style={styles.breadcrumb}>
            Dashboard / Modul / <span style={{ color: "#000" }}>{moduleId}</span>
          </div>
        </div>

        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>
              Kelola <span style={{ color: "#EAB308" }}>Materi </span>
            </h1>
            <p style={styles.subTitle}>
              Modul ID: #{moduleId} • Total {items.length} materi terdaftar
            </p>
          </div>

          <div style={styles.headerActionRow}>
            <button style={styles.quizBtn} onClick={handleOpenQuizManager}>
              🧠 KELOLA QUIZ
            </button>
            <button style={styles.mainAddBtn} onClick={openCreateForm}>
              + TAMBAH MATERI BARU
            </button>
          </div>
        </div>
      </header>

      <section style={styles.quizInfoWrap}>
        {quizItems.length > 0 ? (
          quizItems.map((quizItem) => (
            <div
              key={quizItem.id}
              style={styles.quizInfoCard}
              className="quiz-card"
            >
              <div style={styles.quizInfoLeft}>
                <div style={styles.quizIcon}>🎯</div>
                <div>
                  <h3 style={styles.quizInfoTitle}>
                    {quizItem.title || "Quiz Modul"}
                  </h3>
                  <p style={styles.quizInfoText}>
                    {quizItem.content_text ||
                      "Quiz untuk modul ini sudah tersedia."}
                  </p>
                </div>
              </div>

              <div style={styles.quizActionRow}>
                <button
                  style={styles.quizInfoBtn}
                  onClick={handleOpenQuizManager}
                >
                  Buka Quiz →
                </button>

                <button
                  style={styles.attachQuizBtn}
                  onClick={handleAttachQuizToModule}
                  disabled={isAddingQuizToModule}
                >
                  {isAddingQuizToModule ? "MEMASUKKAN..." : "Masukkan ke Modul"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.quizInfoCard} className="quiz-card">
            <div style={styles.quizInfoLeft}>
              <div style={styles.quizIcon}>🎯</div>
              <div>
                <h3 style={styles.quizInfoTitle}>Quiz Modul</h3>
                <p style={styles.quizInfoText}>
                  Belum ada quiz untuk modul ini. Tambahkan quiz MCQ atau Drag &
                  Drop.
                </p>
              </div>
            </div>

            <div style={styles.quizActionRow}>
              <button style={styles.quizInfoBtn} onClick={handleOpenQuizManager}>
                Buat / Kelola Quiz →
              </button>

              <button
                style={styles.attachQuizBtn}
                onClick={handleAttachQuizToModule}
                disabled={isAddingQuizToModule}
              >
                {isAddingQuizToModule ? "MEMASUKKAN..." : "Masukkan ke Modul"}
              </button>
            </div>
          </div>
        )}
      </section>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={styles.mainLayout}>
        {showForm && (
          <FormMateri
            editingItemId={editingItemId}
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            itemImages={itemImages}
            setItemImages={setItemImages}
            orderIndex={orderIndex}
            setOrderIndex={setOrderIndex}
            isLocked={isLocked}
            setIsLocked={setIsLocked}
            isSubmitting={isSubmitting}
            handleSaveMateri={handleSaveMateri}
            onCancel={() => {
              resetForm();
              setShowForm(false);
            }}
            styles={styles}
          />
        )}


        <main
          style={{ ...styles.contentList, width: showForm ? "60%" : "100%" }}
        >
          {nonQuizItems.length > 0 ? (
            nonQuizItems.map((item, index) => {
              const embedUrl =
                item.type === "video" ? getEmbedUrl(item.content_url) : null;
              const imageSrc =
                item.type === "article" && item.content_url
                  ? item.content_url
                  : "";

              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.lessonCard,
                    animation: "slideInRight 0.4s ease forwards",
                    animationDelay: `${index * 0.08}s`,
                  }}
                  className="lesson-card"
                >
                  <div style={styles.lessonOrder}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div style={styles.lessonMain}>
                    <div style={styles.lessonTopRow}>
                      <div>
                        <h2 style={styles.lessonTitle}>{item.title}</h2>
                        <div style={styles.metaRow}>
                          <span style={styles.typeBadge}>
                            {item.type || "article"}
                          </span>
                          <span style={styles.metaText}>
                            Urutan: {Number(item.order_index ?? 0)}
                          </span>
                          <span
                            style={{
                              ...styles.lockText,
                              color:
                                Number(item.is_locked) === 1
                                  ? "#DC2626"
                                  : "#16A34A",
                            }}
                          >
                            {Number(item.is_locked) === 1
                              ? "Terkunci"
                              : "Terbuka"}
                          </span>
                        </div>
                      </div>

                      <div style={styles.lessonActions}>
                        <button
                          type="button"
                          style={styles.iconBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMateri(item);
                          }}
                          title="Edit materi"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          style={{
                            ...styles.iconBtn,
                            background:
                              deletingItemId === item.id
                                ? "#FEE2E2"
                                : "#FEF2F2",
                            color: "#DC2626",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMateri(item.id);
                          }}
                          disabled={deletingItemId === item.id}
                          title="Hapus materi"
                        >
                          {deletingItemId === item.id ? "..." : "🗑️"}
                        </button>
                      </div>
                    </div>

                   {renderContentWithImages(
  item.content_text,
  materialImages[item.id] || []
)}

                    <div style={styles.mediaGrid}>
                      {embedUrl && (
                        <div style={styles.videoWrapper}>
                          <iframe
                            style={styles.iframe}
                            src={embedUrl}
                            title={item.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {(materialImages[item.id] || []).map((img) => (
                        <img
                          key={img.id}
                          src={`${API_BASE}/uploads/${img.image}`}
                          alt={img.caption || item.title || "Gambar materi"}
                          style={styles.lessonImg}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyEmoji}>📓</div>
              <h3>Materi Modul Belum Ada</h3>
              <p>
                Belum ada materi non-quiz yang ditambahkan. Gunakan tombol di
                atas untuk mulai mengisi.
              </p>
            </div>
          )}
        </main>
      </div>

      <footer style={styles.footer}>
        <div style={styles.syncBox}>
          <div style={styles.pulseDot}></div>
          DATABASE MATERI AKTIF | MODULE_ID: {moduleId}
        </div>
        <p>© 2026 EduPro Content Creator</p>
      </footer>
    </div>
  );
}

const styles = {
  pageContainer: {
    padding: "40px 60px",
    background: "#FFFFFF",
    minHeight: "100vh",
    color: "#111827",
  },
  loaderWrap: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseIcon: { fontSize: "60px", animation: "pulse 1.5s infinite" },
  loaderTxt: {
    marginTop: "20px",
    fontWeight: "800",
    letterSpacing: "2px",
    fontSize: "12px",
  },

  header: { marginBottom: "30px" },
  headerNav: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  backBtn: {
    background: "#F1F5F9",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "12px",
    cursor: "pointer",
  },
  breadcrumb: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: "1px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  headerActionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "42px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1.5px",
  },
  subTitle: {
    color: "#64748B",
    marginTop: "5px",
    fontSize: "16px",
  },
  mainAddBtn: {
    background: "#000",
    color: "#FDE047",
    padding: "15px 30px",
    borderRadius: "15px",
    fontWeight: "800",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  },
  quizBtn: {
    background: "#FACC15",
    color: "#111827",
    padding: "15px 26px",
    borderRadius: "15px",
    fontWeight: "900",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(250,204,21,0.22)",
  },

  quizInfoWrap: {
    marginBottom: "22px",
  },
  quizInfoCard: {
    background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
    color: "#fff",
    borderRadius: "24px",
    padding: "22px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    transition: "0.25s ease",
    boxShadow: "0 14px 30px rgba(17,24,39,0.18)",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  quizInfoLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  quizIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "#FACC15",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    flexShrink: 0,
  },
  quizInfoTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "900",
  },
  quizInfoText: {
    margin: "6px 0 0 0",
    color: "#D1D5DB",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  quizActionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  quizInfoBtn: {
    background: "#fff",
    color: "#111827",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  attachQuizBtn: {
    background: "#FACC15",
    color: "#111827",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  errorBox: {
    background: "#FEF2F2",
    color: "#991B1B",
    border: "1px solid #FECACA",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
  },

  mainLayout: { display: "flex", gap: "40px", alignItems: "flex-start" },

  formContainer: {
    width: "40%",
    position: "sticky",
    top: "40px",
    animation: "slideInRight 0.4s ease",
  },
  formCard: {
    background: "#F8FAFC",
    border: "3px solid #000",
    padding: "35px",
    borderRadius: "30px",
    boxShadow: "12px 12px 0px #EAB308",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: "800",
    marginBottom: "25px",
    borderBottom: "2px solid #E2E8F0",
    paddingBottom: "15px",
  },
  inputGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: "900",
    marginBottom: "8px",
    color: "#64748B",
  },
  input: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "2px solid #E2E8F0",
    background: "#FFF",
    fontWeight: "600",
    outline: "none",
  },
  formButtonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  cancelBtn: {
    flex: 1,
    padding: "18px",
    background: "#E5E7EB",
    color: "#111827",
    border: "none",
    borderRadius: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 2,
    padding: "18px",
    background: "#000",
    color: "#FDE047",
    border: "none",
    borderRadius: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  contentList: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    transition: "0.5s",
  },
  lessonCard: {
    background: "#FFF",
    border: "2px solid #F1F5F9",
    borderRadius: "25px",
    padding: "30px",
    display: "flex",
    gap: "25px",
    transition: "0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  lessonOrder: {
    fontSize: "40px",
    fontWeight: "900",
    color: "#F1F5F9",
    lineHeight: "1",
    minWidth: "52px",
  },
  lessonMain: { flex: 1 },
  lessonTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },
  lessonTitle: {
    fontSize: "24px",
    fontWeight: "800",
    margin: "0 0 10px 0",
  },
  metaRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  typeBadge: {
    background: "#FEF3C7",
    color: "#92400E",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metaText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748B",
  },
  lockText: {
    fontSize: "12px",
    fontWeight: "800",
  },
  lessonContentText: {
    color: "#4B5563",
    lineHeight: "1.8",
    fontSize: "15px",
    marginBottom: "25px",
    whiteSpace: "pre-wrap",
  },

  mediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  videoWrapper: {
    width: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    aspectRatio: "16/9",
    border: "3px solid #000",
  },
  iframe: { width: "100%", height: "100%" },
  lessonImg: {
    width: "100%",
    borderRadius: "20px",
    border: "2px solid #F1F5F9",
    objectFit: "cover",
  },

  lessonActions: {
    display: "flex",
    gap: "10px",
  },
  iconBtn: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#F8FAFC",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    textAlign: "center",
    padding: "100px 0",
    border: "3px dashed #F1F5F9",
    borderRadius: "40px",
    width: "100%",
  },
  emptyEmoji: { fontSize: "50px", marginBottom: "20px" },

  footer: {
    marginTop: "80px",
    borderTop: "2px solid #F1F5F9",
    paddingTop: "30px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: "700",
    color: "#CBD5E1",
    flexWrap: "wrap",
    gap: "12px",
  },
  syncBox: { display: "flex", alignItems: "center", gap: "10px", color: "#16A34A" },
  pulseDot: {
    width: "8px",
    height: "8px",
    background: "#16A34A",
    borderRadius: "50%",
    animation: "pulse 1s infinite",
  },
  docsFigure: {
  margin: "20px 0",
},

docsImage: {
  width: "100%",
  borderRadius: "20px",
  border: "2px solid #E2E8F0",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
},

missingImageBox: {
  margin: "18px 0",
  padding: "14px",
  borderRadius: "12px",
  background: "#FEF2F2",
  color: "#991B1B",
  fontWeight: "700",
},
};

export default GuruLesson;
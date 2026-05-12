import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

function GuruModul() {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemType, setItemType] = useState("text");
  const [itemContentText, setItemContentText] = useState("");
  const [itemContentUrl, setItemContentUrl] = useState("");
  const [itemOrderIndex, setItemOrderIndex] = useState(0);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [itemImages, setItemImages] = useState([]);

  const [draggedModuleId, setDraggedModuleId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const normalizeModules = (data) => {
    if (!Array.isArray(data)) return [];

    const alreadyNested = data.every(
      (item) =>
        Object.prototype.hasOwnProperty.call(item, "id") &&
        Object.prototype.hasOwnProperty.call(item, "title") &&
        Object.prototype.hasOwnProperty.call(item, "items")
    );

    if (alreadyNested) {
      return data.map((mod, index) => ({
        id: mod.id,
        title: mod.title || "",
        description: mod.description || "",
        order_index: mod.order_index ?? index + 1,
        items: Array.isArray(mod.items) ? mod.items : [],
      }));
    }

    const grouped = Object.values(
      data.reduce((acc, row) => {
        const moduleId = row.module_id || row.id;

        if (!acc[moduleId]) {
          acc[moduleId] = {
            id: moduleId,
            title: row.module_title || row.title || "",
            description: row.module_description || row.description || "",
            order_index: row.module_order_index ?? row.order_index ?? 0,
            items: [],
          };
        }

        if (
          row.item_id ||
          row.type ||
          row.content_text ||
          row.content_url ||
          row.order_index !== undefined
        ) {
          acc[moduleId].items.push({
            id: row.item_id || row.id,
            title: row.item_title || row.title || "",
            type: row.type || "text",
            content_text: row.content_text || "",
            content_url: row.content_url || "",
            order_index: row.item_order_index ?? row.order_index ?? 0,
          });
        }

        return acc;
      }, {})
    );

    return grouped.map((mod, index) => ({
      ...mod,
      order_index: mod.order_index ?? index + 1,
    }));
  };

  const getModules = async () => {
    if (!userId) {
      setLoading(false);
      setError("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/modules?userId=${userId}`);

      if (!res.ok) throw new Error("Gagal mengambil data modul.");

      const data = await res.json();
      setModules(normalizeModules(data));
    } catch (err) {
      console.error("GET MODULES ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil modul.");
    } finally {
      setLoading(false);
    }
  };

  const getQuizzesByModule = async (moduleId) => {
    if (!moduleId) return;

    try {
      setLoadingQuiz(true);
      setQuizzes([]);

      const res = await fetch(`${API_BASE}/api/quizzes?moduleId=${moduleId}`);

      if (!res.ok) throw new Error("Gagal mengambil data quiz.");

      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("GET QUIZZES ERROR:", err);
      setQuizzes([]);
    } finally {
      setLoadingQuiz(false);
    }
  };

  useEffect(() => {
    getModules();
  }, [userId]);

  const handleTambahModul = async (e) => {
    e.preventDefault();

    if (!moduleTitle.trim()) {
      alert("Judul modul wajib diisi.");
      return;
    }

    try {
      setIsSubmittingModule(true);

      const res = await fetch(`${API_BASE}/api/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: moduleTitle,
          description: moduleDescription,
          user_id: userId,
          order_index: modules.length + 1,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan modul baru.");

      setModuleTitle("");
      setModuleDescription("");
      setShowModuleModal(false);

      await getModules();
    } catch (err) {
      console.error("CREATE MODULE ERROR:", err);
      alert(err.message || "Gagal membuat modul.");
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const openTambahMateriModal = async (moduleId) => {
    setSelectedModuleId(moduleId);
    setItemTitle("");
    setItemType("text");
    setItemContentText("");
    setItemContentUrl("");
    setItemOrderIndex(0);
    setSelectedQuizId("");
    setItemImages([]);
    setQuizzes([]);
    setShowItemModal(true);

    await getQuizzesByModule(moduleId);
  };

  const handleItemTypeChange = (e) => {
    const nextType = e.target.value;

    setItemType(nextType);
    setItemContentText("");
    setItemContentUrl("");
    setSelectedQuizId("");

    if (nextType === "quiz") {
      setItemTitle("Pretest");
      setItemOrderIndex(0);
    }
  };

  const handleQuizChange = (e) => {
    const quizId = e.target.value;
    setSelectedQuizId(quizId);

    const selectedQuiz = quizzes.find((quiz) => String(quiz.id) === quizId);

    if (selectedQuiz) {
      setItemTitle(selectedQuiz.title || selectedQuiz.quiz_title || "Quiz");
      setItemContentUrl(String(selectedQuiz.id));
    }
  };

  const handleTambahMateri = async (e) => {
    e.preventDefault();

    if (!selectedModuleId) {
      alert("Module tidak ditemukan.");
      return;
    }

    if (!itemTitle.trim()) {
      alert("Judul materi wajib diisi.");
      return;
    }

    if (itemType === "quiz" && !selectedQuizId) {
      alert("Pilih quiz terlebih dahulu.");
      return;
    }

    if (itemType === "text" && !itemContentText.trim()) {
      alert("Isi materi text wajib diisi.");
      return;
    }

    if (
      (itemType === "video" || itemType === "file" || itemType === "link") &&
      !itemContentUrl.trim()
    ) {
      alert("URL materi wajib diisi untuk tipe ini.");
      return;
    }

    try {
      setIsSubmittingItem(true);

      const payload = {
        module_id: selectedModuleId,
        title: itemTitle,
        type: itemType,
        content_text: itemType === "quiz" ? "" : itemContentText,
        content_url: itemType === "quiz" ? String(selectedQuizId) : itemContentUrl,
        order_index: Number(itemOrderIndex) || 0,
      };

      const res = await fetch(`${API_BASE}/api/module-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan materi.");

      const data = await res.json();

      if (itemType !== "quiz" && itemImages.length > 0) {
        for (let i = 0; i < itemImages.length; i++) {
          const formData = new FormData();
          formData.append("material_id", data.id);
          formData.append("image", itemImages[i]);
          formData.append("image_order", i + 1);

          await fetch(`${API_BASE}/api/material-images`, {
            method: "POST",
            body: formData,
          });
        }
      }

      setShowItemModal(false);
      setSelectedModuleId(null);
      setItemTitle("");
      setItemType("text");
      setItemContentText("");
      setItemContentUrl("");
      setItemOrderIndex(0);
      setSelectedQuizId("");
      setItemImages([]);
      setQuizzes([]);

      await getModules();
    } catch (err) {
      console.error("CREATE MODULE ITEM ERROR:", err);
      alert(err.message || "Gagal menambahkan materi.");
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const updateModuleOrder = async (fromModuleId, toModuleId) => {
    if (!fromModuleId || !toModuleId || fromModuleId === toModuleId) {
      setDraggedModuleId(null);
      return;
    }

    const orderedModules = [...modules].sort(
      (a, b) =>
        Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
        Number(a.id) - Number(b.id)
    );

    const fromIndex = orderedModules.findIndex(
      (mod) => String(mod.id) === String(fromModuleId)
    );

    const toIndex = orderedModules.findIndex(
      (mod) => String(mod.id) === String(toModuleId)
    );

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedModuleId(null);
      return;
    }

    const movedModules = [...orderedModules];
    const [movedModule] = movedModules.splice(fromIndex, 1);
    movedModules.splice(toIndex, 0, movedModule);

    const reorderedModules = movedModules.map((mod, index) => ({
      ...mod,
      order_index: index + 1,
    }));

    setModules(reorderedModules);

    try {
      setSavingOrder(true);

      await Promise.all(
        reorderedModules.map((mod) =>
          fetch(`${API_BASE}/api/modules/${mod.id}/order`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order_index: mod.order_index,
            }),
          })
        )
      );
    } catch (err) {
      console.error("UPDATE MODULE ORDER ERROR:", err);
      alert("Urutan modul berubah di tampilan, tapi gagal disimpan ke database.");
      await getModules();
    } finally {
      setSavingOrder(false);
      setDraggedModuleId(null);
    }
  };

  const filteredModules = useMemo(() => {
    return modules
      .filter((m) => {
        const titleMatch = (m.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const descMatch = (m.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const itemMatch = (m.items || []).some((it) =>
          (it.title || "").toLowerCase().includes(searchTerm.toLowerCase())
        );

        return titleMatch || descMatch || itemMatch;
      })
      .sort(
        (a, b) =>
          Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
          Number(a.id) - Number(b.id)
      );
  }, [modules, searchTerm]);

  if (loading && modules.length === 0) {
    return (
      <div style={styles.loaderWrap}>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
        `}</style>
        <div style={styles.loaderIcon}>📚</div>
        <p style={styles.loaderText}>MENYUSUN ARSIP MODUL...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .module-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 12px 12px 0px #000 !important;
          border-color: #000 !important;
        }

        .modal-overlay {
          animation: fadeIn 0.3s ease;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
        }

        .input-focus:focus {
          border-color: #EAB308 !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.badge}>MODUL MANAGEMENT</div>
          <h1 style={styles.title}>
            Kelola <span style={{ color: "#EAB308" }}>Modul Pembelajaran</span>
          </h1>
          <p style={styles.subTitle}>
            Kelola modul, materi, dan quiz yang akan ditampilkan ke siswa.
          </p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              name="search-module"
              style={styles.searchInput}
              placeholder="Cari judul modul atau materi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="button"
            style={styles.addBtn}
            onClick={() => setShowModuleModal(true)}
          >
            + BUAT MODUL BARU
          </button>
        </div>
      </header>

      {error ? (
        <div style={styles.errorBox}>
          <strong>Terjadi kesalahan:</strong> {error}
        </div>
      ) : null}

      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statVal}>{modules.length}</span>
          <span style={styles.statLab}>Total Modul</span>
        </div>

        <div style={styles.statDivider}></div>

        <div style={styles.statItem}>
          <span style={styles.statVal}>{filteredModules.length}</span>
          <span style={styles.statLab}>Hasil Pencarian</span>
        </div>

        <div style={styles.statDivider}></div>

        <div style={styles.statItem}>
          <span style={{ ...styles.statVal, color: "#16A34A" }}>AKTIF</span>
          <span style={styles.statLab}>
            {savingOrder ? "Menyimpan Urutan..." : "Status Sistem"}
          </span>
        </div>
      </div>

      <main style={styles.listArea}>
        {filteredModules.length > 0 ? (
          <div style={styles.grid}>
            {filteredModules.map((module, idx) => (
              <div
                key={module.id}
                draggable={!savingOrder}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(module.id));
                  setDraggedModuleId(module.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();

                  const fromModuleId = e.dataTransfer.getData("text/plain");
                  if (!fromModuleId) return;

                  updateModuleOrder(fromModuleId, module.id);
                }}
                onDragEnd={() => setDraggedModuleId(null)}
                style={{
                  ...styles.card,
                  cursor: savingOrder ? "wait" : "grab",
                  opacity:
                    String(draggedModuleId) === String(module.id) ? 0.55 : 1,
                  borderColor:
                    String(draggedModuleId) === String(module.id)
                      ? "#EAB308"
                      : "#F1F5F9",
                  animation: `slideUp 0.5s ease forwards`,
                  animationDelay: `${idx * 0.08}s`,
                }}
                className="module-card"
              >
                <div>
                  <div style={styles.cardHeader}>
                    <div style={styles.folderIcon}>📁</div>
                    <div style={styles.moduleId}>ID: {module.id}</div>
                  </div>

                  <div style={styles.cardBody}>
                    <h3 style={styles.moduleTitle}>{module.title}</h3>
                    <p style={styles.moduleDesc}>
                      {module.description ||
                        "Tidak ada deskripsi untuk modul ini."}
                    </p>
                  </div>

                  <div style={styles.itemSummaryWrap}>
                    <div style={styles.itemSummaryHeader}>
                      <span style={styles.itemSummaryTitle}>Isi Modul</span>
                      <span style={styles.itemCountBadge}>
                        {(module.items || []).length} item
                      </span>
                    </div>

                    {(module.items || []).length > 0 ? (
                      <div style={styles.itemPreviewList}>
                        {module.items
                          .slice()
                          .sort(
                            (a, b) =>
                              Number(a.order_index ?? 0) -
                              Number(b.order_index ?? 0)
                          )
                          .map((subItem) => (
                            <div key={subItem.id} style={styles.itemPreviewCard}>
                              <div style={styles.itemPreviewTop}>
                                <span style={styles.dragHandle}>☰</span>

                                <strong style={styles.itemPreviewName}>
                                  {subItem.title || "Tanpa Judul"}
                                </strong>

                                <span
                                  style={
                                    subItem.type === "quiz"
                                      ? styles.quizBadge
                                      : styles.itemPreviewType
                                  }
                                >
                                  {subItem.type === "quiz"
                                    ? "quiz"
                                    : subItem.type || "text"}
                                </span>
                              </div>

                              {subItem.type === "quiz" ? (
                                <p style={styles.itemPreviewText}>
                                  Quiz terhubung ke ID: {subItem.content_url}
                                </p>
                              ) : subItem.content_text ? (
                                <p style={styles.itemPreviewText}>
                                  {subItem.content_text.length > 80
                                    ? `${subItem.content_text.slice(0, 80)}...`
                                    : subItem.content_text}
                                </p>
                              ) : subItem.content_url ? (
                                <a
                                  href={subItem.content_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={styles.linkText}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Lihat konten
                                </a>
                              ) : (
                                <p style={styles.itemPreviewText}>
                                  Belum ada isi.
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div style={styles.noItemBox}>
                        Belum ada materi atau quiz di modul ini.
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openTambahMateriModal(module.id);
                    }}
                  >
                    + TAMBAH ISI MODUL
                  </button>

                  <button
                    type="button"
                    style={styles.manageBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${module.id}`);
                    }}
                  >
                    KELOLA ISI MATERI ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏜️</div>
            <h3>Belum Ada Modul Terdeteksi</h3>
            <p>
              Database Anda masih kosong. Mulai susun kurikulum dengan menekan
              tombol "Buat Modul Baru".
            </p>
            <button
              type="button"
              style={styles.emptyAddBtn}
              onClick={() => setShowModuleModal(true)}
            >
              Mulai Sekarang
            </button>
          </div>
        )}
      </main>

      {showModuleModal && (
        <div style={styles.modalOverlay} className="modal-overlay">
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>Konfigurasi Modul Baru</h2>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => setShowModuleModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTambahModul} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>JUDUL UNIT</label>
                <input
                  name="module-title"
                  className="input-focus"
                  style={styles.input}
                  placeholder="Contoh: Matematika Dasar - Aljabar"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>DESKRIPSI / TUJUAN BELAJAR</label>
                <textarea
                  name="module-description"
                  className="input-focus"
                  style={{ ...styles.input, height: "120px", resize: "none" }}
                  placeholder="Apa yang akan dipelajari siswa di modul ini?"
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModuleModal(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={isSubmittingModule}
                >
                  {isSubmittingModule ? "MENYIMPAN..." : "TERBITKAN MODUL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemModal && (
        <div style={styles.modalOverlay} className="modal-overlay">
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>Tambah Isi Modul</h2>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => setShowItemModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTambahMateri} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>TIPE ISI</label>
                <select
                  name="item-type"
                  style={styles.input}
                  value={itemType}
                  onChange={handleItemTypeChange}
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="file">File</option>
                  <option value="link">Link</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              {itemType === "quiz" ? (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>PILIH QUIZ MODUL INI</label>
                    <select
                      name="selected-quiz"
                      style={styles.input}
                      value={selectedQuizId}
                      onChange={handleQuizChange}
                      required
                    >
                      <option value="">
                        {loadingQuiz
                          ? "Memuat quiz..."
                          : "Pilih quiz yang sudah dibuat"}
                      </option>

                      {quizzes.map((quiz) => (
                        <option key={quiz.id} value={quiz.id}>
                          {quiz.title || quiz.quiz_title || `Quiz #${quiz.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>JUDUL TAMPILAN DI MODUL</label>
                    <input
                      name="quiz-display-title"
                      className="input-focus"
                      style={styles.input}
                      placeholder="Contoh: Pretest"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>JUDUL MATERI</label>
                    <input
                      name="item-title"
                      className="input-focus"
                      style={styles.input}
                      placeholder="Contoh: Pengenalan Variabel"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>ISI TEKS</label>
                    <textarea
                      name="item-content-text"
                      className="input-focus"
                      style={{ ...styles.input, height: "100px", resize: "none" }}
                      placeholder="Isi materi text..."
                      value={itemContentText}
                      onChange={(e) => setItemContentText(e.target.value)}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>URL KONTEN</label>
                    <input
                      name="item-content-url"
                      className="input-focus"
                      style={styles.input}
                      placeholder="https://..."
                      value={itemContentUrl}
                      onChange={(e) => setItemContentUrl(e.target.value)}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>GAMBAR PENDUKUNG</label>
                    <input
                      name="item-images"
                      type="file"
                      multiple
                      accept="image/*"
                      style={styles.input}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setItemImages(files);
                      }}
                    />
                  </div>
                </>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  URUTAN {itemType === "quiz" ? "(isi 0 untuk pretest)" : ""}
                </label>
                <input
                  name="item-order"
                  className="input-focus"
                  style={styles.input}
                  type="number"
                  min="0"
                  value={itemOrderIndex}
                  onChange={(e) => setItemOrderIndex(e.target.value)}
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowItemModal(false)}
                >
                  BATAL
                </button>

                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={isSubmittingItem}
                >
                  {isSubmittingItem ? "MENYIMPAN..." : "SIMPAN ISI MODUL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <div style={styles.syncStatus}>
          <div style={styles.pulseDot}></div>
          TERHUBUNG KE SERVER: {user?.nama || "Guru"}
        </div>
        <p>© 2026 Arsitektur Kurikulum EduPro</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    padding: "60px 50px",
    minHeight: "100vh",
    background: "#FFF",
  },
  loaderWrap: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderIcon: {
    fontSize: "60px",
    animation: "bounce 1s infinite alternate",
  },
  loaderText: {
    marginTop: "20px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#000",
    fontSize: "12px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "50px",
    flexWrap: "wrap",
    gap: "30px",
  },
  headerLeft: {},
  badge: {
    display: "inline-block",
    background: "#000",
    color: "#FDE047",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
    marginBottom: "15px",
    letterSpacing: "1px",
  },
  title: {
    fontSize: "42px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-1.5px",
  },
  subTitle: {
    color: "#64748B",
    marginTop: "10px",
    fontSize: "16px",
  },
  headerRight: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchBox: {
    background: "#F1F5F9",
    padding: "12px 20px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "300px",
  },
  searchIcon: {
    fontSize: "16px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontWeight: "600",
    width: "100%",
  },
  addBtn: {
    background: "#EAB308",
    color: "#000",
    border: "3px solid #000",
    padding: "14px 25px",
    borderRadius: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "6px 6px 0px #000",
  },
  statsBar: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    background: "#F8FAFC",
    padding: "25px 40px",
    borderRadius: "20px",
    marginBottom: "50px",
    flexWrap: "wrap",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
  },
  statVal: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#000",
  },
  statLab: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94A3B8",
  },
  statDivider: {
    width: "2px",
    height: "30px",
    background: "#E2E8F0",
  },
  errorBox: {
    background: "#FEF2F2",
    color: "#991B1B",
    border: "2px solid #FCA5A5",
    padding: "16px 20px",
    borderRadius: "14px",
    marginBottom: "24px",
    fontWeight: "600",
  },
  listArea: {},
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "30px",
  },
  card: {
    background: "#FFF",
    border: "3px solid #F1F5F9",
    borderRadius: "25px",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.02)",
    minHeight: "420px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  folderIcon: {
    fontSize: "32px",
  },
  moduleId: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#CBD5E1",
    background: "#F8FAFC",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  cardBody: {},
  moduleTitle: {
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 10px 0",
    color: "#000",
  },
  moduleDesc: {
    fontSize: "14px",
    color: "#64748B",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  itemSummaryWrap: {
    background: "#F8FAFC",
    borderRadius: "16px",
    padding: "16px",
    marginTop: "16px",
  },
  itemSummaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  itemSummaryTitle: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#0F172A",
  },
  itemCountBadge: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#334155",
    background: "#E2E8F0",
    padding: "4px 8px",
    borderRadius: "999px",
  },
  itemPreviewList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  itemPreviewCard: {
    background: "#FFF",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "10px 12px",
    transition: "0.2s ease",
  },
  itemPreviewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  dragHandle: {
    fontSize: "14px",
    fontWeight: "900",
    color: "#94A3B8",
    cursor: "grab",
    userSelect: "none",
  },
  itemPreviewName: {
    fontSize: "13px",
    color: "#0F172A",
    flex: 1,
  },
  itemPreviewType: {
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#92400E",
    background: "#FEF3C7",
    padding: "4px 8px",
    borderRadius: "999px",
  },
  quizBadge: {
    fontSize: "10px",
    fontWeight: "900",
    textTransform: "uppercase",
    color: "#1D4ED8",
    background: "#DBEAFE",
    padding: "4px 8px",
    borderRadius: "999px",
  },
  itemPreviewText: {
    fontSize: "12px",
    color: "#475569",
    margin: 0,
    lineHeight: "1.5",
  },
  linkText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563EB",
    textDecoration: "none",
  },
  moreItemsText: {
    color: "#64748B",
    fontWeight: "700",
  },
  noItemBox: {
    fontSize: "12px",
    color: "#64748B",
    background: "#FFF",
    borderRadius: "12px",
    padding: "12px",
    border: "1px dashed #CBD5E1",
  },
  cardFooter: {
    display: "flex",
    gap: "10px",
    marginTop: "24px",
    flexWrap: "wrap",
  },
  secondaryBtn: {
    flex: 1,
    minWidth: "140px",
    padding: "14px",
    background: "#FDE047",
    color: "#000",
    border: "2px solid #000",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  manageBtn: {
    flex: 1,
    minWidth: "160px",
    padding: "14px",
    background: "#000",
    color: "#FDE047",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "13px",
  },
  emptyState: {
    textAlign: "center",
    padding: "100px 0",
    border: "3px dashed #F1F5F9",
    borderRadius: "40px",
  },
  emptyIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },
  emptyAddBtn: {
    marginTop: "20px",
    padding: "12px 30px",
    background: "#FDE047",
    border: "3px solid #000",
    fontWeight: "800",
    borderRadius: "12px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modalContent: {
    background: "#FFF",
    width: "100%",
    maxWidth: "560px",
    padding: "40px",
    borderRadius: "30px",
    border: "4px solid #000",
    boxShadow: "15px 15px 0px #FDE047",
    position: "relative",
    animation: "slideUp 0.4s ease",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    fontWeight: "800",
    cursor: "pointer",
  },
  form: {},
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "900",
    marginBottom: "10px",
    letterSpacing: "1px",
  },
  input: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "2px solid #F1F5F9",
    background: "#F8FAFC",
    fontWeight: "600",
    outline: "none",
  },
  formActions: {
    display: "flex",
    gap: "15px",
    marginTop: "30px",
  },
  cancelBtn: {
    flex: 1,
    padding: "15px",
    background: "#F1F5F9",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 2,
    padding: "15px",
    background: "#000",
    color: "#FDE047",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  footer: {
    marginTop: "100px",
    borderTop: "2px solid #F1F5F9",
    paddingTop: "30px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: "700",
    color: "#CBD5E1",
    gap: "20px",
    flexWrap: "wrap",
  },
  syncStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#16A34A",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    background: "#16A34A",
    borderRadius: "50%",
    boxShadow: "0 0 10px #16A34A",
  },
};

export default GuruModul;
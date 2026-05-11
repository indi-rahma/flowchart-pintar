import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const ModulePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState(null);
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
    const match = url.match(regExp);
    return match?.[2] ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const normalizeDone = (item) => {
    return (
      item.done === 1 ||
      item.done === true ||
      item.is_done === 1 ||
      item.is_done === true ||
      item.completed === 1 ||
      item.completed === true ||
      item.progress_done === 1 ||
      item.progress_done === true
    );
  };

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);

        const [moduleRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE}/api/modules/${id}`),
          fetch(`${API_BASE}/api/module-items?moduleId=${id}&userId=${userId}`),
        ]);

        if (!moduleRes.ok) throw new Error("Gagal mengambil detail modul");
        if (!itemsRes.ok) throw new Error("Gagal mengambil item materi");

        const moduleResult = await moduleRes.json();
        const itemsResult = await itemsRes.json();

        const sortedItems = Array.isArray(itemsResult)
          ? itemsResult
              .sort(
                (a, b) =>
                  Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
                  Number(a.id) - Number(b.id)
              )
              .map((item) => ({
                ...item,
                done: normalizeDone(item),
              }))
          : [];

        setModuleData(moduleResult);
        setItems(sortedItems);
        setActiveIndex(0);
      } catch (err) {
        console.error("Gagal fetch module:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && userId) fetchModule();
  }, [id, userId]);

  const activeItem = items[activeIndex];

  const progress = useMemo(() => {
    const doneCount = items.filter((item) => item.done).length;
    return items.length ? Math.round((doneCount / items.length) * 100) : 0;
  }, [items]);

  const handleNext = async () => {
    if (!activeItem || saving) return;

    if (!userId) {
      alert("User belum terbaca. Coba login ulang.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/api/modules/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          moduleItemId: activeItem.id,
          done: 1,
        }),
      });

      const resultText = await res.text();

      if (!res.ok) {
        console.error("Response progress error:", resultText);
        throw new Error("Gagal menyimpan progress");
      }

      const updated = items.map((item, idx) =>
        idx === activeIndex ? { ...item, done: true } : item
      );

      setItems(updated);

      let next = activeIndex + 1;

      while (
        next < updated.length &&
        (updated[next].locked || updated[next].is_locked)
      ) {
        next++;
      }

      if (next < updated.length) {
        setActiveIndex(next);
      }
    } catch (err) {
      console.error("Gagal update progress:", err);
      alert("Progress gagal disimpan. Cek backend endpoint /api/modules/progress.");
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (!activeItem) {
      return <div style={emptyBoxStyle}>Belum ada materi</div>;
    }

    if (activeItem.type === "video") {
      const embedUrl = getYoutubeEmbedUrl(activeItem.content_url);

      return (
        <div style={cardStyle}>
          {embedUrl ? (
            <div style={{ aspectRatio: "16 / 9", width: "100%" }}>
              <iframe
                src={embedUrl}
                title={activeItem.title}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={emptyBoxStyle}>Video tidak valid</div>
          )}
        </div>
      );
    }

    if (activeItem.type === "quiz") {
      return (
        <div style={contentBoxStyle}>
          <h3 style={{ marginTop: 0 }}>Quiz: {activeItem.title}</h3>
          <p>Materi ini bertipe quiz.</p>

          {activeItem.content_text && (
            <div style={textBoxStyle}>{activeItem.content_text}</div>
          )}
        </div>
      );
    }

    return (
      <div style={contentBoxStyle}>
        {activeItem.content_text ? (
          <div style={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {activeItem.content_text}
          </div>
        ) : (
          <p style={{ color: "#64748b" }}>Belum ada isi materi.</p>
        )}

        {activeItem.content_url && (
          <div style={{ marginTop: 24 }}>
            <img
              src={activeItem.content_url}
              alt={activeItem.title}
              style={{
                maxWidth: "100%",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
              }}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h3>Memuat materi...</h3>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Materi tidak ditemukan</h2>
        <button onClick={() => navigate("/")}>Kembali</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <aside style={sidebarStyle}>
        <div style={{ padding: 20 }}>
          <button onClick={() => navigate("/")}>Dashboard</button>

          <h3>{moduleData.title}</h3>
          <p>{progress}% selesai</p>

          <div style={progressTrackStyle}>
            <div style={{ ...progressFillStyle, width: `${progress}%` }} />
          </div>
        </div>

        {items.map((item, idx) => {
          const isDone = item.done;
          const isLocked = item.locked || item.is_locked;

          return (
            <div
              key={item.id}
              onClick={() => !isLocked && setActiveIndex(idx)}
              style={{
                padding: 12,
                cursor: isLocked ? "not-allowed" : "pointer",
                background: idx === activeIndex ? "#e0f2fe" : "transparent",
                opacity: isLocked ? 0.5 : 1,
                borderBottom: "1px solid #eee",
              }}
            >
              {isLocked ? "🔒" : isDone ? "✅" : "⚪"} {item.title}
            </div>
          );
        })}
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <h2>{activeItem?.title}</h2>

        {renderContent()}

        <button onClick={handleNext} disabled={saving} style={nextButtonStyle}>
          {saving ? "Menyimpan..." : "Selesai & Lanjut →"}
        </button>
      </main>
    </div>
  );
};

const sidebarStyle = {
  width: 300,
  borderRight: "1px solid #e5e7eb",
  background: "#fff",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};

const contentBoxStyle = {
  minHeight: 400,
  background: "#fff",
  color: "#111",
  borderRadius: 20,
  border: "1px solid #e5e7eb",
  padding: 24,
  overflow: "auto",
};

const emptyBoxStyle = {
  height: 400,
  background: "#111",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 20,
};

const textBoxStyle = {
  marginTop: 16,
  padding: 16,
  background: "#f8fafc",
  borderRadius: 12,
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
};

const progressTrackStyle = {
  width: "100%",
  height: 10,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
};

const progressFillStyle = {
  height: "100%",
  background: "#2563eb",
  borderRadius: 999,
  transition: "width 0.3s ease",
};

const nextButtonStyle = {
  marginTop: 20,
  padding: "12px 18px",
  border: "none",
  borderRadius: 12,
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default ModulePlayer;
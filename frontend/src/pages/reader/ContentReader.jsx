import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HalamanKuis from "../quiz/HalamanKuis";
import HeaderMateri from "./HeaderMateri";
import KontenMateri from "./KontenMateri";
import SidebarMateri from "./SidebarMateri";
import "./reader.css";

const API_URL = "http://localhost:5000";

const ContentReader = () => {
  const { moduleId, itemId } = useParams();
  const playerRef = useRef(null);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(0);
  const [moduleItems, setModuleItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentModul, setCurrentModul] = useState(null);
  const [materialImages, setMaterialImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const parsedModuleId = Number(moduleId);
  const currentItemId = Number(itemId);

  const getEmbedVideoId = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;

    const match = url.match(regExp);
    return match?.[2] || null;
  };

  const isDone = (item) =>
    item.done === 1 ||
    item.done === true ||
    item.is_done === 1 ||
    item.is_done === true ||
    item.completed === 1 ||
    item.completed === true ||
    item.progress_done === 1 ||
    item.progress_done === true;

  const normalizeItem = (item) => {
    const title = String(item.title || "").toLowerCase();
    const type = String(item.type || "").toLowerCase();

    const looksLikeQuiz =
      type === "quiz" ||
      title.includes("quiz") ||
      title.includes("kuis") ||
      title.includes("pretest") ||
      title.includes("posttest");

    return {
      ...item,
      type: looksLikeQuiz ? "quiz" : item.type,
      done: isDone(item),
    };
  };

  useEffect(() => {
    const fetchReaderData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!parsedModuleId || !currentItemId) {
          throw new Error("Parameter route tidak lengkap.");
        }

        const [moduleRes, itemsRes, imagesRes] = await Promise.all([
          fetch(`${API_URL}/api/student/modules`),
          fetch(
            `${API_URL}/api/module-items?moduleId=${parsedModuleId}&userId=${userId}`
          ),
          fetch(`${API_URL}/api/material-images?materialId=${currentItemId}`),
        ]);

        if (!moduleRes.ok) throw new Error("Gagal mengambil modul.");
        if (!itemsRes.ok) throw new Error("Gagal mengambil materi.");

        const modulesData = await moduleRes.json();
        const itemsData = await itemsRes.json();
        const imagesData = imagesRes.ok ? await imagesRes.json() : [];

        const selectedModule = modulesData.find(
          (m) => Number(m.id) === parsedModuleId
        );

        if (!selectedModule) throw new Error("Modul tidak ditemukan.");

        const sortedItems = Array.isArray(itemsData)
          ? itemsData
              .sort(
                (a, b) =>
                  Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
                  Number(a.id) - Number(b.id)
              )
              .map(normalizeItem)
          : [];

        const selectedItem = sortedItems.find(
          (item) => Number(item.id) === currentItemId
        );

        if (!selectedItem) throw new Error("Materi tidak ditemukan.");

        setCurrentModul(selectedModule);
        setModuleItems(sortedItems);
        setCurrentItem(selectedItem);
        setMaterialImages(Array.isArray(imagesData) ? imagesData : []);
      } catch (err) {
        console.error("READER ERROR:", err);
        setError(err.message || "Terjadi kesalahan saat memuat materi.");
      } finally {
        setLoading(false);
      }
    };

    fetchReaderData();
  }, [parsedModuleId, currentItemId, userId]);

  const currentIndex = moduleItems.findIndex(
    (item) => Number(item.id) === Number(currentItem?.id)
  );

  const prevItem = currentIndex > 0 ? moduleItems[currentIndex - 1] : null;

  const nextItem =
    currentIndex >= 0 && currentIndex < moduleItems.length - 1
      ? moduleItems[currentIndex + 1]
      : null;

  const saveProgress = async () => {
    if (!currentItem || currentItem.done || saving) return true;

    if (!userId) {
      alert("User belum kebaca. Coba login ulang.");
      return false;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/api/modules/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          moduleItemId: currentItem.id,
          done: 1,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Progress error:", text);
        throw new Error("Gagal menyimpan progress.");
      }

      const completedState = {
  done: true,
  is_done: true,
  completed: true,
  progress_done: true,
};

setCurrentItem((prev) =>
  prev ? { ...prev, ...completedState } : prev
);

setModuleItems((prev) =>
  prev.map((item) =>
    Number(item.id) === Number(currentItem.id)
      ? { ...item, ...completedState }
      : item
  )
);

      return true;
    } catch (err) {
      console.error("Gagal update progress:", err);
      alert("Progress gagal disimpan.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goToNextModule = async () => {
    try {
      const res = await fetch(`${API_URL}/api/student/modules`);
      const modules = await res.json();

      const sortedModules = Array.isArray(modules)
        ? modules.sort((a, b) => Number(a.id) - Number(b.id))
        : [];

      const currentModuleIndex = sortedModules.findIndex(
        (m) => Number(m.id) === parsedModuleId
      );

      const nextModule = sortedModules[currentModuleIndex + 1];

      if (!nextModule) {
        alert("🎉 Semua modul sudah selesai!");
        navigate("/modul-saya");
        return;
      }

      const itemsRes = await fetch(
        `${API_URL}/api/module-items?moduleId=${nextModule.id}&userId=${userId}`
      );

      const nextModuleItems = await itemsRes.json();

      const sortedItems = Array.isArray(nextModuleItems)
        ? nextModuleItems
            .sort(
              (a, b) =>
                Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
                Number(a.id) - Number(b.id)
            )
            .map(normalizeItem)
        : [];

      const firstItem = sortedItems[0];

      if (!firstItem) {
        alert("Modul berikutnya belum punya materi.");
        navigate("/modul-saya");
        return;
      }

      navigate(`/reader/${nextModule.id}/${firstItem.id}`);
    } catch (err) {
      console.error("Gagal lanjut modul:", err);
      alert("Gagal lanjut ke modul berikutnya.");
    }
  };

  const handleSelesaiDanLanjut = async () => {
    const saved = await saveProgress();
    if (!saved) return;

    if (nextItem) {
      navigate(`/reader/${parsedModuleId}/${nextItem.id}`);
      return;
    }

    await goToNextModule();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const now = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();

        setCurrentTime(now);

        if (duration > 0 && now > duration - 2 && !currentItem?.done) {
          saveProgress();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentItem?.done, currentItemId]);

  const jumpTo = (seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  if (loading) {
    return (
      <div className="reader-center-state">
        <div className="reader-loader-dot"></div>
        <p>Memuat materi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reader-center-state">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="reader-dark-button"
        >
          ← Kembali
        </button>
      </div>
    );
  }

  if (!currentModul || !currentItem) {
    return <div className="reader-center-state">Materi tidak ditemukan.</div>;
  }

  const videoId =
    currentItem.type === "video"
      ? getEmbedVideoId(currentItem.content_url || "")
      : null;

  return (
    <div className="reader-page">
      <div className="reader-blur reader-blur-one"></div>
      <div className="reader-blur reader-blur-two"></div>

      <button
        type="button"
        onClick={() => navigate("/modul-saya")}
        className="reader-back-button"
      >
        ← Modul Saya
      </button>

      <div className="reader-layout">
        <main className="reader-main">
          <HeaderMateri
            modul={currentModul}
            item={currentItem}
            index={currentIndex}
            total={moduleItems.length}
          />

          <KontenMateri
            API_URL={API_URL}
            item={currentItem}
            images={materialImages}
            videoId={videoId}
            playerRef={playerRef}
            saveProgress={saveProgress}
            HalamanKuis={HalamanKuis}
            moduleId={parsedModuleId}
            handleSelesaiDanLanjut={handleSelesaiDanLanjut}
          />

          <section className="reader-nav-row">
            <button
              type="button"
              disabled={!prevItem}
              className="reader-nav-button"
              onClick={() =>
                prevItem && navigate(`/reader/${parsedModuleId}/${prevItem.id}`)
              }
            >
              ← Sebelumnya
            </button>

            <button
              type="button"
              className="reader-nav-button is-primary"
              onClick={handleSelesaiDanLanjut}
              disabled={saving}
            >
              {saving
                ? "Menyimpan..."
                : nextItem
                ? "Selanjutnya →"
                : "Selesai Modul 🎉"}
            </button>
          </section>
        </main>

        <SidebarMateri
          moduleItems={moduleItems}
          currentItem={currentItem}
          parsedModuleId={parsedModuleId}
          navigate={navigate}
          currentTime={currentTime}
          jumpTo={jumpTo}
        />
      </div>
    </div>
  );
};

export default ContentReader;
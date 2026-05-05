import React, { useEffect, useMemo, useState } from "react";
import TampilanLoading from "./TampilanLoading";
import BagianStatistik from "./BagianStatistik";
import DaftarRiwayatKuis from "./DaftarRiwayatKuis";
import "./RiwayatKuis.css";

const RiwayatKuis = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const getEvaluasiByScore = (score) => {
    const nilai = Number(score) || 0;

    if (nilai >= 90) {
      return {
        level: "Sangat Baik",
        message:
          "Pemahaman materi sangat kuat. Pertahankan konsistensi dan lanjutkan ke latihan dengan tingkat kesulitan lebih tinggi.",
      };
    }

    if (nilai >= 80) {
      return {
        level: "Baik",
        message:
          "Hasil belajar sudah solid. Perhatikan kembali beberapa bagian kecil agar performa semakin stabil.",
      };
    }

    if (nilai >= 70) {
      return {
        level: "Cukup",
        message:
          "Pemahaman dasar sudah terbentuk. Latihan tambahan akan membantu meningkatkan ketepatan jawaban.",
      };
    }

    if (nilai >= 60) {
      return {
        level: "Perlu Latihan",
        message:
          "Kamu sudah mulai memahami materi, namun masih perlu mengulang konsep utama dan mencoba latihan serupa.",
      };
    }

    return {
      level: "Perlu Bimbingan",
      message:
        "Materi ini masih perlu dipelajari ulang. Mulai dari konsep dasar, lalu ulangi kuis setelah latihan.",
    };
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        setError("Silakan login terlebih dahulu untuk melihat riwayat kuis.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:5000/api/user/quiz-history?user_id=${userId}`
        );

        if (!res.ok) {
          throw new Error("Gagal mengambil data riwayat kuis.");
        }

        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setError("Riwayat kuis belum dapat dimuat. Silakan coba lagi nanti.");
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchHistory();
  }, [userId]);

  const resultsWithEvaluation = useMemo(() => {
    return results.map((item) => ({
      ...item,
      evaluation: getEvaluasiByScore(item.score),
    }));
  }, [results]);

  const stats = useMemo(() => {
    const valid = resultsWithEvaluation.filter((item) => item.score !== null);
    const total = valid.length;

    const totalScore = valid.reduce(
      (acc, curr) => acc + (Number(curr.score) || 0),
      0
    );

    const avg = total > 0 ? Math.round(totalScore / total) : 0;

    const passed = valid.filter(
      (item) => item.is_pass === 1 || item.is_pass === true
    ).length;

    let rank = "Pemula";
    let icon = "📘";

    if (avg >= 90) {
      rank = "Unggul";
      icon = "🏆";
    } else if (avg >= 80) {
      rank = "Aktif";
      icon = "⭐";
    } else if (avg >= 70) {
      rank = "Berkembang";
      icon = "📈";
    }

    return { total, avg, passed, rank, icon };
  }, [resultsWithEvaluation]);

  const filtered = resultsWithEvaluation.filter((item) =>
    item.quiz_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <TampilanLoading />;

  return (
    <div className="riwayat-page">
      <div className="riwayat-container">
        <BagianStatistik
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {error && (
          <div className="alert-error">
            <strong>Riwayat tidak dapat dimuat</strong>
            <p>{error}</p>
          </div>
        )}

        <DaftarRiwayatKuis data={filtered} />

        <footer className="footer-riwayat">
          <p>
            Terakhir diperbarui: {new Date().toLocaleTimeString("id-ID")}
          </p>
          <div className="sync-status">
            <span className="sync-dot" />
            Data tersinkron
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RiwayatKuis;
import React from "react";
import "./dashboard.css";

const StatCard = ({ icon, label, value }) => (
  <div className="dashboard-stat-card stat-card">
    <div className="dashboard-stat-icon">{icon}</div>

    <div>
      <div className="dashboard-stat-label">{label}</div>
      <div className="dashboard-stat-value">{value}</div>
    </div>
  </div>
);

const RingkasanBelajar = ({ user, summary, navigate }) => {
  const lanjutBelajar = () => {
    if (summary.nextModule && summary.nextItem) {
      navigate(`/reader/${summary.nextModule.id}/${summary.nextItem.id}`);
      return;
    }

    navigate("/modul-saya");
  };

  return (
    <>
      <section className="dashboard-hero soft-pop">
        <div className="dashboard-hero-content">
          <div className="dashboard-badges">
            <span className="dashboard-badge-primary">Flowchart Pintar</span>

            <span className="dashboard-badge-live">
              <span className="dashboard-live-dot"></span>
              Progress tersinkron
            </span>
          </div>

          <h1 className="dashboard-hero-title">
            Hai,{" "}
            <span className="dashboard-name-text">
              {user?.nama || "Siswa"}
            </span>
            <br />
            yuk lanjut belajar hari ini.
          </h1>

          <p className="dashboard-hero-desc">
            Ikuti modul secara berurutan, selesaikan materi, lalu buka modul
            berikutnya. Progress kamu akan otomatis mengikuti data belajar.
          </p>

          <div className="dashboard-hero-actions">
            <button
              type="button"
              className="dashboard-primary-button"
              onClick={lanjutBelajar}
            >
              🚀 Lanjutkan Belajar
            </button>

            <button
              type="button"
              className="dashboard-secondary-button"
              onClick={() => navigate("/pencapaian")}
            >
              🏆 Lihat Pencapaian
            </button>
          </div>
        </div>

        <div className="dashboard-progress-card">
          <div className="dashboard-ring-outer">
            <div
              className="dashboard-ring-fill"
              style={{
                background: `conic-gradient(#FACC15 0deg, #2563EB ${
                  summary.overallProgress * 3.6
                }deg, #E2E8F0 0deg)`,
              }}
            >
              <div className="dashboard-ring-inner">
                <span className="dashboard-ring-value">
                  {summary.overallProgress}%
                </span>

                <span className="dashboard-ring-label">
                  Progress
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-progress-text">
            {summary.completedItems} dari {summary.totalItems} materi selesai
          </div>
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <StatCard
          icon="📚"
          label="Total Modul"
          value={summary.totalModules}
        />

        <StatCard
          icon="✅"
          label="Materi Selesai"
          value={`${summary.completedItems}/${summary.totalItems}`}
        />

        <StatCard
          icon="🎓"
          label="Modul Tuntas"
          value={summary.completedModules}
        />
      </section>
    </>
  );
};

export default RingkasanBelajar;
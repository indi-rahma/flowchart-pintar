import React from "react";

const BagianStatistik = ({ stats, searchTerm, setSearchTerm }) => {
  const completedMissions = stats.completedMissions || 0;
  const totalMissions = stats.totalMissions || 0;

  return (
    <>
      <header className="header-riwayat">
        <div className="header-left">
          <div className="rank-box cyber-card">
            <span className="rank-icon">{stats.icon}</span>
            <div>
              <span className="rank-title">CURRENT RANK</span>
              <span className="rank-user">{stats.rank}</span>
            </div>
          </div>

          <h1 className="main-title glitch" data-text="Quiz Arcade">
            Quiz <span>Arcade</span>
          </h1>

          <p className="subtitle">
            Riwayat kuismu berubah jadi papan skor. Lihat nilai, status lulus,
            dan buktiin kalau progress kamu makin naik tiap misi.
          </p>
        </div>

        <div className="search-wrapper cyber-card">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Cari kuis yang sudah selesai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <section className="hero-stats">
        <div className="main-stat-card score-card">
          <div>
            <span className="main-stat-label">AVERAGE SCORE</span>
            <div className="main-stat-value">{stats.avg}</div>
            <p className="main-stat-hint">
              {stats.avg >= 80
                ? "Mode kamu lagi panas. Pertahankan ritmenya 🔥"
                : "Masih bisa naik. Satu kuis lagi bisa jadi comeback ⚡"}
            </p>
          </div>
          <div className="main-stat-decor">⭐</div>
        </div>

        <div className="side-stats-row">
          <div className="side-card cyber-card">
            <div className="side-icon">📚</div>
            <div>
              <span className="side-label">TOTAL QUIZ</span>
              <span className="side-value">{stats.total}</span>
            </div>
          </div>

          <div className="side-card side-card-green cyber-card">
            <div className="side-icon">✅</div>
            <div>
              <span className="side-label">MISI SELESAI</span>
              <span className="side-value">
                {completedMissions} / {totalMissions}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BagianStatistik;
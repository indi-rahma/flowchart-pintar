import React from "react";
import { styles } from "./GayaModulSaya";

const RingkasanModul = ({ summary, totalModul }) => {
  return (
    <section style={styles.hero} className="hero">
      <div style={styles.heroMain} className="holo-card">
        <div style={styles.heroBeam}></div>

        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>OVERALL MISSION</span>
          <span style={styles.progressValue}>{summary.totalProgress}%</span>
        </div>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${summary.totalProgress}%`,
            }}
          />
        </div>

        <div style={styles.heroNote}>
          {summary.completedLessons} dari {summary.totalLessons} materi selesai
        </div>

        <div style={styles.heroMessage}>
          {summary.totalProgress >= 100
            ? "Semua modul selesai. Kamu sudah menaklukkan semua misi! 🏆"
            : "Satu modul lagi hari ini bisa bikin progress kamu naik drastis. Gas tipis-tipis dulu 😎"}
        </div>
      </div>

      <div style={styles.summaryGrid} className="summary-grid">
        <div style={styles.summaryCard} className="cyber-card">
          <div style={styles.summaryIcon}>📚</div>
          <div style={styles.summaryNumber}>{totalModul}</div>
          <div style={styles.summaryLabel}>Total Modul</div>
        </div>

        <div style={styles.summaryCard} className="cyber-card">
          <div style={styles.summaryIcon}>🏁</div>
          <div style={styles.summaryNumber}>{summary.completedCourses}</div>
          <div style={styles.summaryLabel}>Modul Selesai</div>
        </div>
      </div>
    </section>
  );
};

export default RingkasanModul;

import React from "react";
import { styles } from "./GayaModulSaya";

const KartuModul = ({ course, index, navigate }) => {
  const totalLesson = Number(course.totalItems || course.lessons?.length || 0);
  const doneLesson = Number(
    course.doneItems || course.lessons?.filter((lesson) => lesson.done).length || 0
  );
  const progress = Number(course.progress || 0);

  const firstLesson = course.lessons?.[0];
  const canOpen = Boolean(firstLesson);

  return (
    <article
      className="module-card cyber-card"
      style={{
        ...styles.card,
        opacity: canOpen ? 1 : 0.72,
      }}
    >
      <div style={styles.cardGlow}></div>

      <div style={styles.cardTop}>
        <div style={styles.moduleIndex}>
          <span style={styles.moduleDot}></span>
          Misi {String(index + 1).padStart(2, "0")}
        </div>

        <div
          style={{
            ...styles.statusBadge,
            background:
              progress === 100
                ? "linear-gradient(135deg, #dcfce7, #ffffff)"
                : "linear-gradient(135deg, #eff6ff, #ffffff)",
            color: progress === 100 ? "#166534" : "#1d4ed8",
          }}
        >
          {progress === 100 ? "CLEAR" : `${progress}%`}
        </div>
      </div>

      <h3 style={styles.cardTitle}>{course.title}</h3>

      <p style={styles.cardDesc}>
        {course.description?.trim()
          ? course.description
          : "Modul ini siap dipelajari. Buka dan lanjutkan misi belajarmu."}
      </p>

      <div style={styles.cardInfoRow}>
        <span style={styles.cardInfoText}>
          {doneLesson}/{totalLesson} materi berhasil diselesaikan
        </span>
      </div>

      <div style={styles.miniProgress}>
        <div
          style={{
            ...styles.miniProgressFill,
            width: `${progress}%`,
          }}
        />
      </div>

      <div style={styles.lessonPreview}>
        {(course.lessons || []).slice(0, 3).map((lesson) => (
          <span key={lesson.id} style={styles.lessonChip}>
            {lesson.done ? "✓" : "•"} {lesson.title}
          </span>
        ))}
      </div>

      <button
        type="button"
        disabled={!canOpen}
        onClick={() => {
          if (canOpen) {
            navigate(`/reader/${course.id}/${firstLesson.id}`);
          }
        }}
        style={{
          ...styles.actionButton,
          ...(canOpen ? {} : styles.actionButtonDisabled),
        }}
        className={canOpen ? "neon-button" : ""}
      >
        {canOpen ? "Launch Modul →" : "Belum Tersedia"}
      </button>
    </article>
  );
};

export default KartuModul;

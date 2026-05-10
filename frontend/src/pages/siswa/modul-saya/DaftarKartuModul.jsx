import React from "react";
import { styles } from "./GayaModulSaya";
import KartuModul from "./KartuModul";

const DaftarKartuModul = ({ courses, error, navigate }) => {
  if (courses.length > 0) {
    return (
      <section className="module-grid">
        {courses.map((course, index) => (
          <KartuModul
            key={course.id}
            course={course}
            index={index}
            navigate={navigate}
          />
        ))}
      </section>
    );
  }

  if (!error) {
    return (
      <div style={styles.emptyState} className="cyber-card">
        <h3 style={styles.emptyTitle}>Belum ada modul</h3>
        <p style={styles.emptyText}>
          Modul yang tersedia akan muncul di halaman ini.
        </p>
      </div>
    );
  }

  return null;
};

export default DaftarKartuModul;

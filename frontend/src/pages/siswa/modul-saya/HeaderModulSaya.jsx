import React from "react";
import { styles } from "./GayaModulSaya";

const HeaderModulSaya = ({ user }) => {
  const getInitial = (name) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <header style={styles.topbar} className="topbar">
      <div>
        <div style={styles.badgeRow}>
          <p style={styles.eyebrow}>FLOWCHART PINTAR LAB</p>
          <span style={styles.liveBadge}>
            <span style={styles.liveDot}></span>
            MODULE SYNCED
          </span>
        </div>

        <h1 style={styles.pageTitle} className="glitch" data-text="Modul Saya">
          Modul Saya
        </h1>

        <p style={styles.pageSubtitle}>
          Pilih misi belajarmu, buka modul, dan lanjutkan progress seperti
          sedang unlock level baru.
        </p>
      </div>

      <div style={styles.userCard} className="cyber-card">
        <div style={styles.avatar}>{getInitial(user?.nama)}</div>
        <div>
          <div style={styles.userName}>{user?.nama || "User"}</div>
          <div style={styles.userMeta}>Siap lanjut belajar 🚀</div>
        </div>
      </div>
    </header>
  );
};

export default HeaderModulSaya;

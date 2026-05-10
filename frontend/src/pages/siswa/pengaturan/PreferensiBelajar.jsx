import React from "react";
import { styles } from "./stylePengaturan";

const PreferensiBelajar = ({ notif, setNotif, sound, setSound }) => {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.iconCircle}>🔔</span>
        <div>
          <h4 style={styles.cardTitle}>Preferensi Belajar</h4>
          <p style={styles.cardSub}>Atur pengalaman belajar sesuai gayamu.</p>
        </div>
      </div>

      <BarisPengaturan
        title="Notifikasi Email"
        desc="Dapatkan pengingat jadwal belajar harian."
        active={notif}
        onClick={() => setNotif(!notif)}
      />

      <div style={styles.divider}></div>

      <BarisPengaturan
        title="Efek Suara"
        desc="Mainkan suara saat modul berhasil diselesaikan."
        active={sound}
        onClick={() => setSound(!sound)}
      />
    </div>
  );
};

const BarisPengaturan = ({ title, desc, active, onClick }) => {
  return (
    <div style={styles.row}>
      <div style={styles.rowText}>
        <b style={styles.rowTitle}>{title}</b>
        <p style={styles.rowSub}>{desc}</p>
      </div>

      <div
        onClick={onClick}
        style={{
          ...styles.toggle,
          background: active
            ? "linear-gradient(135deg, #FACC15, #FDE68A)"
            : "#E2E8F0",
        }}
      >
        <div
          style={{
            ...styles.circle,
            left: active ? 25 : 4,
            boxShadow: active ? "0 0 14px rgba(250,204,21,0.7)" : "none",
          }}
        />
      </div>
    </div>
  );
};

export default PreferensiBelajar;
import React from "react";
import { styles } from "./stylePengaturan";

const KeamananAkun = ({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.iconCircle}>🔐</span>
        <div>
          <h4 style={styles.cardTitle}>Keamanan Akun</h4>
          <p style={styles.cardSub}>
            Ganti password secara berkala biar akun aman.
          </p>
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Password Lama</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={styles.input}
          placeholder="Masukkan password lama"
        />
      </div>

      <div style={styles.twoColumn}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password Baru</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
            placeholder="Password baru"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Konfirmasi Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            placeholder="Ulangi password"
          />
        </div>
      </div>
    </div>
  );
};

export default KeamananAkun;
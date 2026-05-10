import React from "react";
import { styles } from "./stylePengaturan";

const FormProfil = ({
  name,
  setName,
  username,
  setUsername,
  email,
  setEmail,
}) => {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.iconCircle}>👤</span>
        <div>
          <h4 style={styles.cardTitle}>Profil Pengguna</h4>
          <p style={styles.cardSub}>Ubah identitas akun belajarmu.</p>
        </div>
      </div>

      <div style={styles.twoColumn}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nama Lengkap</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            placeholder="contoh: siswa_rpl01"
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          placeholder="nama@email.com"
        />
      </div>
    </div>
  );
};

export default FormProfil;
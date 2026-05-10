import React from "react";
import { styles } from "./stylePengaturan";

const KartuProfil = ({
  name,
  email,
  profilePreview,
  handleProfileChange,
}) => {
  return (
    <div style={styles.profileCard}>
      <div style={styles.profileLeft}>
        <div style={styles.avatarWrap}>
          {profilePreview ? (
            <img src={profilePreview} alt="Profile" style={styles.avatarImg} />
          ) : (
            <span style={styles.avatarText}>
              {(name || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <h3 style={styles.profileName}>{name || "Nama Pengguna"}</h3>
          <p style={styles.profileMeta}>{email || "email belum diatur"}</p>
        </div>
      </div>

      <label style={styles.uploadBtn}>
        Ganti Foto
        <input
          type="file"
          accept="image/*"
          onChange={handleProfileChange}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
};

export default KartuProfil;
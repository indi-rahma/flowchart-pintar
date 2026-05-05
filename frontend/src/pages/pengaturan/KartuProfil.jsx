import React from "react";

const KartuProfil = ({
  name,
  username,
  email,
  bio,
  profilePreview,
  coverPreview,
  onProfileChange,
  onCoverChange,
}) => {
  return (
    <section className="profil-facebook-card">
      <div className="profil-cover">
        {coverPreview ? (
          <img src={coverPreview} alt="Cover profil" className="profil-cover-img" />
        ) : (
          <div className="profil-cover-fallback"><span>Flowchart Pintar</span></div>
        )}

        <label className="btn-cover">
          📷 Edit Cover
          <input type="file" accept="image/*" onChange={onCoverChange} hidden />
        </label>
      </div>

      <div className="profil-main">
        <div className="profil-avatar-wrap">
          {profilePreview ? (
            <img src={profilePreview} alt="Foto profil" className="profil-avatar" />
          ) : (
            <div className="profil-avatar-fallback">{(name || "U").charAt(0).toUpperCase()}</div>
          )}

          <label className="btn-avatar">
            📷
            <input type="file" accept="image/*" onChange={onProfileChange} hidden />
          </label>
        </div>

        <div className="profil-info">
          <div className="profil-name-row">
            <h1>{name || "Nama Pengguna"}</h1>
            <span className="profil-badge">Siswa Aktif</span>
          </div>

          <p className="profil-username">@{username || "username"}</p>
          <p className="profil-bio">{bio || "Belum ada bio."}</p>

          <div className="profil-meta">
            <span>📧 {email || "email belum diatur"}</span>
            <span>🎯 Flowchart Learner</span>
            <span>⚡ Progress tersinkron</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KartuProfil;

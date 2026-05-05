import React from "react";

const FormAkun = ({
  name, setName, username, setUsername, email, setEmail, bio, setBio,
  oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
}) => {
  return (
    <div className="pengaturan-left">
      <section className="pengaturan-card">
        <div className="card-header">
          <span className="icon-card">👤</span>
          <div><h2>Info Profil</h2><p>Atur identitas akun belajarmu seperti tampilan profil sosial.</p></div>
        </div>

        <div className="form-grid">
          <label className="input-group"><span>Nama Lengkap</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama lengkap" /></label>
          <label className="input-group"><span>Username</span><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="contoh: siswa_rpl01" /></label>
        </div>

        <label className="input-group"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" /></label>
        <label className="input-group"><span>Bio Singkat</span><textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceritakan sedikit tentang kamu..." rows={4} /></label>
      </section>

      <section className="pengaturan-card">
        <div className="card-header">
          <span className="icon-card">🔐</span>
          <div><h2>Keamanan Akun</h2><p>Ganti password secara berkala supaya akun tetap aman.</p></div>
        </div>

        <label className="input-group"><span>Password Lama</span><input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Masukkan password lama" /></label>
        <div className="form-grid">
          <label className="input-group"><span>Password Baru</span><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" /></label>
          <label className="input-group"><span>Konfirmasi Password</span><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" /></label>
        </div>
      </section>
    </div>
  );
};

export default FormAkun;

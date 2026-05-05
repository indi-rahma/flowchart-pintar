import React from "react";

const PreferensiAkun = ({ handleLogout }) => {
  return (
    <aside className="pengaturan-right">
      <section className="pengaturan-card sticky-card">
        <div className="card-header">
          <span className="icon-card">⚙️</span>
          <div>
            <h2>Preferensi Akun</h2>
            <p>Informasi singkat akun dan tampilan aplikasi.</p>
          </div>
        </div>

        <div className="quick-profile">
          <div className="quick-ring">💙</div>
          <div>
            <h3>Mode Biru Aktif</h3>
            <p>Tampilan utama aplikasi sedang menggunakan tema biru.</p>
          </div>
        </div>

        <div className="akun-status">
          <h3>Status Akun</h3>
          <div className="status-item">
            <span>Verifikasi</span>
            <b>Aktif</b>
          </div>
          <div className="status-item">
            <span>Role</span>
            <b>Siswa</b>
          </div>
          <div className="status-item">
            <span>Status</span>
            <b>Online</b>
          </div>
        </div>

        <button type="button" className="btn-logout" onClick={handleLogout}>
          Keluar Akun
        </button>
      </section>
    </aside>
  );
};

export default PreferensiAkun;
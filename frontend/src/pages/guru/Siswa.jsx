import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * SISWA GURU - STUDENT INSIGHT DASHBOARD (V6.0)
 * ------------------------------------------------
 * Fitur Utama:
 * 1. Database Driven: Sinkronisasi penuh dengan /api/siswa
 * 2. Intelligent Search: Filter nama dan email secara real-time
 * 3. Performance Optimized: Menggunakan useMemo untuk filter list besar
 * 4. UX Premium: Loading state estetik dan navigasi evaluasi instan
 */

function SiswaGuru() {
  // --- 1. STATE ARCHITECTURE ---
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nama"); // 'nama' atau 'email'
  
  const navigate = useNavigate();

  // --- 2. DATABASE CONNECTOR ---
  const fetchSiswa = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/siswa");
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setSiswa(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal menghubungkan ke database siswa.");
    } finally {
      // Memberikan jeda sedikit agar transisi loading terasa smooth
      setTimeout(() => setLoading(false), 700);
    }
  }, []);

  useEffect(() => {
    fetchSiswa();
  }, [fetchSiswa]);

  // --- 3. COMPUTED LOGIC (REACT MAX UTILIZATION) ---
  const filteredSiswa = useMemo(() => {
    let result = siswa.filter((item) =>
      item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return result.sort((a, b) => {
      if (sortBy === "nama") return a.nama.localeCompare(b.nama);
      return a.email.localeCompare(b.email);
    });
  }, [siswa, searchTerm, sortBy]);

  // --- 4. RENDERERS ---

  if (loading && siswa.length === 0) return (
    <div style={styles.loaderArea}>
      <style>{`
        @keyframes spinner { to { transform: rotate(360deg); } }
        @keyframes pulseText { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      <div style={styles.spinner}></div>
      <p style={styles.loaderText}>MENGAMBIL DATA SISWA DARI DATABASE...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* INJECTED GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

        .siswa-card:hover {
          transform: translateY(-10px) rotate(1deg);
          box-shadow: 15px 15px 0px #000 !important;
          border-color: #000 !important;
        }

        .btn-eval:hover {
          background: #000 !important;
          color: #FDE047 !important;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div style={styles.headerTitleArea}>
          <h1 style={styles.title}>Kelola  <span style={{color: '#EAB308'}}> Informasi Siswa</span></h1>
          <p style={styles.subtitle}>Lihat detail informasi siswa yang mendaftar di flowchart pintar</p> 
        </div>

        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔎</span>
            <input 
              style={styles.searchInput}
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            style={styles.selectSort}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="nama">Urut Nama (A-Z)</option>
            <option value="email">Urut Email</option>
          </select>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Siswa Terdaftar</span>
          <span style={styles.statValue}>{siswa.length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Hasil Filter</span>
          <span style={styles.statValue}>{filteredSiswa.length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Status Koneksi</span>
          <span style={{...styles.statValue, color: '#22C55E'}}>STABIL</span>
        </div>
      </div>

      {/* LIST SECTION */}
      <main style={styles.gridArea}>
        {filteredSiswa.length > 0 ? (
          <div style={styles.grid}>
            {filteredSiswa.map((item, index) => (
              <div 
                key={item.id} 
                style={{
                  ...styles.card, 
                  animation: `fadeInUp 0.6s ease forwards ${index * 0.05}s`
                }}
                className="siswa-card"
              >
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {item.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.idBadge}>ID: #{item.id}</div>
                </div>

                <div style={styles.cardInfo}>
                  <h3 style={styles.studentName}>{item.nama}</h3>
                  <p style={styles.studentEmail}>{item.email}</p>
                </div>

                <div style={styles.cardActions}>
                  <button 
                    style={styles.evalBtn} 
                    className="btn-eval"
                    onClick={() => navigate(`/guru/evaluasi/${item.id}`)}
                  >
                    Lihat Detail Siswa ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📂</div>
            <h3>Data Siswa Tidak Ditemukan</h3>
            <p>Pastikan koneksi backend menyala atau coba kata kunci pencarian lain.</p>
            <button style={styles.refreshBtn} onClick={fetchSiswa}>RELOAD DATA</button>
          </div>
        )}
      </main>

      {/* FOOTER SYSTEM */}
      <footer style={styles.footer}>
        <div style={styles.serverInfo}>
          <div style={styles.dot}></div>
          BACKEND STATUS: http://localhost:5000/api/siswa
        </div>
        <p>© 2026 EduPro Arsitektur - Dashboard Guru Management</p>
      </footer>
    </div>
  );
}

// --- 5. STYLES ARCHITECTURE (THE NEOBRUTALISM) ---
const styles = {
  container: {
    padding: '60px 80px',
    background: '#FFF',
    minHeight: '100vh'
  },
  loaderArea: {
    height: '100vh', display: 'flex', flexDirection: 'column', 
    alignItems: 'center', justifyContent: 'center', background: '#FFF'
  },
  spinner: {
    width: '50px', height: '50px', border: '6px solid #F1F5F9',
    borderTop: '6px solid #EAB308', borderRadius: '50%', animation: 'spinner 0.8s linear infinite'
  },
  loaderText: { marginTop: '20px', fontWeight: '800', fontSize: '12px', letterSpacing: '1px', animation: 'pulseText 1.5s infinite' },

  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: '60px', flexWrap: 'wrap', gap: '30px'
  },
  badge: {
    background: '#000', color: '#FDE047', padding: '6px 12px',
    borderRadius: '8px', fontSize: '10px', fontWeight: '800', marginBottom: '15px', display: 'inline-block'
  },
  title: { fontSize: '48px', fontWeight: '900', margin: 0, letterSpacing: '-2px' },
  subtitle: { color: '#64748B', fontSize: '16px', marginTop: '10px' },

  controls: { display: 'flex', gap: '20px', alignItems: 'center' },
  searchWrapper: {
    background: '#F8FAFC', border: '3px solid #F1F5F9', padding: '12px 20px',
    borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '12px', width: '320px'
  },
  searchIcon: { fontSize: '18px' },
  searchInput: { border: 'none', background: 'none', outline: 'none', fontWeight: '700', width: '100%' },
  selectSort: {
    padding: '14px 20px', borderRadius: '15px', border: '3px solid #000',
    fontWeight: '800', cursor: 'pointer', background: '#FFF'
  },

  statsRow: {
    display: 'flex', gap: '30px', marginBottom: '60px'
  },
  statBox: {
    flex: 1, background: '#F8FAFC', padding: '25px', borderRadius: '25px',
    display: 'flex', flexDirection: 'column', gap: '5px', border: '2px solid #F1F5F9'
  },
  statLabel: { fontSize: '12px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  statValue: { fontSize: '28px', fontWeight: '900', color: '#000' },

  gridArea: { marginBottom: '80px' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '35px'
  },
  card: {
    background: '#FFF', border: '3px solid #F1F5F9', borderRadius: '30px',
    padding: '30px', display: 'flex', flexDirection: 'column', transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.02)', opacity: 0 // Will be changed by animation
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' },
  avatar: {
    width: '60px', height: '60px', background: '#EAB308', borderRadius: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '900', color: '#000', border: '3px solid #000'
  },
  idBadge: { fontSize: '10px', fontWeight: '800', color: '#CBD5E1', background: '#F8FAFC', padding: '5px 10px', borderRadius: '8px' },
  
  cardInfo: { marginBottom: '30px' },
  studentName: { fontSize: '22px', fontWeight: '800', margin: '0 0 5px 0', color: '#000' },
  studentEmail: { fontSize: '14px', color: '#64748B', fontWeight: '500' },

  evalBtn: {
    width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #000',
    background: '#FDE047', color: '#000', fontWeight: '800', cursor: 'pointer',
    fontSize: '13px', transition: '0.3s'
  },

  emptyState: {
    textAlign: 'center', padding: '120px 0', border: '4px dashed #F1F5F9', borderRadius: '40px'
  },
  emptyIcon: { fontSize: '60px', marginBottom: '20px' },
  refreshBtn: {
    marginTop: '25px', padding: '12px 30px', background: '#000', color: '#FFF',
    borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer'
  },

  footer: {
    borderTop: '2px solid #F1F5F9', paddingTop: '40px', display: 'flex',
    justifyContent: 'space-between', color: '#CBD5E1', fontSize: '12px', fontWeight: '700'
  },
  serverInfo: { display: 'flex', alignItems: 'center', gap: '10px', color: '#64748B' },
  dot: { width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 10px #22C55E' }
};

export default SiswaGuru;
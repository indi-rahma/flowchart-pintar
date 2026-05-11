import React, { useEffect, useState, useMemo, useCallback } from "react";
import { API_BASE } from "../config";


const KelolaMateri = () => {
  // --- [ CORE STATES ] ---
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModule, setExpandedModule] = useState(null);

  // --- [ 1. DATA ACQUISITION ] ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mengarahkan ke endpoint modules sesuai permintaanmu
      const res = await fetch(`${API_BASE}/api/admin/modules`);
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Endpoint /api/admin/modules tidak ditemukan (404).");
        throw new Error(`Server Error: ${res.status}`);
      }

      const data = await res.json();
      
      // Defense: Pastikan data adalah array
      const validatedData = Array.isArray(data) ? data : [];
      setModules(validatedData);
      
      console.log("✅ Modules Data Synced:", validatedData);
    } catch (err) {
      console.error("❌ Fetch Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- [ 2. SEARCH & FILTER LOGIC ] ---
  const filteredModules = useMemo(() => {
    const query = (searchTerm || "").toLowerCase().trim();
    return modules.filter(mod => {
      const title = String(mod?.title || "").toLowerCase();
      const desc = String(mod?.description || "").toLowerCase();
      return title.includes(query) || desc.includes(query);
    });
  }, [modules, searchTerm]);

  // --- [ 3. UI RENDERING COMPONENTS ] ---
  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .module-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; }
        .module-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        
        .search-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* HEADER SECTION */}
      <header style={s.header} className="fade-in">
        <div>
          <h1 style={s.mainTitle}>Kelola <span style={{color: '#6366f1'}}>Materi</span></h1>
          <p style={s.subTitle}>Mengelola konten materi melalui struktur kurikulum modul.</p>
        </div>
        <button onClick={fetchData} style={s.refreshBtn}>
          {loading ? "SINKRON..." : "🔄 REFRESH DATA"}
        </button>
      </header>

      {/* SEARCH TOOLBAR */}
      <div style={s.toolbar} className="fade-in">
        <div style={s.searchWrapper}>
          <span style={s.searchIcon}>📂</span>
          <input
            className="search-input"
            style={s.searchInput}
            placeholder="Cari berdasarkan judul modul atau deskripsi materi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DATA CONTENT */}
      <main style={s.main}>
        {loading && modules.length === 0 ? (
          <div style={s.loaderArea}>
            <div className="spinner"></div>
            <p>MENGHUBUNGKAN KE DATABASE MODULES...</p>
            <style>{`.spinner { width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #6366f1; border-radius:50%; animation:spin 1s linear infinite; margin: 0 auto 20px; } @keyframes spin { to { transform:rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={s.errorCard}>
            <span style={{fontSize: '40px'}}>📡</span>
            <h3 style={{margin: '10px 0'}}>Gagal Menarik Data</h3>
            <p style={{color: '#ef4444', fontWeight: '600'}}>{error}</p>
            <p style={{fontSize: '12px'}}>Pastikan endpoint <b>/api/admin/modules</b> sudah benar di Backend.</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{fontSize: '50px'}}>📭</span>
            <h3>Modul Tidak Ditemukan</h3>
            <p>Tidak ada data di tabel modules atau pencarian tidak cocok.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filteredModules.map((mod, idx) => (
              <div 
                key={mod.id || idx} 
                className="module-card fade-in" 
                style={{
                  ...s.card, 
                  animationDelay: `${idx * 0.1}s`,
                  borderLeft: expandedModule === mod.id ? '6px solid #6366f1' : '1px solid #e2e8f0'
                }}
                onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
              >
                <div style={s.cardTop}>
                  <div style={s.iconBox}>MOD</div>
                  <div style={s.idLabel}>ID: #{mod.id}</div>
                </div>

                <h3 style={s.cardTitle}>{String(mod.title || "Modul Tanpa Judul")}</h3>
                <p style={s.cardDesc}>{String(mod.description || "Tidak ada deskripsi tersedia.")}</p>

                {/* Bagian ini menampilkan simulasi isi materi jika ada relasi */}
                <div style={s.footerInfo}>
                  <div style={s.statBadge}>
                    <span>📖</span> Status: Active
                  </div>
                  <div style={s.viewBtn}>
                    {expandedModule === mod.id ? "TUTUP DETAIL" : "LIHAT DETAIL"}
                  </div>
                </div>

                {/* COLLAPSIBLE DETAIL */}
                {expandedModule === mod.id && (
                  <div style={s.detailPanel} className="fade-in">
                    <p style={s.detailTitle}>CURRICULUM PREVIEW:</p>
                    <div style={s.detailContent}>
                      Materi dalam modul ini tersedia untuk diakses oleh siswa. 
                      Pastikan judul dan deskripsi sudah sesuai dengan RPS terbaru.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={s.footer}>
        API Provider: /api/admin/modules • Secure Database Access • v6.0
      </footer>
    </div>
  );
};

// --- [ DESIGN SYSTEM ] ---
const s = {
  page: { padding: "60px 8%", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  mainTitle: { fontSize: "32px", fontWeight: "800", margin: 0, letterSpacing: "-1.5px" },
  subTitle: { color: "#64748b", fontSize: "14px", marginTop: "5px", fontWeight: "600" },
  refreshBtn: { background: "#fff", border: "1px solid #e2e8f0", padding: "12px 20px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" },
  toolbar: { marginBottom: "30px" },
  searchWrapper: { position: "relative" },
  searchIcon: { position: "absolute", left: "20px", top: "18px", fontSize: "20px" },
  searchInput: { width: "100%", padding: "18px 25px 18px 60px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "16px", fontWeight: "600", outline: "none", boxSizing: "border-box" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "25px" },
  card: { background: "#fff", borderRadius: "24px", padding: "30px", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", position: 'relative', overflow: 'hidden' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  iconBox: { background: '#f1f5f9', color: '#6366f1', padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '800' },
  idLabel: { fontSize: '11px', color: '#cbd5e1', fontWeight: '700' },
  cardTitle: { fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: "0 0 10px 0", lineHeight: "1.2" },
  cardDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", margin: "0 0 25px 0", height: '45px', overflow: 'hidden' },
  footerInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f1f5f9' },
  statBadge: { fontSize: '12px', fontWeight: '700', color: '#475569' },
  viewBtn: { fontSize: '11px', fontWeight: '800', color: '#6366f1' },
  detailPanel: { marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  detailTitle: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' },
  detailContent: { fontSize: '13px', color: '#475569', lineHeight: '1.5' },
  loaderArea: { textAlign: 'center', padding: '100px' },
  errorCard: { background: '#fff', padding: '50px', borderRadius: '24px', border: '1px solid #fee2e2', textAlign: 'center', color: '#1e293b' },
  emptyState: { textAlign: 'center', gridColumn: '1/-1', padding: '100px', color: '#94a3b8' },
  footer: { marginTop: "50px", textAlign: "center", fontSize: "11px", color: "#cbd5e1", fontWeight: "700" }
};

export default KelolaMateri;
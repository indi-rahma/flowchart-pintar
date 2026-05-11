import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TampilanLoading from "./TampilanLoading";
import RingkasanBelajar from "./RingkasanBelajar";
import DaftarModul from "./DaftarModul";
import "./Dashboard.css";

const API_BASE = "https://flowchart-pintar-production.up.railway.app";

const isItemDone = (item) =>
  item?.done === true ||
  item?.done === 1 ||
  item?.is_done === true ||
  item?.is_done === 1 ||
  item?.completed === true ||
  item?.completed === 1;

const Dashboard = () => {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [user, setUser] = useState(null);
  const [evaluasiGuru, setEvaluasiGuru] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [modulesRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE}/api/student/modules?userId=${parsedUser.id}`),
          fetch(`${API_BASE}/api/module-items?userId=${parsedUser.id}`),
        ]);

        if (!modulesRes.ok) {
          throw new Error(`Gagal mengambil data modul (${modulesRes.status})`);
        }

        if (!itemsRes.ok) {
          throw new Error(`Gagal mengambil data materi (${itemsRes.status})`);
        }

        const modulesData = await modulesRes.json();
        const itemsData = await itemsRes.json();

        if (!Array.isArray(modulesData)) {
          throw new Error("Data modul bukan array");
        }

        if (!Array.isArray(itemsData)) {
          throw new Error("Data materi bukan array");
        }

        const grouped = modulesData.map((mod) => {
          const moduleItems = itemsData
            .filter((item) => Number(item.module_id) === Number(mod.id))
            .sort(
              (a, b) =>
                Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
                Number(a.id) - Number(b.id)
            )
            .map((item) => ({
              id: item.id,
              label: item.title,
              type: item.type,
              done: isItemDone(item),
              locked: Number(item.is_locked) === 1,
            }));

          const total = moduleItems.length;
          const done = moduleItems.filter((item) => item.done).length;

          return {
            id: mod.id,
            title: mod.title,
            progress: Number(mod.progress || 0),
            totalItems: Number(mod.total_items || total),
            doneItems: Number(mod.done_items || done),
            items: moduleItems,
          };
        });

        setModules(grouped);

        try {
          const evaluasiRes = await fetch(
            `${API_BASE}/api/evaluasi/${parsedUser.id}`
          );

          if (evaluasiRes.ok) {
            const evaluasiData = await evaluasiRes.json();
            setEvaluasiGuru(Array.isArray(evaluasiData) ? evaluasiData : []);
          }
        } catch (err) {
          console.error("Gagal fetch evaluasi guru:", err);
        }
      } catch (err) {
        console.error("Gagal fetch dashboard:", err);
        setError(err.message || "Terjadi kesalahan saat memuat dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const summary = useMemo(() => {
    const totalModules = modules.length;
    const totalItems = modules.reduce((sum, mod) => sum + mod.totalItems, 0);
    const completedItems = modules.reduce((sum, mod) => sum + mod.doneItems, 0);
    const completedModules = modules.filter((mod) => mod.progress === 100).length;
    const overallProgress =
      totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    let nextModule = null;
    let nextItem = null;

    for (let i = 0; i < modules.length; i++) {
      const prevModule = modules[i - 1];
      const isModuleLocked = i > 0 && prevModule?.progress < 100;

      if (isModuleLocked) continue;

      const candidate = modules[i].items.find(
        (item) => !item.done && !item.locked
      );

      if (candidate) {
        nextModule = modules[i];
        nextItem = candidate;
        break;
      }
    }

    return {
      totalModules,
      totalItems,
      completedItems,
      completedModules,
      overallProgress,
      nextModule,
      nextItem,
    };
  }, [modules]);

  const evaluasiTerbaru = evaluasiGuru[0];

  if (loading) {
    return <TampilanLoading />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-bg-grid"></div>
      <div className="dashboard-bg-blob-one"></div>
      <div className="dashboard-bg-blob-two"></div>

      <main className="dashboard-container">
        {error && (
          <div className="dashboard-error-box">
            <strong>Terjadi kesalahan:</strong> {error}
          </div>
        )}

        <RingkasanBelajar
          user={user}
          summary={summary}
          navigate={navigate}
        />

        {evaluasiTerbaru && (
          <div className="guru-feedback-floating">
            <div className="guru-feedback-icon">💡</div>
            <div className="guru-feedback-content">
              <div className="guru-feedback-label">
                PESAN GURU UNTUKMU
              </div>

              <p>{evaluasiTerbaru.evaluasi}</p>

              <small>
                {evaluasiTerbaru.created_at
                  ? new Date(evaluasiTerbaru.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Tanggal tidak tersedia"}
              </small>
            </div>
          </div>
        )}

        <DaftarModul
          modules={modules}
          summary={summary}
          navigate={navigate}
        />
      </main>
    </div>
  );
};

export default Dashboard;
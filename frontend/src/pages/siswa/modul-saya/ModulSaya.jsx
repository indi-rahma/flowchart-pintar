import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalStyle, styles } from "./GayaModulSaya";
import MemuatModul from "./MemuatModul";
import HeaderModulSaya from "./HeaderModulSaya";
import RingkasanModul from "./RingkasanModul";
import DaftarKartuModul from "./DaftarKartuModul";
import { API_BASE } from "../config";

const ModulSaya = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const modulesRes = await fetch(
          `${API_BASE}/api/student/modules?userId=${user.id}`
        );

        if (!modulesRes.ok) {
          throw new Error(`Gagal mengambil modul (${modulesRes.status})`);
        }

        const modulesData = await modulesRes.json();

        if (!Array.isArray(modulesData)) {
          setCourses([]);
          return;
        }

        const mergedCourses = await Promise.all(
          modulesData.map(async (mod) => {
            const itemsRes = await fetch(
              `${API_BASE}/api/module-items?moduleId=${mod.id}&userId=${user.id}`
            );

            if (!itemsRes.ok) {
              throw new Error(`Gagal mengambil materi modul ${mod.id}`);
            }

            const moduleItems = await itemsRes.json();

            const lessons = Array.isArray(moduleItems)
              ? moduleItems
                .sort(
                  (a, b) =>
                    Number(a.order_index ?? 0) - Number(b.order_index ?? 0) ||
                    Number(a.id) - Number(b.id)
                )
                .map((item) => ({
                  id: item.id,
                  title: item.title,
                  type: item.type,
                  done: item.done === 1 || item.done === true,
                  is_locked: Number(item.is_locked) === 1,
                }))
              : [];

            return {
              id: mod.id,
              title: mod.title,
              description: mod.description,
              progress: Number(mod.progress || 0),
              totalItems: Number(mod.total_items || lessons.length),
              doneItems: Number(mod.done_items || lessons.filter((l) => l.done).length),
              lessons,
            };
          })
        );

        setCourses(mergedCourses);
      } catch (err) {
        console.error("Gagal fetch courses:", err);
        setError(err.message || "Terjadi kesalahan saat memuat modul.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate, user]);

  const summary = useMemo(() => {
    const completedCourses = courses.filter((course) => {
      const total = course.lessons?.length || 0;
      const done = course.lessons?.filter((lesson) => lesson.done).length || 0;
      return total > 0 && total === done;
    }).length;

    const totalProgress = courses.length
      ? Math.round((completedCourses / courses.length) * 100)
      : 0;

    const totalLessons = courses.reduce(
      (acc, course) => acc + (course.lessons?.length || 0),
      0
    );

    const completedLessons = courses.reduce(
      (acc, course) =>
        acc + (course.lessons?.filter((lesson) => lesson.done).length || 0),
      0
    );

    return {
      completedCourses,
      totalProgress,
      totalLessons,
      completedLessons,
    };
  }, [courses]);

  if (loading) {
    return <MemuatModul />;
  }

  return (
    <div style={styles.page}>
      <style>{globalStyle}</style>

      <div style={styles.gridLayer}></div>
      <div style={styles.scanLine}></div>
      <div style={styles.glowBlue}></div>
      <div style={styles.glowYellow}></div>
      <div style={styles.glowCyan}></div>

      <div style={styles.container}>
        <HeaderModulSaya user={user} />

        <RingkasanModul summary={summary} totalModul={courses.length} />

        {error ? (
          <div style={styles.alertError}>
            <strong>System Alert.</strong>
            <div style={{ marginTop: 6 }}>{error}</div>
          </div>
        ) : null}

        <DaftarKartuModul courses={courses} error={error} navigate={navigate} />
      </div>
    </div>
  );
};

export default ModulSaya;

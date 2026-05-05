import React from "react";
import "./dashboard.css";

const getContentTypeIcon = (type) => {
  switch (type) {
    case "video":
      return "📽️";
    case "article":
      return "📖";
    case "quiz":
      return "📝";
    default:
      return "🧠";
  }
};

const getContentTypeLabel = (type) => {
  switch (type) {
    case "video":
      return "Video";
    case "article":
      return "Materi";
    case "quiz":
      return "Kuis";
    default:
      return "Belajar";
  }
};

const DaftarModul = ({ modules, summary, navigate }) => {
  return (
    <section className="dashboard-content-grid content-grid">
      <div>
        <div className="dashboard-section-header">
          <div>
            <h2 className="dashboard-section-title">Alur Belajar</h2>

            <p className="dashboard-section-desc">
              Modul akan terbuka setelah modul sebelumnya selesai.
            </p>
          </div>

          <span className="dashboard-section-pill">
            {summary.totalModules} modul • {summary.totalItems} materi
          </span>
        </div>

        <div className="dashboard-module-list">
          {modules.length > 0 ? (
            modules.map((mod, index) => {
              const prevModule = modules[index - 1];
              const isModuleLocked = index > 0 && prevModule?.progress < 100;
              const isDone = mod.progress === 100;

              return (
                <div
                  key={mod.id}
                  className={`dashboard-module-card module-card ${
                    isModuleLocked ? "is-locked" : ""
                  }`}
                >
                  <div className="dashboard-module-header">
                    <div className="dashboard-module-header-left">
                      <div
                        className={`dashboard-module-icon ${
                          isDone
                            ? "is-done"
                            : isModuleLocked
                            ? "is-locked"
                            : ""
                        }`}
                      >
                        {isDone ? "🏁" : isModuleLocked ? "🔒" : "📘"}
                      </div>

                      <div className="dashboard-module-content">
                        <div className="dashboard-module-title-row">
                          <h3
                            className={`dashboard-module-title ${
                              isModuleLocked ? "is-muted" : ""
                            }`}
                          >
                            {mod.title}
                          </h3>

                          <span
                            className={`dashboard-module-status ${
                              isDone
                                ? "is-done"
                                : isModuleLocked
                                ? "is-locked"
                                : "is-active"
                            }`}
                          >
                            {isDone
                              ? "Selesai"
                              : isModuleLocked
                              ? "Terkunci"
                              : "Aktif"}
                          </span>
                        </div>

                        <p className="dashboard-module-meta">
                          {isDone
                            ? "Kerennn, modul ini sudah selesai."
                            : isModuleLocked
                            ? "Selesaikan modul sebelumnya dulu."
                            : "Sedang bisa kamu pelajari sekarang."}
                        </p>

                        <div className="dashboard-progress-track">
                          <div
                            className={`dashboard-progress-fill ${
                              isDone ? "is-done" : ""
                            }`}
                            style={{
                              width: `${mod.progress}%`,
                            }}
                          ></div>
                        </div>

                        <div className="dashboard-module-small-info">
                          <span>
                            {mod.doneItems}/{mod.totalItems} materi selesai
                          </span>

                          <strong>{mod.progress}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-lesson-list">
                    {mod.items.length > 0 ? (
                      mod.items.map((item, itemIndex) => {
                        const previousItem = mod.items[itemIndex - 1];

                        const isItemSequentialLocked =
                          itemIndex > 0 && !previousItem?.done;

                        const isItemLocked =
                          isModuleLocked ||
                          item.locked ||
                          isItemSequentialLocked;

                        return (
                          <div
                            key={item.id ?? itemIndex}
                            className={`dashboard-lesson-row ${
                              item.done ? "is-done" : ""
                            } ${isItemLocked ? "is-locked" : "lesson-hover"}`}
                            onClick={() => {
                              if (!isItemLocked) {
                                navigate(`/reader/${mod.id}/${item.id}`);
                              }
                            }}
                          >
                            <div className="dashboard-lesson-left">
                              <div
                                className={`dashboard-lesson-icon ${
                                  item.done ? "is-done" : ""
                                } ${isItemLocked ? "is-locked" : ""}`}
                              >
                                {getContentTypeIcon(item.type)}
                              </div>

                              <div>
                                <div
                                  className={`dashboard-lesson-title ${
                                    isItemLocked ? "is-muted" : ""
                                  }`}
                                >
                                  {item.label}
                                </div>

                                <div
                                  className={`dashboard-lesson-sub ${
                                    item.done
                                      ? "is-done"
                                      : isItemLocked
                                      ? "is-locked"
                                      : ""
                                  }`}
                                >
                                  {item.done
                                    ? "Sudah dipelajari"
                                    : isItemLocked
                                    ? "Belum terbuka"
                                    : `${getContentTypeLabel(
                                        item.type
                                      )} • lanjutkan`}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`dashboard-lesson-status ${
                                item.done
                                  ? "is-done"
                                  : isItemLocked
                                  ? "is-locked"
                                  : ""
                              }`}
                            >
                              {item.done ? "✓" : isItemLocked ? "🔒" : "→"}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="dashboard-empty-state">
                        Belum ada materi pada modul ini.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="dashboard-empty-big">
              Belum ada modul yang tersedia untuk ditampilkan.
            </div>
          )}
        </div>
      </div>

      <aside className="dashboard-side">
        <div className="dashboard-side-card module-card">
          <h3 className="dashboard-side-title">Lanjut Berikutnya</h3>

          {summary.nextModule && summary.nextItem ? (
            <div>
              <div className="dashboard-next-box">
                <div className="dashboard-next-icon">🚀</div>

                <div>
                  <div className="dashboard-next-module">
                    {summary.nextModule.title}
                  </div>

                  <div className="dashboard-next-item">
                    {summary.nextItem.label}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="dashboard-next-button"
                onClick={() =>
                  navigate(
                    `/reader/${summary.nextModule.id}/${summary.nextItem.id}`
                  )
                }
              >
                Mulai Materi Ini →
              </button>
            </div>
          ) : (
            <div className="dashboard-empty-side">
              Semua materi yang tersedia sudah selesai. Kamu hebat!
            </div>
          )}
        </div>

        <div className="dashboard-side-card module-card">
          <h3 className="dashboard-side-title">Progress Belajar</h3>

          <div className="dashboard-side-progress-top">
            <span>Keseluruhan</span>
            <strong>{summary.overallProgress}%</strong>
          </div>

          <div className="dashboard-side-track">
            <div
              className="dashboard-side-fill"
              style={{
                width: `${summary.overallProgress}%`,
              }}
            ></div>
          </div>

          <div className="dashboard-mini-stats">
            <div className="dashboard-mini-stat">
              <strong>{summary.completedItems}</strong>
              <span>Materi</span>
            </div>

            <div className="dashboard-mini-stat">
              <strong>{summary.completedModules}</strong>
              <span>Modul</span>
            </div>
          </div>
        </div>

        <div className="dashboard-side-card module-card">
          <h3 className="dashboard-side-title">Akses Cepat</h3>

          <button
            type="button"
            className="dashboard-quick-btn"
            onClick={() => navigate("/modul-saya")}
          >
            📘 Modul Saya
          </button>

          <button
            type="button"
            className="dashboard-quick-btn"
            onClick={() => navigate("/pencapaian")}
          >
            🏆 Pencapaian
          </button>
        </div>
      </aside>
    </section>
  );
};

export default DaftarModul;
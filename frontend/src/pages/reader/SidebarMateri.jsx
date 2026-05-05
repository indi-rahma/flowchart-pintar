import React from "react";
import "./reader.css";

const getItemTypeLabel = (type) => {
  if (type === "video") return "Video";
  if (type === "quiz") return "Quiz";
  return "Artikel";
};

const SidebarMateri = ({
  moduleItems,
  currentItem,
  parsedModuleId,
  navigate,
  currentTime,
  jumpTo,
}) => {
  return (
    <aside className="reader-sidebar">
      <h3>Daftar Materi</h3>

      <div className="reader-module-list">
        {moduleItems.map((item, index) => {
          const active = Number(item.id) === Number(currentItem.id);

          return (
            <button
              key={item.id}
              className={`reader-module-item ${active ? "is-active" : ""}`}
              onClick={() => navigate(`/reader/${parsedModuleId}/${item.id}`)}
            >
              <span className="reader-number-circle">
                {item.done ? "✓" : index + 1}
              </span>

              <span className="reader-module-text">
                <span className="reader-module-title">{item.title}</span>
                <span className="reader-module-type">{getItemTypeLabel(item.type)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {currentItem.type === "video" && (
        <div className="reader-video-nav">
          <h4>Navigasi Video</h4>

          {[60, 180, 300].map((seconds) => {
            const isPassed = currentTime >= seconds;

            return (
              <button
                key={seconds}
                onClick={() => jumpTo(seconds)}
                className="reader-time-button"
              >
                <span>{isPassed ? "✅" : "⏱️"}</span>
                <span>{seconds} detik</span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default SidebarMateri;

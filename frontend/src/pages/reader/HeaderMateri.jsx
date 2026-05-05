import React from "react";
import "./reader.css";

const getTypeLabel = (type) => {
  if (type === "video") return "Video Pembelajaran";
  if (type === "quiz") return "Quiz";
  return "Bacaan Materi";
};

const HeaderMateri = ({ modul, item, index, total }) => {
  return (
    <section className="reader-header-card">
      <div className="reader-breadcrumb">
        <span>{modul.title}</span>
        <span>•</span>
        <span>
          Materi {index + 1} dari {total}
        </span>
      </div>

      <h1 className="reader-title">{item.title}</h1>

      <div className="reader-badge-row">
        <span className="reader-badge is-type">{getTypeLabel(item.type)}</span>
        <span className={`reader-badge ${item.done ? "is-done" : "is-progress"}`}>
          {item.done ? "Selesai ✅" : "Sedang Dipelajari 📖"}
        </span>
      </div>
    </section>
  );
};

export default HeaderMateri;

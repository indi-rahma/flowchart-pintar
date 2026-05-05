import React from "react";
import YouTube from "react-youtube";
import "./reader.css";

const EmptyState = ({ title, text }) => (
  <div className="reader-empty-state">
    <h2>{title}</h2>
    <p>{text}</p>
  </div>
);

const ArtikelMateri = ({ API_URL, text, images = [] }) => {
  if (!text) {
    return <EmptyState title="Belum ada isi materi" text="Materi ini masih kosong." />;
  }

  const parts = text.split(/(\[img\d+\])/g);

  return (
    <article className="reader-article">
      {parts.map((part, index) => {
        const match = part.match(/\[img(\d+)\]/);

        if (match) {
          const imageIndex = Number(match[1]) - 1;
          const img = images[imageIndex];

          if (!img) {
            return (
              <div key={index} className="reader-missing-image">
                Gambar {imageIndex + 1} belum tersedia.
              </div>
            );
          }

          return (
            <figure key={index} className="reader-figure">
              <img
                src={`${API_URL}/uploads/${img.image}`}
                alt={img.caption || `Gambar ${imageIndex + 1}`}
                className="reader-article-image"
              />
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          );
        }

        const paragraphs = part
          .split("\n\n")
          .map((p) => p.trim())
          .filter(Boolean);

        return paragraphs.map((paragraph, pIndex) => (
          <div key={`${index}-${pIndex}`} className="reader-paragraph-card">
            <p>{paragraph}</p>
          </div>
        ));
      })}
    </article>
  );
};

const KontenMateri = ({
  API_URL,
  item,
  images,
  videoId,
  playerRef,
  saveProgress,
  HalamanKuis,
  moduleId,
  handleSelesaiDanLanjut,
}) => {
  const coverImage = item.type === "article" && item.content_url ? item.content_url : null;

  return (
    <section className="reader-content-card">
      {item.type === "video" ? (
        videoId ? (
          <div className="reader-video-box">
            <YouTube
              videoId={videoId}
              onReady={(e) => (playerRef.current = e.target)}
              onEnd={saveProgress}
              opts={{
                width: "100%",
                height: "100%",
                playerVars: { autoplay: 1 },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <EmptyState title="Video tidak valid" text="Link video pada materi ini tidak bisa dibaca." />
        )
      ) : item.type === "quiz" ? (
        <HalamanKuis moduleId={moduleId} onFinish={handleSelesaiDanLanjut} />
      ) : (
        <>
          {coverImage && (
            <div className="reader-cover-image">
              <img src={coverImage} alt={item.title} />
            </div>
          )}

          <ArtikelMateri API_URL={API_URL} text={item.content_text} images={images} />
        </>
      )}
    </section>
  );
};

export default KontenMateri;

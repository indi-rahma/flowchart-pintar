import React from "react";

function FormMateri({
  editingItemId,
  title,
  setTitle,
  content,
  setContent,
  videoUrl,
  setVideoUrl,
  imageUrl,
  setImageUrl,
  itemImages = [],
  setItemImages,
  orderIndex,
  setOrderIndex,
  isLocked,
  setIsLocked,
  isSubmitting,
  handleSaveMateri,
  onCancel,
}) {
  const handlePickImages = (e) => {
    const files = Array.from(e.target.files || []);
    setItemImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const insertImagePlaceholder = (index) => {
    const placeholder = `\n\n[img${index + 1}]\n\n`;
    setContent((prev) => `${prev || ""}${placeholder}`);
  };

  const removeImage = (index) => {
    setItemImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <aside style={local.formContainer}>
      <style>{`
        .docs-input:focus {
          border-color: #EAB308 !important;
          box-shadow: 0 0 0 4px rgba(234,179,8,0.15);
        }

        .docs-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.03);
        }
      `}</style>

      <form onSubmit={handleSaveMateri} style={local.formCard}>
        <div style={local.header}>
          <h3 style={local.title}>
            {editingItemId ? "Edit Materi" : "Tambah Materi"}
          </h3>
          <p style={local.subtitle}>
            Tulis materi panjang bebas. Klik “Sisipkan” agar gambar muncul di tengah materi.
          </p>
        </div>

        <div style={local.inputGroup}>
          <label style={local.label}>Judul Materi</label>
          <input
            className="docs-input"
            style={local.input}
            placeholder="Contoh: Simbol-Simbol Dasar Flowchart"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={local.editorShell}>
          <div style={local.editorTop}>
            <div>
              <label style={local.label}>Isi Materi</label>
              <p style={local.helper}>
                Gunakan [img1], [img2], dst untuk menaruh gambar di tengah teks.
              </p>
            </div>
            <span style={local.docsBadge}>DOCS</span>
          </div>

          <textarea
            className="docs-input"
            style={local.editor}
            placeholder={`Tulis materi kamu di sini...

Contoh:
Flowchart dimulai dari simbol terminator.

[img1]

Lalu gunakan simbol proses untuk langkah pengolahan data.

[img2]`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div style={local.mediaBox}>
          <div style={local.mediaHeader}>
            <div>
              <h4 style={local.mediaTitle}>Gambar Pendukung Materi</h4>
              <p style={local.helper}>
                Upload banyak gambar, lalu sisipkan ke posisi materi yang kamu mau.
              </p>
            </div>
            <span style={local.imageCount}>{itemImages.length} gambar</span>
          </div>

          <label style={local.uploadBox}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePickImages}
              style={{ display: "none" }}
            />
            <span style={local.uploadIcon}>🖼️</span>
            <strong>Klik untuk pilih gambar</strong>
            <small>Bisa pilih berkali-kali, gambar lama tidak hilang</small>
          </label>

          {itemImages.length > 0 && (
            <div style={local.previewGrid}>
              {itemImages.map((file, index) => (
                <div key={`${file.name}-${index}`} style={local.previewCard}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={local.previewImg}
                  />

                  <div style={local.previewInfo}>
                    <strong>Gambar {index + 1}</strong>
                    <span style={local.fileName}>{file.name}</span>

                    <div style={local.previewActions}>
                      <button
                        type="button"
                        className="docs-btn"
                        style={local.insertBtn}
                        onClick={() => insertImagePlaceholder(index)}
                      >
                        Sisipkan [img{index + 1}]
                      </button>

                      <button
                        type="button"
                        style={local.removeBtn}
                        onClick={() => removeImage(index)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={local.inputGroup}>
          <label style={local.label}>Video YouTube Opsional</label>
          <input
            className="docs-input"
            style={local.input}
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div style={local.inputGroup}>
          <label style={local.label}>URL Cover Opsional</label>
          <input
            className="docs-input"
            style={local.input}
            placeholder="Link gambar cover utama..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div style={local.twoCol}>
          <div style={local.inputGroup}>
            <label style={local.label}>Urutan</label>
            <input
              className="docs-input"
              type="number"
              min="0"
              style={local.input}
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
          </div>

          <div style={local.inputGroup}>
            <label style={local.label}>Status</label>
            <select
              className="docs-input"
              style={local.input}
              value={isLocked ? "1" : "0"}
              onChange={(e) => setIsLocked(e.target.value === "1")}
            >
              <option value="0">Terbuka</option>
              <option value="1">Terkunci</option>
            </select>
          </div>
        </div>

        <div style={local.buttonRow}>
          <button
            type="button"
            className="docs-btn"
            style={local.cancelBtn}
            onClick={onCancel}
          >
            Batal
          </button>

          <button
            type="submit"
            className="docs-btn"
            style={local.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Menyimpan..."
              : editingItemId
              ? "Update Materi"
              : "Simpan Materi"}
          </button>
        </div>
      </form>
    </aside>
  );
}

const local = {
  formContainer: {
    width: "40%",
    position: "sticky",
    top: "40px",
  },

  formCard: {
    background: "#FFFFFF",
    border: "3px solid #111827",
    padding: "30px",
    borderRadius: "30px",
    boxShadow: "12px 12px 0px #EAB308",
  },

  header: {
    marginBottom: 24,
    paddingBottom: 18,
    borderBottom: "2px solid #F1F5F9",
  },

  eyebrow: {
    margin: "0 0 6px",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1,
    color: "#EAB308",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    fontSize: 25,
    fontWeight: 900,
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0",
    fontSize: 13,
    color: "#64748B",
    lineHeight: 1.6,
    fontWeight: 600,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.7,
    color: "#475569",
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: 14,
    border: "2px solid #E2E8F0",
    background: "#F8FAFC",
    outline: "none",
    fontWeight: 700,
    color: "#111827",
  },

  editorShell: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 24,
    background: "#F8FAFC",
    border: "2px solid #E2E8F0",
  },

  editorTop: {
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },

  helper: {
    margin: 0,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 1.5,
    fontWeight: 600,
  },

  docsBadge: {
    height: "fit-content",
    padding: "7px 10px",
    borderRadius: 999,
    background: "#111827",
    color: "#FDE047",
    fontSize: 11,
    fontWeight: 900,
  },

  editor: {
    width: "100%",
    minHeight: 320,
    padding: 20,
    borderRadius: 18,
    border: "2px solid #E2E8F0",
    background: "#FFFFFF",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.9,
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  },

  mediaBox: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 24,
    background: "linear-gradient(180deg, #FFFBEB, #FFFFFF)",
    border: "2px solid #FDE68A",
  },

  mediaHeader: {
    marginBottom: 14,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },

  mediaTitle: {
    margin: "0 0 4px",
    fontSize: 15,
    fontWeight: 900,
    color: "#92400E",
  },

  imageCount: {
    height: "fit-content",
    padding: "7px 10px",
    borderRadius: 999,
    background: "#FEF3C7",
    color: "#92400E",
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  uploadBox: {
    minHeight: 130,
    borderRadius: 20,
    border: "2px dashed #EAB308",
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
    color: "#92400E",
    textAlign: "center",
    padding: 18,
  },

  uploadIcon: {
    fontSize: 34,
  },

  previewGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },

  previewCard: {
    display: "flex",
    gap: 12,
    padding: 10,
    borderRadius: 16,
    background: "#FFFFFF",
    border: "1px solid #FDE68A",
  },

  previewImg: {
    width: 90,
    height: 76,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid #E2E8F0",
    flexShrink: 0,
  },

  previewInfo: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 5,
    fontSize: 12,
    color: "#475569",
  },

  fileName: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  previewActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },

  insertBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "#FDE047",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  },

  removeBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    background: "#FEE2E2",
    color: "#991B1B",
    fontWeight: 900,
    fontSize: 11,
    cursor: "pointer",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  buttonRow: {
    display: "flex",
    gap: 12,
    marginTop: 8,
  },

  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    border: "none",
    background: "#E5E7EB",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
    transition: "0.25s ease",
  },

  submitBtn: {
    flex: 2,
    padding: 16,
    borderRadius: 16,
    border: "none",
    background: "#111827",
    color: "#FDE047",
    fontWeight: 900,
    cursor: "pointer",
    transition: "0.25s ease",
    boxShadow: "0 12px 24px rgba(17,24,39,0.18)",
  },
};

export default FormMateri;
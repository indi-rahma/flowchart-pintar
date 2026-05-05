import React from "react";

function MCQQuiz({ data, selectedAnswer, setSelectedAnswer }) {
  // 🔥 FIX URL GAMBAR (support semua kondisi DB)
  const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("http")) return path;

    if (path.startsWith("/")) {
      return `http://localhost:5000${path}`;
    }

    return `http://localhost:5000/uploads/${path}`;
  };

  const options = [
    {
      key: "A",
      value: "A",
      text: data?.option_a,
      image: data?.option_a_image,
    },
    {
      key: "B",
      value: "B",
      text: data?.option_b,
      image: data?.option_b_image,
    },
    {
      key: "C",
      value: "C",
      text: data?.option_c,
      image: data?.option_c_image,
    },
    {
      key: "D",
      value: "D",
      text: data?.option_d,
      image: data?.option_d_image,
    },
  ].filter((opt) => opt.text || opt.image);

  return (
    <div style={wrapperStyle}>
      <h3 style={questionStyle}>{data?.question}</h3>

      {/* 🔥 GAMBAR SOAL */}
      {data?.image && (
        <img
          src={getImageUrl(data.image)}
          alt="Soal"
          style={questionImageStyle}
        />
      )}

      <div style={optionsStyle}>
        {options.map((opt) => {
          const active = selectedAnswer === opt.value;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedAnswer(opt.value)}
              style={{
                ...optionStyle,
                borderColor: active ? "#6366f1" : "#e2e8f0",
                background: active ? "#eef2ff" : "#fff",
              }}
            >
              <span
                style={{
                  ...letterStyle,
                  background: active ? "#6366f1" : "#f1f5f9",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {opt.key}
              </span>

              {/* 🔥 TEXT */}
              {opt.text && <span style={{ flex: 1 }}>{opt.text}</span>}

              {/* 🔥 GAMBAR OPTION */}
              {opt.image && (
                <img
                  src={getImageUrl(opt.image)}
                  alt={`Option ${opt.key}`}
                  style={optionImageStyle}
                />
              )}
            </button>
          );
        })}
      </div>

      {options.length === 0 && (
        <p style={emptyTextStyle}>Pilihan jawaban belum tersedia.</p>
      )}
    </div>
  );
}

// ================= STYLE =================

const wrapperStyle = {
  padding: "24px",
};

const questionStyle = {
  margin: "0 0 20px",
  color: "#0f172a",
  fontSize: "20px",
  lineHeight: 1.5,
};

const questionImageStyle = {
  maxWidth: "100%",
  borderRadius: "16px",
  marginBottom: "20px",
  border: "1px solid #e2e8f0",
};

const optionsStyle = {
  display: "grid",
  gap: "12px",
};

const optionStyle = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  fontWeight: 700,
  textAlign: "left",
  color: "#0f172a",
  transition: "0.2s ease",
};

const letterStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontWeight: 800,
};

const optionImageStyle = {
  maxWidth: "120px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
};

const emptyTextStyle = {
  marginTop: "12px",
  color: "#64748b",
  fontWeight: 600,
};

export default MCQQuiz;
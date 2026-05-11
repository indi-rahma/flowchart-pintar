import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { API_BASE } from "../config";

function FlowNode({ data }) {
  const type = data?.node_type || "process";

  const getLabel = () => {
    if (type === "start") return "START";
    if (type === "end") return "END";
    if (type === "input") return "INPUT / OUTPUT";
    if (type === "decision") return "PERCABANGAN";
    return "PROCESS";
  };

  const shapeStyle = {
    minWidth: 160,
    minHeight: 72,
    padding: "14px 18px",
    background: "#fff",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#f59e0b",
    color: "#422006",
    fontWeight: 900,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 28px rgba(15,23,42,0.12)",
  };

  const finalStyle =
    type === "start"
      ? {
          ...shapeStyle,
          borderRadius: 999,
          borderColor: "#22c55e",
          background: "linear-gradient(180deg, #f0fdf4, #ffffff)",
        }
      : type === "end"
      ? {
          ...shapeStyle,
          borderRadius: 999,
          borderColor: "#ef4444",
          background: "linear-gradient(180deg, #fef2f2, #ffffff)",
        }
      : type === "input"
      ? {
          ...shapeStyle,
          borderRadius: 14,
          transform: "skew(-12deg)",
          borderColor: "#3b82f6",
          background: "linear-gradient(180deg, #eff6ff, #ffffff)",
        }
      : type === "decision"
      ? {
          ...shapeStyle,
          width: 130,
          height: 130,
          minWidth: 130,
          minHeight: 130,
          padding: 14,
          transform: "rotate(45deg)",
          borderColor: "#8b5cf6",
          background: "linear-gradient(180deg, #f5f3ff, #ffffff)",
        }
      : {
          ...shapeStyle,
          borderRadius: 18,
          background: "linear-gradient(180deg, #fffbeb, #ffffff)",
        };

  const textFix =
    type === "decision"
      ? {
          transform: "rotate(-45deg)",
          display: "block",
          maxWidth: 95,
          lineHeight: 1.25,
        }
      : type === "input"
      ? {
          transform: "skew(12deg)",
          display: "block",
        }
      : { display: "block" };

  return (
    <div style={nodeWrapStyle}>
      {type !== "start" && (
        <Handle type="target" position={Position.Top} style={handleStyle} />
      )}

      <div style={finalStyle}>
        <span style={textFix}>
          <small style={nodeTypeStyle}>{getLabel()}</small>
          <strong style={nodeTextStyle}>{data?.label}</strong>
        </span>
      </div>

      {type === "decision" ? (
        <>
          <Handle
            type="source"
            id="yes"
            position={Position.Right}
            style={{ ...handleStyle, background: "#22c55e" }}
          />
          <Handle
            type="source"
            id="no"
            position={Position.Bottom}
            style={{ ...handleStyle, background: "#ef4444" }}
          />
          <span style={yesLabelStyle}>Ya</span>
          <span style={noLabelStyle}>Tidak</span>
        </>
      ) : type !== "end" ? (
        <Handle type="source" id="out" position={Position.Bottom} style={handleStyle} />
      ) : null}
    </div>
  );
}

const nodeTypes = {
  flowNode: FlowNode,
};

function DndForm({
  dndQuestion,
  setDndQuestion,
  dndQuestionId,
  dndItemForm,
  setDndItemForm,
  dndItems = [],
  isSavingDndQuestion,
  isSavingDndItem,
  handleSaveDndQuestion,
  handleSaveDndItem,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSavingFlow, setIsSavingFlow] = useState(false);

  const sortedItems = useMemo(() => {
    return [...dndItems].sort(
      (a, b) =>
        Number(a.correct_order) - Number(b.correct_order) ||
        Number(a.id) - Number(b.id)
    );
  }, [dndItems]);

  const updateItemForm = (key, value) => {
    setDndItemForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const buildNodes = useCallback(() => {
    const nextNodes = sortedItems.map((item, index) => ({
      id: String(item.id),
      type: "flowNode",
      position: {
        x: 160 + (index % 3) * 240,
        y: 80 + Math.floor(index / 3) * 190,
      },
      data: {
        label: item.text,
        node_type: item.node_type || "process",
        raw: item,
      },
    }));

    setNodes((prev) => {
      return nextNodes.map((next) => {
        const old = prev.find((n) => n.id === next.id);
        return old ? { ...next, position: old.position } : next;
      });
    });
  }, [sortedItems, setNodes]);

  const fetchKoneksi = useCallback(async () => {
    if (!dndQuestionId) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/quiz-dnd-koneksi?questionId=${dndQuestionId}`
      );

      if (!res.ok) {
        setEdges([]);
        return;
      }

      const data = await res.json();

      const nextEdges = Array.isArray(data)
        ? data.map((edge) => ({
            id: String(edge.id),
            source: String(edge.source_item_id),
            target: String(edge.target_item_id),
            sourceHandle: edge.source_handle || "out",
            label: edge.label || "",
            type: "smoothstep",
            animated: true,
            style: { strokeWidth: 3, stroke: "#6366f1" },
            labelStyle: {
              fontWeight: 900,
              fill: "#111827",
            },
            labelBgStyle: {
              fill: "#fefce8",
              fillOpacity: 0.95,
            },
          }))
        : [];

      setEdges(nextEdges);
    } catch (err) {
      console.error("GET DND KONEKSI ERROR:", err);
      setEdges([]);
    }
  }, [dndQuestionId, setEdges]);

  useEffect(() => {
    buildNodes();
  }, [buildNodes]);

  useEffect(() => {
    fetchKoneksi();
  }, [fetchKoneksi]);

  const onConnect = useCallback(
    (params) => {
      const label =
        params.sourceHandle === "yes"
          ? "Ya"
          : params.sourceHandle === "no"
          ? "Tidak"
          : "";

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `edge-${params.source}-${params.sourceHandle || "out"}-${
              params.target
            }-${Date.now()}`,
            type: "smoothstep",
            animated: true,
            label,
            style: { strokeWidth: 3, stroke: "#6366f1" },
            labelStyle: {
              fontWeight: 900,
              fill: "#111827",
            },
            labelBgStyle: {
              fill: "#fefce8",
              fillOpacity: 0.95,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const handleSaveFlowchart = async () => {
    if (!dndQuestionId) {
      alert("Buat pertanyaan DND dulu.");
      return;
    }

    try {
      setIsSavingFlow(true);

      await fetch(`${API_BASE}/api/quiz-dnd-koneksi?questionId=${dndQuestionId}`, {
        method: "DELETE",
      });

      for (const edge of edges) {
        await fetch(`${API_BASE}/api/quiz-dnd-koneksi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_id: dndQuestionId,
            source_item_id: Number(edge.source),
            target_item_id: Number(edge.target),
            label: edge.label || "",
            source_handle: edge.sourceHandle || "out",
          }),
        });
      }

      setSavedNotice(true);
      alert("Flowchart dan panah berhasil disimpan ✅");

      setTimeout(() => {
        setSavedNotice(false);
      }, 3000);
    } catch (err) {
      console.error("SAVE FLOWCHART ERROR:", err);
      alert("Gagal menyimpan koneksi flowchart.");
    } finally {
      setIsSavingFlow(false);
    }
  };

  return (
    <section style={styles.page}>
      <style>{animationStyles}</style>

      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Membuat Soal Tipe Drag And Drop</p>
          <h2 style={styles.title}>DND Flow Editor</h2>
          <p style={styles.subtitle}>
            Tambah node, geser posisinya, lalu tarik panah antar node. Decision
            punya jalur Ya dan Tidak.
          </p>
        </div>

        <div style={styles.statusBadge}>
          {dndQuestionId ? "Canvas Aktif" : "Buat Pertanyaan"}
        </div>
      </div>

      {savedNotice && (
        <div style={styles.savedNotice}>
          <span>✅</span>
          <div>
            <strong>Flowchart berhasil disimpan</strong>
            <p>Node dan panah koneksi sudah disimpan.</p>
          </div>
        </div>
      )}

      <section style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Editor Soal</h3>
            <p style={styles.panelDesc}>
              Buat instruksi, lalu tambahkan node flowchart.
            </p>
          </div>

          {!dndQuestionId ? (
            <form onSubmit={handleSaveDndQuestion} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Instruksi / Pertanyaan</label>
                <textarea
                  style={styles.textarea}
                  value={dndQuestion}
                  onChange={(e) => setDndQuestion(e.target.value)}
                  placeholder="Contoh: Buat flowchart untuk menentukan bilangan ganjil/genap."
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.primaryBtn,
                  opacity: isSavingDndQuestion ? 0.7 : 1,
                }}
                disabled={isSavingDndQuestion}
              >
                {isSavingDndQuestion ? "Menyimpan..." : "Buat Pertanyaan DND"}
              </button>
            </form>
          ) : (
            <>
              <div style={styles.questionBox}>
                <span style={styles.questionLabel}>Pertanyaan Aktif</span>
                <p style={styles.questionText}>{dndQuestion}</p>
              </div>

              <form onSubmit={handleSaveDndItem} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Isi Node Flowchart</label>
                  <input
                    style={styles.input}
                    value={dndItemForm.text}
                    onChange={(e) => updateItemForm("text", e.target.value)}
                    placeholder="Contoh: Input angka / Apakah habis dibagi 2?"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Bentuk Node</label>
                  <select
                    style={styles.input}
                    value={dndItemForm.node_type || "process"}
                    onChange={(e) => updateItemForm("node_type", e.target.value)}
                  >
                    <option value="start">Start / Terminator</option>
                    <option value="process">Process / Kotak</option>
                    <option value="input">Input / Output / Jajar Genjang</option>
                    <option value="decision">Decision / Percabangan</option>
                    <option value="end">End / Terminator</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Urutan Referensi</label>
                  <input
                    type="number"
                    min="1"
                    style={styles.input}
                    value={dndItemForm.correct_order}
                    onChange={(e) =>
                      updateItemForm("correct_order", e.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    ...styles.primaryBtn,
                    opacity: isSavingDndItem ? 0.7 : 1,
                  }}
                  disabled={isSavingDndItem}
                >
                  {isSavingDndItem ? "Menyimpan..." : "Tambah Node"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveFlowchart}
                  style={styles.saveFlowBtn}
                  disabled={isSavingFlow}
                >
                  {isSavingFlow ? "Menyimpan Flow..." : "💾 Simpan Flowchart"}
                </button>

                <p style={styles.saveHint}>
                  Tarik dari titik kecil pada node untuk membuat panah. Pada
                  decision, titik kanan = <b>Ya</b>, titik bawah = <b>Tidak</b>.
                </p>
              </form>
            </>
          )}
        </div>

        <div style={styles.canvasPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Canvas Kunci Jawaban</h3>
              <p style={styles.panelDesc}>
                Geser node dan tarik panah sesuai alur yang benar.
              </p>
            </div>
          </div>

          {sortedItems.length > 0 ? (
            <div style={styles.reactFlowWrap}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
              >
                <Background gap={18} size={1} />
                <Controls />
              </ReactFlow>
            </div>
          ) : (
            <div style={styles.emptyState}>
              Tambahkan node dulu, lalu canvas akan muncul.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

const nodeWrapStyle = {
  position: "relative",
};

const handleStyle = {
  width: 12,
  height: 12,
  background: "#6366f1",
  border: "2px solid #fff",
};

const nodeTypeStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 10,
  color: "#64748b",
  letterSpacing: "0.7px",
};

const nodeTextStyle = {
  display: "block",
  color: "#111827",
  fontSize: 14,
  lineHeight: 1.3,
};

const yesLabelStyle = {
  position: "absolute",
  right: -38,
  top: "45%",
  fontSize: 11,
  fontWeight: 900,
  color: "#16a34a",
};

const noLabelStyle = {
  position: "absolute",
  left: "42%",
  bottom: -28,
  fontSize: 11,
  fontWeight: 900,
  color: "#dc2626",
};

const styles = {
  page: {
    width: "100%",
  },

  header: {
    marginBottom: 24,
    padding: 28,
    borderRadius: 28,
    background: "linear-gradient(135deg, #facc15, #f59e0b, #f97316)",
    color: "#422006",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 22px 45px rgba(245,158,11,0.32)",
  },

  eyebrow: {
    margin: "0 0 6px",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#713f12",
    fontSize: 14,
    lineHeight: 1.6,
  },

  statusBadge: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.38)",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  savedNotice: {
    marginBottom: 18,
    padding: "15px 18px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
    border: "1px solid #86efac",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 24,
    alignItems: "start",
  },

  panel: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 26,
    padding: 24,
    border: "1px solid #fde68a",
    boxShadow: "0 16px 38px rgba(120,53,15,0.10)",
  },

  canvasPanel: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 26,
    padding: 24,
    border: "1px solid #fde68a",
    boxShadow: "0 16px 38px rgba(120,53,15,0.10)",
  },

  panelHeader: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },

  panelTitle: {
    margin: 0,
    fontSize: 21,
    fontWeight: 900,
    color: "#422006",
  },

  panelDesc: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#92400e",
    lineHeight: 1.5,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#78350f",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 16,
    border: "1px solid #fcd34d",
    outline: "none",
    fontSize: 14,
    background: "#fffbeb",
    color: "#422006",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 140,
    padding: "14px",
    borderRadius: 18,
    border: "1px solid #fcd34d",
    outline: "none",
    resize: "vertical",
    fontSize: 14,
    lineHeight: 1.6,
    background: "#fffbeb",
    color: "#422006",
  },

  primaryBtn: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #f59e0b, #f97316)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(249,115,22,0.28)",
  },

  saveFlowBtn: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(34,197,94,0.26)",
  },

  saveHint: {
    margin: "-6px 0 0",
    padding: "12px 14px",
    borderRadius: 16,
    background: "#f0fdf4",
    color: "#166534",
    fontSize: 12,
    lineHeight: 1.5,
    border: "1px solid #bbf7d0",
  },

  questionBox: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    background: "#fffbeb",
    border: "1px solid #fcd34d",
  },

  questionLabel: {
    display: "inline-block",
    marginBottom: 8,
    fontSize: 11,
    fontWeight: 900,
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  questionText: {
    margin: 0,
    color: "#422006",
    fontSize: 14,
    lineHeight: 1.6,
    fontWeight: 700,
  },

  reactFlowWrap: {
    width: "100%",
    height: 640,
    borderRadius: 24,
    overflow: "hidden",
    border: "2px dashed #f59e0b",
    background: "#fff7ed",
  },

  emptyState: {
    minHeight: 420,
    borderRadius: 22,
    border: "2px dashed #fbbf24",
    background: "#fffbeb",
    color: "#92400e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: 24,
    fontWeight: 800,
  },
};

const animationStyles = `
button:hover {
  transform: translateY(-2px);
  filter: brightness(1.03);
}

input:focus,
textarea:focus,
select:focus {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 4px rgba(245,158,11,0.16);
  background: #fff !important;
}

.react-flow__edge-path {
  stroke-linecap: round;
}

@media (max-width: 980px) {
  section {
    grid-template-columns: 1fr !important;
  }
}
`;

export default DndForm;
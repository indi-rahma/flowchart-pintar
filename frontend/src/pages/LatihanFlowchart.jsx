import React, { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const FlowNode = ({ data, selected }) => {
  const strokeColor = selected ? "#2563EB" : "#111827";

  return (
    <div style={styles.nodeBox}>
      {/* TOP */}
      <Handle id="top-source" type="source" position={Position.Top} style={{ ...styles.handle, left: "45%" }} />
      <Handle id="top-target" type="target" position={Position.Top} style={{ ...styles.handle, left: "55%" }} />

      {/* RIGHT */}
      <Handle id="right-source" type="source" position={Position.Right} style={{ ...styles.handle, top: "45%" }} />
      <Handle id="right-target" type="target" position={Position.Right} style={{ ...styles.handle, top: "55%" }} />

      {/* BOTTOM */}
      <Handle id="bottom-source" type="source" position={Position.Bottom} style={{ ...styles.handle, left: "45%" }} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} style={{ ...styles.handle, left: "55%" }} />

      {/* LEFT */}
      <Handle id="left-source" type="source" position={Position.Left} style={{ ...styles.handle, top: "45%" }} />
      <Handle id="left-target" type="target" position={Position.Left} style={{ ...styles.handle, top: "55%" }} />

      {data.shape === "text" ? (
        <div
          style={{
            ...styles.textOnlyNode,
            border: selected ? "2px dashed #2563EB" : "2px dashed #CBD5E1",
          }}
        >
          {data.label}
        </div>
      ) : (
        <>
          <svg width="180" height="110" viewBox="0 0 180 110">
            {data.shape === "terminator" && (
              <rect x="10" y="25" width="160" height="60" rx="30" fill="#fff" stroke={strokeColor} strokeWidth="3" />
            )}

            {data.shape === "process" && (
              <rect x="10" y="25" width="160" height="60" rx="8" fill="#fff" stroke={strokeColor} strokeWidth="3" />
            )}

            {data.shape === "decision" && (
              <polygon points="90,5 175,55 90,105 5,55" fill="#fff" stroke={strokeColor} strokeWidth="3" />
            )}

            {data.shape === "io" && (
              <polygon points="35,25 170,25 145,85 10,85" fill="#fff" stroke={strokeColor} strokeWidth="3" />
            )}

            {data.shape === "document" && (
              <path
                d="M10 25 H170 V75 C135 105 105 60 75 88 C45 113 25 92 10 85 Z"
                fill="#fff"
                stroke={strokeColor}
                strokeWidth="3"
              />
            )}

            {data.shape === "database" && (
              <>
                <ellipse cx="90" cy="28" rx="75" ry="18" fill="#fff" stroke={strokeColor} strokeWidth="3" />
                <path d="M15 28 V82 C15 92 150 92 165 82 V28" fill="#fff" stroke={strokeColor} strokeWidth="3" />
                <ellipse cx="90" cy="82" rx="75" ry="18" fill="#fff" stroke={strokeColor} strokeWidth="3" />
              </>
            )}

            {data.shape === "predefined" && (
              <>
                <rect x="10" y="25" width="160" height="60" rx="8" fill="#fff" stroke={strokeColor} strokeWidth="3" />
                <line x1="30" y1="25" x2="30" y2="85" stroke="#111827" strokeWidth="3" />
                <line x1="150" y1="25" x2="150" y2="85" stroke="#111827" strokeWidth="3" />
              </>
            )}

            {data.shape === "manual" && (
              <path d="M20 85 L35 25 H165 L145 85 Z" fill="#fff" stroke={strokeColor} strokeWidth="3" />
            )}

            {data.shape === "delay" && (
              <path d="M10 25 H110 C155 25 170 55 110 85 H10 Z" fill="#fff" stroke={strokeColor} strokeWidth="3" />
            )}
          </svg>

          <div style={styles.nodeText}>{data.label}</div>
        </>
      )}
    </div>
  );
};

const nodeTypes = {
  flowNode: FlowNode,
};

function LatihanFlowchart() {
  const flowRef = useRef(null);

  const [nodeId, setNodeId] = useState(2);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      type: "flowNode",
      position: { x: 360, y: 90 },
      data: {
        label: "Mulai",
        shape: "terminator",
      },
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const tambahNode = (label, shape) => {
    const id = String(nodeId);

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "flowNode",
        position: {
          x: 250 + Math.random() * 320,
          y: 170 + Math.random() * 300,
        },
        data: {
          label,
          shape,
        },
      },
    ]);

    setNodeId((prev) => prev + 1);
  };

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: false,
            style: {
              stroke: "#111827",
              strokeWidth: 2.8,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#111827",
              width: 18,
              height: 18,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const updateSelectedNodeText = (value) => {
    if (!selectedNode) return;

    setSelectedNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        label: value,
      },
    });

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                label: value,
              },
            }
          : node
      )
    );
  };

  const hapusTerpilih = () => {
    const nodeIds = selectedNodes.map((node) => node.id);
    const edgeIds = selectedEdges.map((edge) => edge.id);

    setNodes((nds) => nds.filter((node) => !nodeIds.includes(node.id)));

    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !edgeIds.includes(edge.id) &&
          !nodeIds.includes(edge.source) &&
          !nodeIds.includes(edge.target)
      )
    );

    setSelectedNode(null);
    setSelectedNodes([]);
    setSelectedEdges([]);
  };

  const resetCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedNodes([]);
    setSelectedEdges([]);
  };

  const downloadPDF = async () => {
    if (!flowRef.current) return;

    const dataUrl = await toPng(flowRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    });

    const pdf = new jsPDF("landscape", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(dataUrl, "PNG", 8, 8, pageWidth - 16, pageHeight - 16);
    pdf.save("latihan-flowchart-siswa.pdf");
  };

  return (
    <div style={styles.page}>
      <style>{`
        .react-flow__handle {
          opacity: 0;
          transition: 0.18s ease;
        }

        .react-flow__node:hover .react-flow__handle {
          opacity: 1;
        }

        .react-flow__handle:hover {
          background: #FACC15 !important;
          transform: scale(1.35);
        }

        .react-flow__edge-path {
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #2563EB !important;
          stroke-width: 4px !important;
        }

        .react-flow__connection-path {
          stroke: #111827;
          stroke-width: 3;
          stroke-linecap: round;
        }
      `}</style>

      <header style={styles.header}>
        <div>
          <div style={styles.badge}>LATIHAN FLOWCHART</div>
          <h1 style={styles.title}>Flowchart Builder</h1>
          <p style={styles.subtitle}>
            Yuk latihan membangun flowchart!
          </p>
        </div>

        <div style={styles.actions}>
          <button style={styles.deleteBtn} onClick={hapusTerpilih}>
            Hapus Terpilih
          </button>
          <button style={styles.resetBtn} onClick={resetCanvas}>
            Reset
          </button>
          <button style={styles.downloadBtn} onClick={downloadPDF}>
            Download PDF
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.toolbar}>
          <h3 style={styles.toolbarTitle}>Tambah Simbol</h3>

          <button style={styles.toolBtn} onClick={() => tambahNode("Mulai", "terminator")}>
            <span style={styles.previewOval}>Mulai</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Proses", "process")}>
            <span style={styles.previewProcess}>Proses</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Keputusan?", "decision")}>
            <span style={styles.previewDecision}>?</span>
            <span>Decision</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Input / Output", "io")}>
            <span style={styles.previewIO}>Input / Output</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Dokumen", "document")}>
            <span style={styles.previewDocument}>Dokumen</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Database", "database")}>
            <span style={styles.previewDatabase}>Database</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Sub Proses", "predefined")}>
            <span style={styles.previewProcess}>Sub Proses</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Manual Input", "manual")}>
            <span style={styles.previewIO}>Manual</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Delay", "delay")}>
            <span style={styles.previewProcess}>Delay</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Teks bebas", "text")}>
            <span style={styles.previewText}>Teks</span>
          </button>

          <button style={styles.toolBtn} onClick={() => tambahNode("Selesai", "terminator")}>
            <span style={styles.previewOval}>Selesai</span>
          </button>

          {selectedNode && (
            <div style={styles.editPanel}>
              <h3 style={styles.editTitle}>Edit Tulisan</h3>
              <input
                style={styles.editInput}
                value={selectedNode.data.label}
                onChange={(e) => updateSelectedNodeText(e.target.value)}
                placeholder="Tulis isi node..."
              />
              <button style={styles.doneBtn} onClick={() => setSelectedNode(null)}>
                Selesai
              </button>
            </div>
          )}

          <div style={styles.note}>
            Cara pakai:
            <br />
            1. Tambah simbol
            <br />
            2. Klik node untuk edit tulisan
            <br />
            3. Hover node sampai titik muncul
            <br />
            4. Tarik titik dari ujung mana pun
            <br />
            5. Klik node/garis lalu hapus
          </div>
        </aside>

        <main style={styles.canvasWrap}>
          <div ref={flowRef} style={styles.canvas}>
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(event, node) => setSelectedNode(node)}
              onPaneClick={() => setSelectedNode(null)}
              onSelectionChange={({ nodes, edges }) => {
                setSelectedNodes(nodes);
                setSelectedEdges(edges);
              }}
              fitView
              deleteKeyCode={["Backspace", "Delete"]}
              multiSelectionKeyCode={["Shift"]}
              defaultEdgeOptions={{
                type: "smoothstep",
                style: {
                  strokeWidth: 2.8,
                  stroke: "#111827",
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#111827",
                  width: 18,
                  height: 18,
                },
              }}
              connectionLineStyle={{
                stroke: "#111827",
                strokeWidth: 2.8,
              }}
              connectionLineType="smoothstep"
              snapToGrid={true}
              snapGrid={[10, 10]}
            >
              <Background gap={20} size={1.2} color="#CBD5E1" />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FFFFFF",
    padding: "45px",
    fontFamily: "Plus Jakarta Sans, Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
  },

  badge: {
    display: "inline-block",
    background: "#000",
    color: "#FDE047",
    padding: "7px 13px",
    borderRadius: "9px",
    fontSize: "11px",
    fontWeight: "900",
  },

  title: {
    margin: "12px 0 6px",
    fontSize: "38px",
    fontWeight: "900",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    color: "#64748B",
    fontSize: "15px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  deleteBtn: {
    padding: "13px 18px",
    borderRadius: "14px",
    border: "none",
    background: "#EF4444",
    color: "#FFF",
    fontWeight: "900",
    cursor: "pointer",
  },

  resetBtn: {
    padding: "13px 18px",
    borderRadius: "14px",
    border: "3px solid #000",
    background: "#FFF",
    color: "#000",
    fontWeight: "900",
    cursor: "pointer",
  },

  downloadBtn: {
    padding: "13px 20px",
    borderRadius: "14px",
    border: "none",
    background: "#000",
    color: "#FDE047",
    fontWeight: "900",
    cursor: "pointer",
  },

  layout: {
    display: "flex",
    gap: "25px",
    alignItems: "stretch",
  },

  toolbar: {
    width: "285px",
    padding: "22px",
    border: "4px solid #000",
    borderRadius: "28px",
    background: "#FFFFFF",
    boxShadow: "10px 10px 0px #EAB308",
    maxHeight: "710px",
    overflowY: "auto",
  },

  toolbarTitle: {
    margin: "0 0 18px",
    fontSize: "19px",
    fontWeight: "900",
  },

  toolBtn: {
    width: "100%",
    minHeight: "58px",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "16px",
    border: "2px solid #E5E7EB",
    background: "#F8FAFC",
    cursor: "pointer",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },

  editPanel: {
    marginTop: "16px",
    padding: "15px",
    borderRadius: "18px",
    background: "#F8FAFC",
    border: "2px solid #E5E7EB",
  },

  editTitle: {
    margin: "0 0 10px",
    fontSize: "14px",
    fontWeight: "900",
  },

  editInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "2px solid #CBD5E1",
    fontWeight: "800",
    outline: "none",
  },

  doneBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "11px",
    borderRadius: "12px",
    border: "none",
    background: "#000",
    color: "#FDE047",
    fontWeight: "900",
    cursor: "pointer",
  },

  canvasWrap: {
    flex: 1,
  },

  canvas: {
    height: "710px",
    border: "4px solid #000",
    borderRadius: "30px",
    overflow: "hidden",
    background: "#FFF",
    boxShadow: "14px 14px 0px #EAB308",
  },

  nodeBox: {
    width: "180px",
    height: "110px",
    position: "relative",
  },

  nodeText: {
    position: "absolute",
    inset: "20px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "900",
    fontSize: "12px",
    lineHeight: "1.25",
    color: "#111827",
    zIndex: 3,
    pointerEvents: "none",
  },

  textOnlyNode: {
    minWidth: "150px",
    minHeight: "56px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.88)",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "800",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
  },

  handle: {
    width: "11px",
    height: "11px",
    background: "#fff",
    border: "2px solid #111827",
    zIndex: 10,
  },

  previewOval: {
    border: "2px solid #111827",
    borderRadius: "999px",
    padding: "8px 24px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewProcess: {
    border: "2px solid #111827",
    borderRadius: "6px",
    padding: "8px 24px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewDecision: {
    width: "34px",
    height: "34px",
    border: "2px solid #111827",
    transform: "rotate(45deg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#FFF",
    fontSize: "12px",
  },

  previewIO: {
    border: "2px solid #111827",
    transform: "skew(-14deg)",
    padding: "8px 18px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewDocument: {
    border: "2px solid #111827",
    borderRadius: "6px 6px 18px 18px",
    padding: "8px 20px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewDatabase: {
    border: "2px solid #111827",
    borderRadius: "50%",
    padding: "8px 18px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewText: {
    border: "2px dashed #111827",
    padding: "8px 22px",
    borderRadius: "10px",
    background: "#FFF",
    fontSize: "12px",
  },

  note: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "16px",
    background: "#FEF9C3",
    color: "#854D0E",
    fontSize: "12px",
    fontWeight: "800",
    lineHeight: "1.6",
  },
};

export default LatihanFlowchart;
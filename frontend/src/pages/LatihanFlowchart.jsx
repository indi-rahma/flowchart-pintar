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
  const strokeColor = selected ? "#007AFF" : "#1D1D1F";

  return (
    <div style={styles.nodeBox}>
      <Handle id="top-source" type="source" position={Position.Top} style={{ ...styles.handle, left: "45%" }} />
      <Handle id="top-target" type="target" position={Position.Top} style={{ ...styles.handle, left: "55%" }} />

      <Handle id="right-source" type="source" position={Position.Right} style={{ ...styles.handle, top: "45%" }} />
      <Handle id="right-target" type="target" position={Position.Right} style={{ ...styles.handle, top: "55%" }} />

      <Handle id="bottom-source" type="source" position={Position.Bottom} style={{ ...styles.handle, left: "45%" }} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} style={{ ...styles.handle, left: "55%" }} />

      <Handle id="left-source" type="source" position={Position.Left} style={{ ...styles.handle, top: "45%" }} />
      <Handle id="left-target" type="target" position={Position.Left} style={{ ...styles.handle, top: "55%" }} />

      {data.shape === "text" ? (
        <div
          style={{
            ...styles.textOnlyNode,
            border: selected ? "2px dashed #007AFF" : "2px dashed #D2D2D7",
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
                <line x1="30" y1="25" x2="30" y2="85" stroke="#1D1D1F" strokeWidth="3" />
                <line x1="150" y1="25" x2="150" y2="85" stroke="#1D1D1F" strokeWidth="3" />
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
              stroke: "#1D1D1F",
              strokeWidth: 2.8,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#1D1D1F",
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
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          margin: 0;
          overflow-x: hidden;
          background: #F5F5F7;
        }

        .flow-layout {
          display: grid;
          grid-template-columns: minmax(230px, 300px) minmax(0, 1fr);
          gap: 20px;
          align-items: stretch;
        }

        .react-flow__handle {
          opacity: 0;
          transition: 0.18s ease;
        }

        .react-flow__node:hover .react-flow__handle,
        .react-flow__node.selected .react-flow__handle {
          opacity: 1;
        }

        .react-flow__handle:hover {
          background: #007AFF !important;
          transform: scale(1.35);
        }

        .react-flow__edge-path {
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #007AFF !important;
          stroke-width: 4px !important;
        }

        .react-flow__connection-path {
          stroke: #1D1D1F;
          stroke-width: 3;
          stroke-linecap: round;
        }

        .react-flow__controls {
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }

        .react-flow__controls-button {
          border-bottom: 1px solid rgba(60,60,67,0.12);
        }

        @media (max-width: 768px) {
          .flow-layout {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .react-flow__minimap {
            display: none;
          }

          .react-flow__controls {
            transform: scale(0.9);
            transform-origin: bottom left;
          }
        }
      `}</style>

      <header style={styles.header}>
        <div>
          <div style={styles.badge}>LATIHAN FLOWCHART</div>
          <h1 style={styles.title}>Flowchart Builder</h1>
          <p style={styles.subtitle}>Yuk latihan membangun flowchart!</p>
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

      <div className="flow-layout">
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
                  stroke: "#1D1D1F",
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#1D1D1F",
                  width: 18,
                  height: 18,
                },
              }}
              connectionLineStyle={{
                stroke: "#1D1D1F",
                strokeWidth: 2.8,
              }}
              connectionLineType="smoothstep"
              snapToGrid={true}
              snapGrid={[10, 10]}
            >
              <Background gap={20} size={1.1} color="#D2D2D7" />
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
    background: "linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 45%, #F5F5F7 100%)",
    padding: "clamp(14px, 4vw, 36px)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', Arial, sans-serif",
    overflowX: "hidden",
    color: "#1D1D1F",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px",
    gap: "16px",
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(0,122,255,0.1)",
    color: "#007AFF",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.4px",
  },

  title: {
    margin: "12px 0 6px",
    fontSize: "clamp(30px, 7vw, 46px)",
    fontWeight: "900",
    letterSpacing: "-1.6px",
    lineHeight: "1.02",
  },

  subtitle: {
    margin: 0,
    color: "#6E6E73",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    fontWeight: "600",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  deleteBtn: {
    padding: "12px 16px",
    borderRadius: "999px",
    border: "none",
    background: "#FF3B30",
    color: "#FFF",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(255,59,48,0.24)",
  },

  resetBtn: {
    padding: "12px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(60,60,67,0.16)",
    background: "rgba(255,255,255,0.8)",
    color: "#1D1D1F",
    fontWeight: "800",
    cursor: "pointer",
    backdropFilter: "blur(16px)",
  },

  downloadBtn: {
    padding: "12px 18px",
    borderRadius: "999px",
    border: "none",
    background: "#007AFF",
    color: "#FFF",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(0,122,255,0.28)",
  },

  toolbar: {
    width: "100%",
    padding: "18px",
    border: "1px solid rgba(60,60,67,0.14)",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
    maxHeight: "720px",
    overflowY: "auto",
    backdropFilter: "blur(22px)",
  },

  toolbarTitle: {
    margin: "0 0 16px",
    fontSize: "18px",
    fontWeight: "900",
    letterSpacing: "-0.3px",
  },

  toolBtn: {
    width: "100%",
    minHeight: "56px",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "18px",
    border: "1px solid rgba(60,60,67,0.12)",
    background: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 8px 18px rgba(0,0,0,0.04)",
  },

  editPanel: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "22px",
    background: "#F5F5F7",
    border: "1px solid rgba(60,60,67,0.12)",
  },

  editTitle: {
    margin: "0 0 10px",
    fontSize: "14px",
    fontWeight: "900",
  },

  editInput: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "16px",
    border: "1px solid rgba(60,60,67,0.18)",
    background: "#FFFFFF",
    fontWeight: "700",
    outline: "none",
    fontSize: "14px",
  },

  doneBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    borderRadius: "999px",
    border: "none",
    background: "#1D1D1F",
    color: "#FFF",
    fontWeight: "900",
    cursor: "pointer",
  },

  canvasWrap: {
    minWidth: 0,
  },

  canvas: {
    height: "min(720px, 72vh)",
    minHeight: "520px",
    border: "1px solid rgba(60,60,67,0.14)",
    borderRadius: "32px",
    overflow: "hidden",
    background: "#FFFFFF",
    boxShadow: "0 20px 55px rgba(0,0,0,0.1)",
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
    fontWeight: "850",
    fontSize: "12px",
    lineHeight: "1.25",
    color: "#1D1D1F",
    zIndex: 3,
    pointerEvents: "none",
  },

  textOnlyNode: {
    minWidth: "150px",
    minHeight: "56px",
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.92)",
    color: "#1D1D1F",
    fontSize: "14px",
    fontWeight: "800",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
  },

  handle: {
    width: "12px",
    height: "12px",
    background: "#FFFFFF",
    border: "2px solid #1D1D1F",
    zIndex: 10,
  },

  previewOval: {
    border: "2px solid #1D1D1F",
    borderRadius: "999px",
    padding: "8px 24px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewProcess: {
    border: "2px solid #1D1D1F",
    borderRadius: "8px",
    padding: "8px 24px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewDecision: {
    width: "34px",
    height: "34px",
    border: "2px solid #1D1D1F",
    transform: "rotate(45deg)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#FFF",
    fontSize: "12px",
  },

  previewIO: {
    border: "2px solid #1D1D1F",
    transform: "skew(-14deg)",
    padding: "8px 18px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewDocument: {
    border: "2px solid #1D1D1F",
    borderRadius: "6px 6px 18px 18px",
    padding: "8px 20px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewDatabase: {
    border: "2px solid #1D1D1F",
    borderRadius: "50%",
    padding: "8px 18px",
    background: "#FFF",
    fontSize: "12px",
  },

  previewText: {
    border: "2px dashed #1D1D1F",
    padding: "8px 22px",
    borderRadius: "12px",
    background: "#FFF",
    fontSize: "12px",
  },

  note: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,122,255,0.08)",
    color: "#005BBB",
    fontSize: "12px",
    fontWeight: "750",
    lineHeight: "1.6",
  },
};

export default LatihanFlowchart;
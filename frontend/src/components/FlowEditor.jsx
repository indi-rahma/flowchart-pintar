import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const palette = {
  navy: "#0f172a",
  blue: "#2563eb",
  yellow: "#facc15",
  yellowDeep: "#eab308",
  slate: "#64748b",
  line: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
  green: "#10b981",
  red: "#ef4444",
};

const handleBase = {
  width: 10,
  height: 10,
  border: "2px solid white",
};

const iconButtonStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 26,
  height: 26,
  borderRadius: 999,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#64748b",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 12,
  zIndex: 3,
};

const labelStyle = {
  fontSize: 15,
  fontWeight: 800,
  lineHeight: 1.3,
  textAlign: "center",
};

const subStyle = {
  fontSize: 12,
  marginTop: 6,
  textAlign: "center",
};

const TerminatorNode = ({ id, data }) => (
  <div
    style={{
      minWidth: 190,
      padding: "16px 20px",
      borderRadius: 999,
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "#f8fafc",
      border: "2px solid rgba(250, 204, 21, 0.65)",
      boxShadow: "0 14px 34px rgba(15, 23, 42, 0.22)",
      position: "relative",
      textAlign: "center",
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      style={{ ...handleBase, background: palette.yellow }}
    />

    {data.onDelete && id !== "start" && (
      <button onClick={() => data.onDelete(id)} style={iconButtonStyle}>
        ✕
      </button>
    )}

    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.2,
        color: "#facc15",
        marginBottom: 8,
      }}
    >
      TERMINATOR
    </div>

    <div style={{ ...labelStyle, color: "#ffffff" }}>{data.label}</div>
    <div style={{ ...subStyle, color: "#cbd5e1" }}>
      Titik mulai / selesai flow
    </div>

    <Handle
      type="source"
      position={Position.Bottom}
      style={{ ...handleBase, background: palette.yellow }}
    />
  </div>
);

const ProcessNode = ({ id, data }) => (
  <div
    style={{
      minWidth: 210,
      padding: "18px 18px 16px",
      borderRadius: 14,
      background: "#ffffff",
      border: "2px solid #0f172a",
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
      position: "relative",
      textAlign: "center",
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      style={{ ...handleBase, background: palette.navy }}
    />

    {data.onDelete && (
      <button onClick={() => data.onDelete(id)} style={iconButtonStyle}>
        ✕
      </button>
    )}

    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.1,
        color: "#334155",
        marginBottom: 8,
      }}
    >
      PROCESS
    </div>

    <div style={{ ...labelStyle, color: palette.navy }}>{data.label}</div>
    <div style={{ ...subStyle, color: palette.slate }}>Langkah proses / rumus</div>

    <Handle
      type="source"
      position={Position.Bottom}
      style={{ ...handleBase, background: palette.navy }}
    />
  </div>
);

const InputOutputNode = ({ id, data }) => (
  <div
    style={{
      position: "relative",
      width: 230,
      minHeight: 108,
      filter: "drop-shadow(0 12px 28px rgba(15, 23, 42, 0.08))",
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      style={{
        ...handleBase,
        background: data.kind === "output" ? palette.blue : palette.yellowDeep,
      }}
    />

    {data.onDelete && (
      <button onClick={() => data.onDelete(id)} style={iconButtonStyle}>
        ✕
      </button>
    )}

    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: "skewX(-18deg)",
        borderRadius: 14,
        border:
          data.kind === "output"
            ? "2px solid rgba(37, 99, 235, 0.8)"
            : "2px solid rgba(234, 179, 8, 0.85)",
        background:
          data.kind === "output"
            ? "linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)"
            : "linear-gradient(135deg, #fffbea 0%, #fef3c7 100%)",
      }}
    />

    <div
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: 108,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "16px 24px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.1,
          marginBottom: 8,
          textAlign: "center",
          color: data.kind === "output" ? "#1d4ed8" : "#a16207",
        }}
      >
        {data.kind === "output" ? "OUTPUT" : "INPUT"}
      </div>

      <div
        style={{
          ...labelStyle,
          color: data.kind === "output" ? "#1d4ed8" : "#854d0e",
        }}
      >
        {data.label}
      </div>

      <div
        style={{
          ...subStyle,
          color: data.kind === "output" ? "#2563eb" : "#a16207",
        }}
      >
        {data.kind === "output"
          ? "Data keluar ke user"
          : "Data masuk dari user"}
      </div>
    </div>

    <Handle
      type="source"
      position={Position.Bottom}
      style={{
        ...handleBase,
        background: data.kind === "output" ? palette.blue : palette.yellowDeep,
      }}
    />
  </div>
);

const nodeTypes = {
  flowStart: TerminatorNode,
  flowProcess: ProcessNode,
  flowInput: InputOutputNode,
  flowOutput: InputOutputNode,
};

const initialNodes = [
  {
    id: "start",
    type: "flowStart",
    data: { label: "START" },
    position: { x: 280, y: 30 },
  },
];

const PaletteCard = ({ title, subtitle, preview, onDragStart, active }) => (
  <div
    draggable
    onDragStart={onDragStart}
    style={{
      cursor: "grab",
      userSelect: "none",
      padding: "14px",
      borderRadius: 18,
      marginBottom: 12,
      background: "#ffffff",
      border: active ? "1px solid #94a3b8" : "1px solid #e2e8f0",
      boxShadow: active ? "0 12px 24px rgba(15, 23, 42, 0.08)" : "none",
      transform: active ? "scale(1.02)" : "scale(1)",
      transition: "0.2s ease",
    }}
  >
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
      }}
    >
      {preview}
    </div>
    <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{title}</div>
    <div style={{ fontSize: 12, marginTop: 4, color: "#64748b" }}>{subtitle}</div>
  </div>
);

const FlowInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState("success");
  const [feedback, setFeedback] = useState({ message: "", color: palette.slate });
  const [draggingType, setDraggingType] = useState("");
  const [isCanvasActive, setIsCanvasActive] = useState(false);

  const { screenToFlowPosition } = useReactFlow();

  const removeNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const nodesWithActions = useMemo(
    () =>
      nodes.map((node) =>
        node.id === "start"
          ? node
          : {
              ...node,
              data: {
                ...node.data,
                onDelete: removeNode,
              },
            }
      ),
    [nodes, removeNode]
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: palette.navy,
            },
            style: {
              stroke: palette.navy,
              strokeWidth: 2.6,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragStart = (event, type, payload) => {
    setDraggingType(type);
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.setData("payload", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const payloadText = event.dataTransfer.getData("payload");
      const payload = payloadText ? JSON.parse(payloadText) : {};
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setIsCanvasActive(false);
      setDraggingType("");

      if (!type) return;

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          ...payload,
          onDelete: removeNode,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, removeNode]
  );

  const checkLogic = () => {
    const inputNode = nodes.find((n) => n.data?.label === "Input Sisi");
    const processNode = nodes.find((n) => n.data?.label === "L = Sisi × Sisi");
    const outputNode = nodes.find((n) => n.data?.label === "Tampilkan Luas");

    const hasStartToInput = edges.some(
      (e) => e.source === "start" && e.target === inputNode?.id
    );
    const hasInputToProcess = edges.some(
      (e) => e.source === inputNode?.id && e.target === processNode?.id
    );
    const hasProcessToOutput = edges.some(
      (e) => e.source === processNode?.id && e.target === outputNode?.id
    );

    if (
      inputNode &&
      processNode &&
      outputNode &&
      hasStartToInput &&
      hasInputToProcess &&
      hasProcessToOutput
    ) {
      setStatus("success");
      setFeedback({
        message:
          "Mantap. Flowchart kamu sudah benar dan bentuk simbolnya juga sudah sesuai standar.",
        color: palette.green,
      });
    } else {
      setStatus("error");
      setFeedback({
        message:
          "Masih belum pas. Susunan yang dicari: START → Input Sisi → L = Sisi × Sisi → Tampilkan Luas.",
        color: palette.red,
      });
    }

    setIsModalOpen(true);
  };

  const resetBoard = () => {
    setNodes(initialNodes);
    setEdges([]);
    setDraggingType("");
    setIsCanvasActive(false);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: 680,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: 28,
        padding: 22,
        border: "1px solid #e2e8f0",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
        position: "relative",
      }}
    >
      {isModalOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.68)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 28,
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 390,
              background: "white",
              padding: 34,
              borderRadius: 28,
              textAlign: "center",
              boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 62, marginBottom: 12 }}>
              {status === "success" ? "🔥" : "🧠"}
            </div>
            <h2
              style={{
                color: palette.navy,
                fontWeight: 900,
                margin: "0 0 10px",
                fontSize: 28,
              }}
            >
              {status === "success" ? "Bagus!" : "Belum Pas"}
            </h2>
            <p
              style={{
                fontSize: 15,
                color: feedback.color,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {feedback.message}
            </p>

            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: 22,
                padding: "14px 18px",
                background:
                  status === "success"
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "white",
                border: "none",
                borderRadius: 16,
                cursor: "pointer",
                fontWeight: 800,
                width: "100%",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          width: "100%",
          minHeight: 630,
          gap: 20,
        }}
      >
        <div
          style={{
            padding: 22,
            background: "white",
            borderRadius: 24,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "6px 10px",
              borderRadius: 999,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 14,
            }}
          >
            Flowchart Builder
          </div>

          <h3
            style={{
              margin: 0,
              color: palette.navy,
              fontWeight: 900,
              fontSize: 22,
              lineHeight: 1.2,
            }}
          >
            Simbol Flowchart
          </h3>

          <p
            style={{
              fontSize: 13,
              color: palette.slate,
              lineHeight: 1.7,
              marginTop: 10,
              marginBottom: 18,
            }}
          >
            Buat flowchart sederhana cara menghitung luas persegi dengan urutan ideal!
          </p>

          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              marginBottom: 10,
            }}
          >
            Komponen
          </div>

          <PaletteCard
            title="Input"
            subtitle="Jajar genjang"
            active={draggingType === "flowInput"}
            onDragStart={(e) =>
              onDragStart(e, "flowInput", {
                label: "Input Sisi",
                kind: "input",
              })
            }
            preview={
              <div
                style={{
                  width: 62,
                  height: 34,
                  transform: "skewX(-18deg)",
                  border: "2px solid #eab308",
                  background: "#fef3c7",
                  borderRadius: 8,
                }}
              />
            }
          />

          <PaletteCard
            title="Process"
            subtitle="Kotak proses"
            active={draggingType === "flowProcess"}
            onDragStart={(e) =>
              onDragStart(e, "flowProcess", {
                label: "L = Sisi × Sisi",
              })
            }
            preview={
              <div
                style={{
                  width: 62,
                  height: 34,
                  border: "2px solid #0f172a",
                  background: "#ffffff",
                  borderRadius: 8,
                }}
              />
            }
          />

          <PaletteCard
            title="Output"
            subtitle="Jajar genjang"
            active={draggingType === "flowOutput"}
            onDragStart={(e) =>
              onDragStart(e, "flowOutput", {
                label: "Tampilkan Luas",
                kind: "output",
              })
            }
            preview={
              <div
                style={{
                  width: 62,
                  height: 34,
                  transform: "skewX(-18deg)",
                  border: "2px solid #2563eb",
                  background: "#dbeafe",
                  borderRadius: 8,
                }}
              />
            }
          />

          <div
            style={{
              marginTop: 18,
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: 18,
              padding: 14,
              fontSize: 12,
              color: palette.slate,
              lineHeight: 1.7,
            }}
          >
            Urutan ideal:
            <div style={{ marginTop: 6, fontWeight: 700, color: palette.navy }}>
              START → INPUT → PROCESS → OUTPUT
            </div>
          </div>

          <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
            <button onClick={checkLogic} style={primaryButton}>
              Cek Logika
            </button>

            <button onClick={resetBoard} style={secondaryButton}>
              Reset Canvas
            </button>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            border: `1px solid ${
              isCanvasActive ? "rgba(37, 99, 235, 0.35)" : "#e2e8f0"
            }`,
            background: "white",
            boxShadow: isCanvasActive
              ? "0 0 0 4px rgba(37, 99, 235, 0.08)"
              : "inset 0 2px 4px rgba(15, 23, 42, 0.03)",
            transition: "all 0.25s ease",
          }}
        >
          <ReactFlow
            nodes={nodesWithActions}
            nodeTypes={nodeTypes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setIsCanvasActive(true);
            }}
            onDragLeave={() => setIsCanvasActive(false)}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
          >
            <Background color="#e2e8f0" gap={24} size={1.3} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) => {
                if (node.type === "flowInput") return "#facc15";
                if (node.type === "flowOutput") return "#60a5fa";
                if (node.type === "flowStart") return "#0f172a";
                return "#94a3b8";
              }}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
              }}
            />
            <Controls
              style={{
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                overflow: "hidden",
              }}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

const primaryButton = {
  padding: "15px 16px",
  background: "linear-gradient(135deg, #facc15 0%, #eab308 100%)",
  border: "none",
  borderRadius: 16,
  fontWeight: 900,
  cursor: "pointer",
  color: "#854d0e",
  boxShadow: "0 12px 24px rgba(234, 179, 8, 0.22)",
};

const secondaryButton = {
  padding: "14px 16px",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  fontWeight: 800,
  cursor: "pointer",
  color: "#334155",
};

const FlowEditor = () => (
  <ReactFlowProvider>
    <FlowInner />
  </ReactFlowProvider>
);

export default FlowEditor;
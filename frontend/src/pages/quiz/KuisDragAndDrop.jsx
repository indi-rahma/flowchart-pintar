import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useInternalNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function getNodeType(item) {
  const type = String(item?.node_type || "").toLowerCase();
  const text = String(item?.text || "").toLowerCase();

  if (type === "start" || text.includes("start") || text.includes("mulai"))
    return "start";
  if (type === "end" || text.includes("end") || text.includes("selesai"))
    return "end";

  if (
    type === "decision" ||
    text.includes("percabangan") ||
    text.includes("decision") ||
    text.includes("cek") ||
    text.includes("jika") ||
    text.includes("apakah")
  ) {
    return "decision";
  }

  if (
    type === "input" ||
    type === "output" ||
    text.includes("input") ||
    text.includes("output") ||
    text.includes("masukan") ||
    text.includes("keluaran")
  ) {
    return "input";
  }

  return "process";
}

function getNodeBox(node) {
  const position =
    node?.internals?.positionAbsolute ||
    node?.positionAbsolute ||
    node?.position ||
    { x: 0, y: 0 };

  const width = node?.measured?.width || node?.width || 150;
  const height = node?.measured?.height || node?.height || 70;

  return {
    x: position.x,
    y: position.y,
    width,
    height,
    centerX: position.x + width / 2,
    centerY: position.y + height / 2,
  };
}

function getIntersectionPoint(fromNode, toNode) {
  const from = getNodeBox(fromNode);
  const to = getNodeBox(toNode);

  const dx = to.centerX - from.centerX;
  const dy = to.centerY - from.centerY;

  if (dx === 0 && dy === 0) {
    return {
      x: from.centerX,
      y: from.centerY,
    };
  }

  const halfWidth = from.width / 2;
  const halfHeight = from.height / 2;

  const scaleX = dx === 0 ? Infinity : Math.abs(halfWidth / dx);
  const scaleY = dy === 0 ? Infinity : Math.abs(halfHeight / dy);
  const scale = Math.min(scaleX, scaleY);

  return {
    x: from.centerX + dx * scale,
    y: from.centerY + dy * scale,
  };
}

function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
  label,
  labelStyle,
  labelBgStyle,
}) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) return null;

  const sourcePoint = getIntersectionPoint(sourceNode, targetNode);
  const targetPoint = getIntersectionPoint(targetNode, sourceNode);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sourcePoint.x,
    sourceY: sourcePoint.y,
    targetX: targetPoint.x,
    targetY: targetPoint.y,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 3,
          strokeLinecap: "round",
          ...style,
        }}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              background: labelBgStyle?.fill || "#ffffff",
              color: labelStyle?.fill || "#111827",
              pointerEvents: "all",
              boxShadow: "0 6px 16px rgba(15,23,42,0.12)",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function FlowNode({ data }) {
  const type = data?.node_type || "process";

  const label =
    type === "start"
      ? "START"
      : type === "end"
        ? "END"
        : type === "input"
          ? "INPUT / OUTPUT"
          : type === "decision"
            ? "PERCABANGAN"
            : "PROSES";

  const base = {
    position: "relative",
    minWidth: 150,
    minHeight: 70,
    padding: "12px 16px",
    background: "#fff",
    borderWidth: 2.3,
    borderStyle: "solid",
    borderColor: "#f59e0b",
    color: "#1D1D1F",
    fontWeight: 900,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 28px rgba(15,23,42,0.1)",
  };

  const shape =
    type === "start"
      ? {
        ...base,
        borderRadius: 999,
        borderColor: "#22c55e",
        background: "linear-gradient(180deg,#f0fdf4,#ffffff)",
      }
      : type === "end"
        ? {
          ...base,
          borderRadius: 999,
          borderColor: "#ef4444",
          background: "linear-gradient(180deg,#fef2f2,#ffffff)",
        }
        : type === "input"
          ? {
            ...base,
            borderRadius: 14,
            transform: "skew(-12deg)",
            borderColor: "#3b82f6",
            background: "linear-gradient(180deg,#eff6ff,#ffffff)",
          }
          : type === "decision"
            ? {
              ...base,
              width: 132,
              height: 132,
              minWidth: 132,
              minHeight: 132,
              padding: 16,
              transform: "rotate(45deg)",
              borderColor: "#8b5cf6",
              background: "linear-gradient(180deg,#f5f3ff,#ffffff)",
            }
            : {
              ...base,
              borderRadius: 18,
              background: "linear-gradient(180deg,#fffbeb,#ffffff)",
            };

  const textFix =
    type === "decision"
      ? {
        transform: "rotate(-45deg)",
        display: "block",
        maxWidth: 96,
        lineHeight: 1.25,
      }
      : type === "input"
        ? { transform: "skew(12deg)", display: "block" }
        : { display: "block" };

  return (
    <div style={shape}>

      {/* TARGET HANDLE */}
      <Handle type="target" position={Position.Top} style={topHandleStyle} />
      <Handle type="target" position={Position.Left} style={leftHandleStyle} />
      <Handle type="target" position={Position.Right} style={rightHandleStyle} />
      <Handle type="target" position={Position.Bottom} style={bottomHandleStyle} />

      <span style={textFix}>
        <small style={nodeTypeStyle}>{label}</small>
        <b>{data?.label}</b>
      </span>

      {/* SOURCE HANDLE */}
      {type !== "end" && (
        <>
          <Handle
            type="source"
            id="top"
            position={Position.Top}
            style={topHandleStyle}
          />

          <Handle
            type="source"
            id="left"
            position={Position.Left}
            style={leftHandleStyle}
          />

          <Handle
            type="source"
            id="right"
            position={Position.Right}
            style={rightHandleStyle}
          />

          <Handle
            type="source"
            id="bottom"
            position={Position.Bottom}
            style={bottomHandleStyle}
          />
        </>
      )}

      {type === "decision" && (
        <>
          <span style={yesLabelStyle}>Ya</span>
          <span style={noLabelStyle}>Tidak</span>
        </>
      )}
    </div>
  );
}
const nodeTypes = { flowNode: FlowNode };
const edgeTypes = { floating: FloatingEdge };

function KuisDragAndDrop({ data, items = [], onCorrectChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const shuffledItems = useMemo(() => {
    return [...items].sort(() => Math.random() - 0.5);
  }, [items]);

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) =>
        Number(a.correct_order) - Number(b.correct_order) ||
        Number(a.id) - Number(b.id)
    );
  }, [items]);

  const buildAutoLayout = useCallback(() => {
    const isMobile = window.innerWidth <= 768;

    const decisionIndex = sortedItems.findIndex(
      (item) => getNodeType(item) === "decision"
    );

    return shuffledItems.map((item, index) => {
      let x = (isMobile ? 40 : 120) + Math.random() * (isMobile ? 220 : 700);

      let y = 40 + Math.random() * 420;

      if (decisionIndex !== -1 && index > decisionIndex) {
        const after = index - decisionIndex;

        if (after === 1) {
          x = isMobile ? 40 : 210;
          y = 130 + decisionIndex * 145;
        } else if (after === 2) {
          x = isMobile ? 300 : 640;
          y = 130 + decisionIndex * 145;
        } else {
          x = isMobile ? 180 : 420;
          y = 260 + (index - decisionIndex) * 120;
        }
      }

      return {
        id: String(item.id),
        type: "flowNode",
        position: { x, y },
        data: {
          label: item.text,
          node_type: getNodeType(item),
          raw: item,
        },
      };
    });
  }, [sortedItems]);

  const resetCanvas = useCallback(() => {
    setNodes(buildAutoLayout());
    setEdges([]);
    setIsCorrect(false);
    onCorrectChange?.(false);
  }, [buildAutoLayout, setEdges, setNodes, onCorrectChange]);

  useEffect(() => {
    resetCanvas();
  }, [resetCanvas]);

  const validateFlow = useCallback(
  (currentEdges) => {
    if (!sortedItems.length) {
      setIsCorrect(false);
      onCorrectChange?.(false);
      return;
    }

    let valid = true;

    for (let i = 0; i < sortedItems.length - 1; i++) {
      const current = sortedItems[i];
      const next = sortedItems[i + 1];

      const currentType = getNodeType(current);

      // decision cukup punya minimal 2 cabang
      if (currentType === "decision") {
        const outgoing = currentEdges.filter(
          (edge) => String(edge.source) === String(current.id)
        );

        if (outgoing.length < 2) {
          valid = false;
        }

        continue;
      }

      const hasConnection = currentEdges.some(
        (edge) =>
          String(edge.source) === String(current.id) &&
          String(edge.target) === String(next.id)
      );

      if (!hasConnection) {
        valid = false;
        break;
      }
    }

    setIsCorrect(valid);
    onCorrectChange?.(valid);
  },
  [sortedItems, onCorrectChange]
);

  useEffect(() => {
    validateFlow(edges);
  }, [edges, validateFlow]);

  const onConnect = useCallback(
    (params) => {
      if (params.source === params.target) return;

      const label =
        params.sourceHandle === "yes"
          ? "Ya"
          : params.sourceHandle === "no"
            ? "Tidak"
            : "";

      setEdges((eds) => {
        const filtered = eds.filter((edge) => {
          if (params.sourceHandle === "yes" || params.sourceHandle === "no") {
            return !(
              edge.source === params.source &&
              edge.sourceHandle === params.sourceHandle
            );
          }

          return !(
            edge.source === params.source &&
            edge.sourceHandle === (params.sourceHandle || "out")
          );
        });

        const next = addEdge(
          {
            ...params,
            id: `edge-${params.source}-${params.sourceHandle || "out"}-${params.target
              }-${Date.now()}`,
            type: "floating",
            animated: false,
            label,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: params.sourceHandle === "no" ? "#ef4444" : "#111827",
            },
            style: {
              strokeWidth: 3,
              stroke: params.sourceHandle === "no" ? "#ef4444" : "#111827",
            },
            labelStyle: {
              fontWeight: 900,
              fill: params.sourceHandle === "no" ? "#991b1b" : "#166534",
            },
            labelBgStyle: {
              fill: "#ffffff",
              fillOpacity: 0.95,
            },
          },
          filtered
        );

        validateFlow(next);
        return next;
      });
    },
    [setEdges, validateFlow]
  );

  if (!items.length) {
    return (
      <div style={wrapperStyle}>
        <h3 style={questionStyle}>{data?.question || "Drag & Drop"}</h3>
        <div style={emptyStyle}>Item drag & drop belum tersedia.</div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <style>{animationStyle}</style>

      <div style={heroStyle}>
        <div
          className="quiz-hero-text"
          style={{
            flex: "1 1 320px",
            minWidth: 0,
            width: "100%",
          }}
        >
          <p style={eyebrowStyle}>Flowchart Canvas Challenge</p>
          <h3 style={questionStyle}>{data?.question}</h3>
          <p style={hintStyle}>
            Geser node agar rapi, lalu tarik dari area ujung node untuk membuat
            koneksi. Untuk percabangan, gunakan jalur <b>Ya</b> dan <b>Tidak</b>.
          </p>
        </div>
        <button
          type="button"
          className="quiz-reset-btn"
          onClick={resetCanvas}
          style={resetBtnStyle}
        >
          🔄 Rapikan Lagi
        </button>
      </div>

      <div style={legendStyle}>
        <span>🟢 Start/End = Terminator</span>
        <span>🔵 Input/Output = Jajar Genjang</span>
        <span>🟣 Decision = Ya/Tidak</span>
      </div>

      <div style={canvasOuterStyle}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={(event, edge) => {
            event.stopPropagation();

            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
          }}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={false}
        >
          <Background gap={20} size={1.2} color="#d2d2d7" />
          <Controls />
        </ReactFlow>
      </div>

      <div
        style={{
          ...statusStyle,
          background: isCorrect
            ? "linear-gradient(135deg,#dcfce7,#f0fdf4)"
            : "linear-gradient(135deg,#eef2ff,#f8fafc)",
          color: isCorrect ? "#166534" : "#3730a3",
          borderColor: isCorrect ? "#86efac" : "#c7d2fe",
        }}
      >
        {isCorrect
          ? "Mantap! Alur flowchart sudah lengkap dan tombol lanjut aktif ✅"
          : ": Urutan flowchart belum tepat. Susun panah sesuai alur yang benar ya 🧠"}
      </div>
    </div>
  );
}

const wrapperStyle = {
  padding: "clamp(14px, 4vw, 24px)",
};
const commonHandleStyle = {
  width: 16,
  height: 16,
  background: "#111827",
  border: "3px solid #ffffff",
  borderRadius: "999px",
  opacity: 1,
  boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
};

const topHandleStyle = {
  ...commonHandleStyle,
  top: -8,
};

const bottomHandleStyle = {
  ...commonHandleStyle,
  bottom: -8,
};

const leftHandleStyle = {
  ...commonHandleStyle,
  left: -8,
};

const rightHandleStyle = {
  ...commonHandleStyle,
  right: -8,
};


const heroStyle = {
  width: "100%",
  minWidth: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 16,
  padding: "clamp(16px, 4vw, 22px)",
  borderRadius: 26,
  background:
    "radial-gradient(circle at top right, rgba(0,122,255,.12), transparent 35%), linear-gradient(135deg,#ffffff,#f8fafc)",
  border: "1px solid rgba(60,60,67,0.12)",
  boxShadow: "0 14px 32px rgba(15,23,42,.06)",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  margin: "0 0 7px",
  fontSize: 11,
  fontWeight: 900,
  color: "#007AFF",
  textTransform: "uppercase",
  letterSpacing: 1,
};

const questionStyle = {
  margin: "0 0 8px",
  color: "#1D1D1F",
  fontSize: "clamp(18px, 5vw, 24px)",
  lineHeight: 1.35,
  fontWeight: 900,
  letterSpacing: "-0.5px",
};

const hintStyle = {
  margin: 0,
  color: "#6E6E73",
  fontSize: "clamp(13px, 3.5vw, 14px)",
  fontWeight: 650,
  lineHeight: 1.65,
};

const resetBtnStyle = {
  border: "none",
  background: "#007AFF",
  color: "#FFFFFF",
  padding: "12px 16px",
  borderRadius: 999,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(0,122,255,.18)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const legendStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 14,
  color: "#6E6E73",
  fontSize: 12,
  fontWeight: 850,
};

const canvasOuterStyle = {
  width: "100%",
  height: "clamp(520px, 72vh, 650px)",
  borderRadius: 28,
  border: "1px solid rgba(60,60,67,0.12)",
  overflow: "hidden",
  background:
    "radial-gradient(circle at top,#eef2ff,transparent 35%),linear-gradient(180deg,#ffffff,#f8fafc)",
  boxShadow: "0 18px 45px rgba(15,23,42,.08)",
};

const statusStyle = {
  marginTop: 14,
  padding: "14px 16px",
  borderRadius: 20,
  border: "1px solid",
  fontWeight: 850,
  textAlign: "center",
  fontSize: "clamp(13px, 3.5vw, 14px)",
  lineHeight: 1.5,
};

const emptyStyle = {
  marginTop: 16,
  padding: 18,
  borderRadius: 18,
  background: "#F5F5F7",
  color: "#6E6E73",
  textAlign: "center",
  fontWeight: 700,
};

const handleStyle = {
  width: 1,
  height: 1,
  background: "transparent",
  border: "none",
  opacity: 0,
  boxShadow: "none",
};

const nodeTypeStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 10,
  color: "#6E6E73",
  letterSpacing: ".8px",
  fontWeight: 900,
};

const yesLabelStyle = {
  position: "absolute",
  right: -38,
  top: "45%",
  fontSize: 11,
  fontWeight: 900,
  color: "#16A34A",
  background: "#DCFCE7",
  padding: "3px 7px",
  borderRadius: 999,
};

const noLabelStyle = {
  position: "absolute",
  left: "36%",
  bottom: -30,
  fontSize: 11,
  fontWeight: 900,
  color: "#DC2626",
  background: "#FEE2E2",
  padding: "3px 7px",
  borderRadius: 999,
};

const animationStyle = `
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.react-flow__resize-control,
.react-flow__selection,
.react-flow__nodesselection {
  display: none !important;
}

.react-flow__controls {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(15,23,42,.12);
}

@media (max-width: 768px) {
  .quiz-hero-text {
    flex: 1 1 100% !important;
    width: 100% !important;
  }

  .quiz-reset-btn {
    width: 100% !important;
  }
}
`;

export default KuisDragAndDrop;
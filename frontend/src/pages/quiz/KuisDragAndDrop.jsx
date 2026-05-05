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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function getNodeType(item) {
  const type = String(item?.node_type || "").toLowerCase();
  const text = String(item?.text || "").toLowerCase();

  if (type === "start" || text.includes("start") || text.includes("mulai")) return "start";
  if (type === "end" || text.includes("end") || text.includes("selesai")) return "end";

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
    minWidth: 170,
    minHeight: 76,
    padding: "14px 18px",
    background: "#fff",
    borderWidth: 2.5,
    borderStyle: "solid",
    borderColor: "#f59e0b",
    color: "#0f172a",
    fontWeight: 900,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 16px 30px rgba(15,23,42,0.12)",
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
          width: 145,
          height: 145,
          minWidth: 145,
          minHeight: 145,
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
          maxWidth: 104,
          lineHeight: 1.25,
        }
      : type === "input"
      ? { transform: "skew(12deg)", display: "block" }
      : { display: "block" };

  return (
    <div style={{ position: "relative" }}>
      {type !== "start" && (
        <Handle type="target" position={Position.Top} style={handleStyle} />
      )}

      <div style={shape}>
        <span style={textFix}>
          <small style={nodeTypeStyle}>{label}</small>
          <b>{data?.label}</b>
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
        <Handle
          type="source"
          id="out"
          position={Position.Bottom}
          style={handleStyle}
        />
      ) : null}
    </div>
  );
}

const nodeTypes = { flowNode: FlowNode };

function KuisDragAndDrop({ data, items = [], onCorrectChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) =>
        Number(a.correct_order) - Number(b.correct_order) ||
        Number(a.id) - Number(b.id)
    );
  }, [items]);

  const buildAutoLayout = useCallback(() => {
    const decisionIndex = sortedItems.findIndex(
      (item) => getNodeType(item) === "decision"
    );

    return sortedItems.map((item, index) => {
      let x = 420;
      let y = 70 + index * 145;

      if (decisionIndex !== -1 && index > decisionIndex) {
        const after = index - decisionIndex;

        if (after === 1) {
          x = 210;
          y = 130 + decisionIndex * 145;
        } else if (after === 2) {
          x = 640;
          y = 130 + decisionIndex * 145;
        } else {
          x = 420;
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

      const nodeIds = sortedItems.map((item) => String(item.id));
      const startNode = sortedItems.find((item) => getNodeType(item) === "start");
      const endNode = sortedItems.find((item) => getNodeType(item) === "end");

      const allNonStartHaveInput = sortedItems
        .filter((item) => getNodeType(item) !== "start")
        .every((item) =>
          currentEdges.some((edge) => edge.target === String(item.id))
        );

      const allNonEndHaveOutput = sortedItems
        .filter((item) => getNodeType(item) !== "end")
        .every((item) => {
          const outgoing = currentEdges.filter(
            (edge) => edge.source === String(item.id)
          );

          if (getNodeType(item) === "decision") {
            const hasYes = outgoing.some((edge) => edge.sourceHandle === "yes");
            const hasNo = outgoing.some((edge) => edge.sourceHandle === "no");
            return hasYes && hasNo;
          }

          return outgoing.length >= 1;
        });

      const noSelfLoop = currentEdges.every((edge) => edge.source !== edge.target);

      const allEdgesValid = currentEdges.every(
        (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
      );

      const enoughEdges = currentEdges.length >= sortedItems.length - 1;

      const correct =
        Boolean(startNode) &&
        Boolean(endNode) &&
        enoughEdges &&
        allNonStartHaveInput &&
        allNonEndHaveOutput &&
        noSelfLoop &&
        allEdgesValid;

      setIsCorrect(correct);
      onCorrectChange?.(correct);
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
            id: `edge-${params.source}-${params.sourceHandle || "out"}-${
              params.target
            }-${Date.now()}`,
            type: "smoothstep",
            animated: true,
            label,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#6366f1",
            },
            style: {
              strokeWidth: 3,
              stroke: params.sourceHandle === "no" ? "#ef4444" : "#6366f1",
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
        <div>
          <p style={eyebrowStyle}>Flowchart Canvas Challenge</p>
          <h3 style={questionStyle}>{data?.question}</h3>
          <p style={hintStyle}>
            Geser node agar rapi, lalu tarik panah dari titik kecil. Untuk
            percabangan, gunakan jalur <b>Ya</b> dan <b>Tidak</b>.
          </p>
        </div>

        <button type="button" onClick={resetCanvas} style={resetBtnStyle}>
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        >
          <Background gap={20} size={1.2} color="#c7d2fe" />
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
          : "Belum lengkap. Pastikan semua node terhubung dan decision punya panah Ya/Tidak 🧠"}
      </div>
    </div>
  );
}

const wrapperStyle = { padding: 24 };

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 18,
  marginBottom: 16,
  padding: 20,
  borderRadius: 24,
  background:
    "radial-gradient(circle at top right,rgba(99,102,241,.16),transparent 35%),linear-gradient(135deg,#ffffff,#f8fafc)",
  border: "1px solid #e2e8f0",
};

const eyebrowStyle = {
  margin: "0 0 7px",
  fontSize: 12,
  fontWeight: 900,
  color: "#6366f1",
  textTransform: "uppercase",
  letterSpacing: 1,
};

const questionStyle = {
  margin: "0 0 8px",
  color: "#0f172a",
  fontSize: 22,
  lineHeight: 1.4,
  fontWeight: 900,
};

const hintStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.7,
};

const resetBtnStyle = {
  border: "none",
  background: "linear-gradient(135deg,#111827,#020617)",
  color: "#FDE047",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(15,23,42,.16)",
  whiteSpace: "nowrap",
};

const legendStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 14,
  color: "#475569",
  fontSize: 12,
  fontWeight: 900,
};

const canvasOuterStyle = {
  width: "100%",
  height: 610,
  borderRadius: 28,
  border: "2px dashed #6366f1",
  overflow: "hidden",
  background:
    "radial-gradient(circle at top,#eef2ff,transparent 35%),linear-gradient(180deg,#ffffff,#f8fafc)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.7),0 18px 40px rgba(15,23,42,.08)",
};

const statusStyle = {
  marginTop: 14,
  padding: "15px 16px",
  borderRadius: 18,
  border: "1px solid",
  fontWeight: 900,
  textAlign: "center",
};

const emptyStyle = {
  marginTop: 16,
  padding: 18,
  borderRadius: 14,
  background: "#f8fafc",
  color: "#64748b",
  textAlign: "center",
  fontWeight: 700,
};

const handleStyle = {
  width: 13,
  height: 13,
  background: "#6366f1",
  border: "2px solid #fff",
  boxShadow: "0 0 0 3px rgba(99,102,241,.18)",
};

const nodeTypeStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 10,
  color: "#64748b",
  letterSpacing: ".8px",
  fontWeight: 900,
};

const yesLabelStyle = {
  position: "absolute",
  right: -40,
  top: "45%",
  fontSize: 11,
  fontWeight: 900,
  color: "#16a34a",
  background: "#dcfce7",
  padding: "3px 7px",
  borderRadius: 999,
};

const noLabelStyle = {
  position: "absolute",
  left: "38%",
  bottom: -32,
  fontSize: 11,
  fontWeight: 900,
  color: "#dc2626",
  background: "#fee2e2",
  padding: "3px 7px",
  borderRadius: 999,
};

const animationStyle = `
.react-flow__edge-path {
  stroke-linecap: round;
}

.react-flow__node {
  transition: filter .2s ease;
}

.react-flow__node:hover {
  filter: drop-shadow(0 18px 26px rgba(99,102,241,.18));
}

.react-flow__handle {
  cursor: crosshair;
}
`;

export default KuisDragAndDrop;
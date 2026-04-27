export default function DiscoveryLoading() {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}>
        <div style={{ width: 80, height: 28, borderRadius: 8, background: "#e7b98a60", animation: "pulse 1.5s infinite" }} />
        <div style={{ width: 64, height: 32, borderRadius: 12, background: "#e7b98a60", animation: "pulse 1.5s infinite" }} />
      </div>
      <div style={{ flex: 1, margin: "0 16px", borderRadius: 24, background: "#e7b98a30", animation: "pulse 1.5s infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 48 }}>🐾</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "16px 0 20px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e7b98a40", animation: "pulse 1.5s infinite" }} />
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#e7b98a40", animation: "pulse 1.5s infinite" }} />
      </div>
    </div>
  );
}

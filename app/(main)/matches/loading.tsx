export default function MatchesLoading() {
  return (
    <div style={{ background: "var(--cream)", minHeight: "100dvh" }}>
      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{ width: 80, height: 28, borderRadius: 8, background: "#e7b98a60" }} />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e7b98a40", flexShrink: 0, animation: "pulse 1.5s infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: 100, height: 14, borderRadius: 6, background: "#e7b98a40", marginBottom: 8, animation: "pulse 1.5s infinite" }} />
            <div style={{ width: "70%", height: 12, borderRadius: 6, background: "#e7b98a30", animation: "pulse 1.5s infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100dvh", gap: 12, background: "var(--cream)" }}>
      <span style={{ fontSize: 56 }}>🐾</span>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#2b1d18" }}>페이지를 찾을 수 없어요</div>
      <div style={{ fontSize: 13, color: "#8c7568" }}>주소를 확인하거나 홈으로 돌아가세요</div>
      <Link href="/discovery" style={{ marginTop: 8, padding: "12px 28px", borderRadius: 16, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
        홈으로
      </Link>
    </div>
  );
}

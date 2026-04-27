import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        background: "var(--cream)",
      }}
    >
      <main style={{ flex: 1, overflow: "hidden" }}>{children}</main>
      <BottomNav />
    </div>
  );
}

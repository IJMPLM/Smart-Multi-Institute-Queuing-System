import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f4" }}>
      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "3rem 2rem", maxWidth: 400, textAlign: "center" }}>
        <Lock size={48} style={{ color: "#e53e3e", marginBottom: "1rem" }} />
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#e53e3e" }}>Access Denied</h1>
        <p style={{ marginBottom: "1.5rem", color: "#444" }}>
          You are not authorized to view this page.<br />
          The server check failed or you do not have permission.
        </p>
        <a href="/" style={{ display: "inline-block", marginTop: "1rem", padding: "0.75rem 1.5rem", background: "#e53e3e", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 500 }}>
          Reload
        </a>
      </div>
    </main>
  );
}

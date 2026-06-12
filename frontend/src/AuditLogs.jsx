import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function AuditLogs() {
  const [logs, setLogs] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    axios.get("https://full-stack-login-app-34nv.onrender.com/audit-logs", { headers: { authorization: token } })
      .then(res => setLogs(res.data))
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      <nav style={{ background: "rgba(15,12,41,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 30px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "65px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #d4fc79, #96e6a1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📜</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>HRMS System</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}>AUDIT LOGS</div>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}>🏠 Dashboard</button>
      </nav>

      <div style={{ padding: "30px" }}>
        <h2 style={{ marginBottom: "25px" }}>📜 Audit Logs ({logs.length})</h2>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", overflow: "hidden" }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>📜</div>
              <h3>No audit logs yet</h3>
            </div>
          ) : logs.map((log, i) => (
            <div key={log.id} style={{ padding: "18px 25px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
                  {log.user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>{log.user_name}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{log.action}</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{new Date(log.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuditLogs

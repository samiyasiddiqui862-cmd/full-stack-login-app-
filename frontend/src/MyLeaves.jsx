import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function MyLeaves() {
  const [leaves, setLeaves] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    axios.get("http://localhost:5000/my-leaves", { headers: { authorization: token } })
      .then(res => setLeaves(res.data))
  }, [])

  const getStatusColor = (status) => {
    if (status === "Approved") return "#43e97b"
    if (status === "Rejected") return "#ff6b6b"
    return "#ffd43b"
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      <nav style={{ background: "rgba(15,12,41,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 30px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "65px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #43e97b, #38f9d7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📅</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>HRMS System</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}>MY LEAVES</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/leave-apply")} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>📝 Apply Leave</button>
          <button onClick={() => navigate("/dashboard")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "8px 20px", borderRadius: "20px", cursor: "pointer" }}>🏠 Dashboard</button>
        </div>
      </nav>

      <div style={{ padding: "30px" }}>
        <h2 style={{ marginBottom: "25px" }}>📅 My Leave Applications ({leaves.length})</h2>
        {leaves.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.05)", borderRadius: "20px" }}>
            <div style={{ fontSize: "60px", marginBottom: "15px" }}>📅</div>
            <h3>No leave applications yet</h3>
            <button onClick={() => navigate("/leave-apply")} style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#333", border: "none", padding: "12px 25px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}>Apply for Leave</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {leaves.map(leave => (
              <div key={leave.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "25px", borderLeft: `4px solid ${getStatusColor(leave.status)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px", fontSize: "18px" }}>{leave.leave_type_name}</h3>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>📅 {leave.start_date?.slice(0, 10)} → {leave.end_date?.slice(0, 10)}</p>
                  </div>
                  <span style={{ background: `${getStatusColor(leave.status)}22`, border: `1px solid ${getStatusColor(leave.status)}`, color: getStatusColor(leave.status), padding: "5px 15px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>{leave.status}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 0 15px" }}>📝 {leave.reason}</p>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 15px", borderRadius: "8px", fontSize: "13px" }}>
                    Manager: <span style={{ color: getStatusColor(leave.manager_status), fontWeight: "bold" }}>{leave.manager_status}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 15px", borderRadius: "8px", fontSize: "13px" }}>
                    HR: <span style={{ color: getStatusColor(leave.hr_status), fontWeight: "bold" }}>{leave.hr_status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyLeaves
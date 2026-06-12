import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function AllLeaves() {
  const [leaves, setLeaves] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("userRole")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    if (role === "Employee") { navigate("/dashboard"); return }
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    const res = await axios.get("https://full-stack-login-app-34nv.onrender.com/all-leaves", { headers: { authorization: token } })
    setLeaves(res.data)
  }

  const handleManagerAction = async (id, status) => {
    await axios.put(`https://full-stack-login-app-34nv.onrender.com/leave-manager/${id}`, { status }, { headers: { authorization: token } })
    fetchLeaves()
  }

  const handleHRAction = async (id, status) => {
    await axios.put(`https://full-stack-login-app-34nv.onrender.com/leave-hr/${id}`, { status }, { headers: { authorization: token } })
    fetchLeaves()
  }

  const getStatusColor = (status) => {
    if (status === "Approved") return "#43e97b"
    if (status === "Rejected") return "#ff6b6b"
    return "#ffd43b"
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      <div style={{ width: "250px", background: "rgba(15,12,41,0.95)", borderRight: "1px solid rgba(255,255,255,0.08)", position: "fixed", height: "100vh", overflowY: "auto", zIndex: 100 }}>
        <div style={{ padding: "20px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏢</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>HRMS</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Management System</div>
          </div>
        </div>
        {[
          { icon: "🏠", label: "Dashboard", path: "/dashboard" },
          { icon: "👥", label: "Employees", path: "/employees" },
          { icon: "🏢", label: "Departments", path: "/departments" },
          { icon: "⚡", label: "Skills", path: "/skills" },
          { icon: "💼", label: "Assets", path: "/assets" },
          { icon: "📝", label: "Apply Leave", path: "/leave-apply" },
          { icon: "📅", label: "My Leaves", path: "/my-leaves" },
          { icon: "📋", label: "All Leaves", path: "/all-leaves" },
          { icon: "✅", label: "Attendance", path: "/attendance" },
          { icon: "📊", label: "Reports", path: "/reports" },
          { icon: "📜", label: "Audit Logs", path: "/audit-logs" },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", background: item.path === "/all-leaves" ? "rgba(102,126,234,0.2)" : "transparent", borderLeft: item.path === "/all-leaves" ? "3px solid #667eea" : "3px solid transparent" }}>
            <span>{item.icon}</span>
            <span style={{ fontSize: "13px" }}>{item.label}</span>
          </div>
        ))}
        <div onClick={() => { localStorage.clear(); navigate("/") }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", margin: "10px", borderRadius: "10px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)" }}>
          <span>🚪</span>
          <span style={{ fontSize: "13px", color: "#ff6b6b" }}>Logout</span>
        </div>
      </div>

      <div style={{ marginLeft: "250px", flex: 1, padding: "25px" }}>
        <h2 style={{ marginBottom: "25px" }}>📋 All Leave Applications ({leaves.length})</h2>
        <div style={{ display: "grid", gap: "15px" }}>
          {leaves.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.05)", borderRadius: "20px" }}>
              <div style={{ fontSize: "60px" }}>📋</div>
              <h3>No leave applications yet</h3>
            </div>
          ) : leaves.map(leave => (
            <div key={leave.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "25px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div>
                  <h3 style={{ margin: "0 0 5px" }}>{leave.employee_name}</h3>
                  <p style={{ margin: "0 0 3px", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{leave.leave_type_name}</p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>📅 {leave.start_date?.slice(0, 10)} → {leave.end_date?.slice(0, 10)}</p>
                </div>
                <span style={{ background: `${getStatusColor(leave.status)}22`, border: `1px solid ${getStatusColor(leave.status)}`, color: getStatusColor(leave.status), padding: "5px 15px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>{leave.status}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 0 20px" }}>📝 {leave.reason}</p>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", padding: "10px 15px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Manager:</span>
                  <button onClick={() => handleManagerAction(leave.id, "Approved")} style={{ background: "rgba(67,233,123,0.2)", border: "1px solid #43e97b", color: "#43e97b", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✓ Approve</button>
                  <button onClick={() => handleManagerAction(leave.id, "Rejected")} style={{ background: "rgba(255,107,107,0.2)", border: "1px solid #ff6b6b", color: "#ff6b6b", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✗ Reject</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", padding: "10px 15px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>HR:</span>
                  <button onClick={() => handleHRAction(leave.id, "Approved")} style={{ background: "rgba(67,233,123,0.2)", border: "1px solid #43e97b", color: "#43e97b", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✓ Approve</button>
                  <button onClick={() => handleHRAction(leave.id, "Rejected")} style={{ background: "rgba(255,107,107,0.2)", border: "1px solid #ff6b6b", color: "#ff6b6b", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✗ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllLeaves
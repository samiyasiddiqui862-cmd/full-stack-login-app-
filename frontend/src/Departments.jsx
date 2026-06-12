import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Departments() {
  const [departments, setDepartments] = useState([])
  const [name, setName] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("userRole")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    if (role === "Employee") { navigate("/dashboard"); return }
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    const res = await axios.get("https://full-stack-login-app-34nv.onrender.com/departments", { headers: { authorization: token } })
    setDepartments(res.data)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await axios.post("https://full-stack-login-app-34nv.onrender.com/departments", { name }, { headers: { authorization: token } })
      setName("")
      fetchDepartments()
    } catch (err) { alert("Error adding department") }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://full-stack-login-app-34nv.onrender.com/departments/${id}`, { headers: { authorization: token } })
      fetchDepartments()
    } catch (err) { alert("Error deleting") }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>
      {/* Sidebar */}
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
          <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", background: item.path === "/departments" ? "rgba(102,126,234,0.2)" : "transparent", borderLeft: item.path === "/departments" ? "3px solid #667eea" : "3px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = item.path === "/departments" ? "rgba(102,126,234,0.2)" : "transparent"}
          >
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
        <h2 style={{ marginBottom: "25px" }}>🏢 Manage Departments</h2>
        <form onSubmit={handleAdd} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "25px", marginBottom: "25px", display: "flex", gap: "15px" }}>
          <input type="text" placeholder="Enter department name..." value={name} onChange={(e) => setName(e.target.value)} required
            style={{ flex: 1, padding: "12px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", fontSize: "14px", outline: "none" }} />
          <button type="submit" style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>➕ Add</button>
        </form>
        <div style={{ display: "grid", gap: "12px" }}>
          {departments.map((d, i) => (
            <div key={d.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "15px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #f093fb, #f5576c)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{i + 1}</div>
                <span style={{ fontSize: "15px", fontWeight: "500" }}>{d.name}</span>
              </div>
              <button onClick={() => handleDelete(d.id)} style={{ background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.3)", color: "white", padding: "6px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>🗑️ Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Departments
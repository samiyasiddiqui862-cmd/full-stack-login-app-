import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState("table")
  const limit = 12
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("userRole")

  useEffect(() => {
    if (!token) { navigate("/"); return }
    fetchEmployees()
  }, [page, search])

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/employees?page=${page}&limit=${limit}&search=${search}`,
        { headers: { authorization: token } }
      )
      setEmployees(res.data.employees || res.data)
      setTotal(res.data.total || 0)
    } catch (err) { console.log(err) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return
    try {
      await axios.delete(`http://localhost:5000/employees/${id}`, { headers: { authorization: token } })
      fetchEmployees()
    } catch (err) { alert("Error deleting employee") }
  }

  const totalPages = Math.ceil(total / limit)

  const sidebarItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "👥", label: "Employees", path: "/employees" },
    { icon: "🏢", label: "Departments", path: "/departments" },
    { icon: "⚡", label: "Skills", path: "/skills" },
    { icon: "💼", label: "Assets", path: "/assets" },
    { icon: "💰", label: "Salary", path: "/salary" },
    { icon: "📝", label: "Apply Leave", path: "/leave-apply" },
    { icon: "📅", label: "My Leaves", path: "/my-leaves" },
    { icon: "📋", label: "All Leaves", path: "/all-leaves" },
    { icon: "✅", label: "Attendance", path: "/attendance" },
    { icon: "📊", label: "Reports", path: "/reports" },
    { icon: "📜", label: "Audit Logs", path: "/audit-logs" },
  ]

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
        <div style={{ padding: "10px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ background: role === "HR" ? "rgba(102,126,234,0.2)" : role === "Manager" ? "rgba(67,233,123,0.2)" : "rgba(250,112,154,0.2)", border: `1px solid ${role === "HR" ? "rgba(102,126,234,0.4)" : role === "Manager" ? "rgba(67,233,123,0.4)" : "rgba(250,112,154,0.4)"}`, borderRadius: "8px", padding: "6px 12px", textAlign: "center", fontSize: "12px", fontWeight: "bold", color: role === "HR" ? "#667eea" : role === "Manager" ? "#43e97b" : "#fa709a" }}>
            {role === "HR" ? "👔 HR" : role === "Manager" ? "🎯 Manager" : "👤 Employee"}
          </div>
        </div>
        {sidebarItems.map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", background: item.path === "/employees" ? "rgba(102,126,234,0.2)" : "transparent", borderLeft: item.path === "/employees" ? "3px solid #667eea" : "3px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = item.path === "/employees" ? "rgba(102,126,234,0.2)" : "transparent"}
          >
            <span style={{ fontSize: "16px" }}>{item.icon}</span>
            <span style={{ fontSize: "13px" }}>{item.label}</span>
          </div>
        ))}
        <div onClick={() => { localStorage.clear(); navigate("/") }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", cursor: "pointer", margin: "10px", borderRadius: "10px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)" }}>
          <span>🚪</span>
          <span style={{ fontSize: "13px", color: "#ff6b6b" }}>Logout</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: "250px", flex: 1, padding: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: "0 0 5px" }}>👥 All Employees</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>Total: {total} employees</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => setViewMode("table")} style={{ background: viewMode === "table" ? "linear-gradient(135deg, #667eea, #764ba2)" : "transparent", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>☰ Table</button>
              <button onClick={() => setViewMode("grid")} style={{ background: viewMode === "grid" ? "linear-gradient(135deg, #667eea, #764ba2)" : "transparent", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>⊞ Grid</button>
            </div>
            {(role === "HR" || role === "Manager") && (
              <button onClick={() => navigate("/employees/add")} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 22px", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>➕ Add Employee</button>
            )}
          </div>
        </div>

        <input type="text" placeholder="🔍 Search by name or email..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          style={{ width: "100%", padding: "12px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "20px" }}
        />

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "rgba(102,126,234,0.2)" }}>
                  <tr>
                    {["#", "Employee", "Email", "Phone", "Department", "Skills", "Actions"].map(h => (
                      <th key={h} style={{ padding: "14px 15px", textAlign: "left", fontSize: "11px", color: "rgba(255,255,255,0.7)", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No employees found</td></tr>
                  ) : employees.map((emp, i) => (
                    <tr key={emp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 15px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{(page - 1) * limit + i + 1}</td>
                      <td style={{ padding: "12px 15px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, hsl(${emp.id * 37 % 360}, 70%, 50%), hsl(${emp.id * 37 % 360 + 60}, 70%, 40%))`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", flexShrink: 0 }}>
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "500" }}>{emp.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 15px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{emp.email}</td>
                      <td style={{ padding: "12px 15px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{emp.phone || "-"}</td>
                      <td style={{ padding: "12px 15px" }}>
                        <span style={{ background: "rgba(102,126,234,0.2)", border: "1px solid rgba(102,126,234,0.3)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>{emp.department_name || "N/A"}</span>
                      </td>
                      <td style={{ padding: "12px 15px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                        {emp.skills?.filter(s => s).slice(0, 2).join(", ") || "None"}
                      </td>
                      <td style={{ padding: "12px 15px" }}>
                        {(role === "HR" || role === "Manager") ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => navigate(`/employees/edit/${emp.id}`)} style={{ background: "rgba(102,126,234,0.2)", border: "1px solid rgba(102,126,234,0.3)", color: "white", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✏️ Edit</button>
                            <button onClick={() => handleDelete(emp.id)} style={{ background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.3)", color: "white", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑️ Delete</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>👁️ View Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "15px", marginBottom: "20px" }}>
            {employees.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", gridColumn: "1/-1" }}>
                <div style={{ fontSize: "60px" }}>👥</div>
                <h3>No employees found</h3>
              </div>
            ) : employees.map(emp => (
              <div key={emp.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "18px", transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(102,126,234,0.4)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: `linear-gradient(135deg, hsl(${emp.id * 37 % 360}, 70%, 50%), hsl(${emp.id * 37 % 360 + 60}, 70%, 40%))`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px", flexShrink: 0 }}>
                    {emp.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{emp.name}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{emp.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                  <span style={{ background: "rgba(102,126,234,0.2)", border: "1px solid rgba(102,126,234,0.3)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>🏢 {emp.department_name || "N/A"}</span>
                </div>
                {(role === "HR" || role === "Manager") ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigate(`/employees/edit/${emp.id}`)} style={{ flex: 1, background: "rgba(102,126,234,0.15)", border: "1px solid rgba(102,126,234,0.3)", color: "white", padding: "7px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>✏️ Edit</button>
                    <button onClick={() => handleDelete(emp.id)} style={{ flex: 1, background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)", color: "white", padding: "7px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>🗑️ Delete</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", padding: "7px" }}>👁️ View Only</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: page === 1 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "white", padding: "8px 18px", borderRadius: "8px", cursor: page === 1 ? "not-allowed" : "pointer" }}>← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: page === p ? "linear-gradient(135deg, #667eea, #764ba2)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: page === p ? "bold" : "normal" }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: page === totalPages ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "white", padding: "8px 18px", borderRadius: "8px", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>Page {page} of {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeList
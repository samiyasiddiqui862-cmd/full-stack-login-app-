import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from "recharts"

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ employees: 0, departments: 0, skills: 0, leaves: 0, pending: 0, assets: 0, assigned_assets: 0, dept_stats: [] })
  const [salaryStats, setSalaryStats] = useState({})
  const name = localStorage.getItem("userName") || "User"
  const role = localStorage.getItem("userRole") || "Employee"
  const [time, setTime] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/"); return }
    fetchStats(token)
    fetchSalaryStats(token)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchStats = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/stats", { headers: { authorization: token } })
      setStats(res.data)
    } catch (err) { console.log(err) }
  }

  const fetchSalaryStats = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/salary/stats", { headers: { authorization: token } })
      setSalaryStats(res.data)
    } catch (err) { console.log(err) }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  const COLORS = ["#667eea", "#f093fb", "#4facfe", "#43e97b", "#fa709a", "#ffd43b", "#a18cd1", "#fbc2eb"]

  const allMenuItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard", roles: ["HR", "Manager", "Employee"] },
    { icon: "👥", label: "Employees", path: "/employees", roles: ["HR", "Manager", "Employee"] },
    { icon: "🏢", label: "Departments", path: "/departments", roles: ["HR", "Manager"] },
    { icon: "⚡", label: "Skills", path: "/skills", roles: ["HR", "Manager"] },
    { icon: "💼", label: "Assets", path: "/assets", roles: ["HR", "Manager"] },
    { icon: "💰", label: "Salary", path: "/salary", roles: ["HR", "Manager"] },
    { icon: "📝", label: "Apply Leave", path: "/leave-apply", roles: ["HR", "Manager", "Employee"] },
    { icon: "📅", label: "My Leaves", path: "/my-leaves", roles: ["HR", "Manager", "Employee"] },
    { icon: "📋", label: "All Leaves", path: "/all-leaves", roles: ["HR", "Manager"] },
    { icon: "✅", label: "Attendance", path: "/attendance", roles: ["HR", "Manager", "Employee"] },
    { icon: "📊", label: "Reports", path: "/reports", roles: ["HR", "Manager"] },
    { icon: "📜", label: "Audit Logs", path: "/audit-logs", roles: ["HR", "Manager"] },
  ]

  const menuItems = allMenuItems.filter(item => item.roles.includes(role))

  const cards = [
    { label: "Total Employees", value: stats.employees, icon: "👥", gradient: "linear-gradient(135deg, #667eea, #764ba2)", path: "/employees" },
    { label: "Departments", value: stats.departments, icon: "🏢", gradient: "linear-gradient(135deg, #f093fb, #f5576c)", path: "/departments" },
    { label: "Assets", value: stats.assets, icon: "💼", gradient: "linear-gradient(135deg, #4facfe, #00f2fe)", path: "/assets" },
    { label: "Leave Applications", value: stats.leaves, icon: "📋", gradient: "linear-gradient(135deg, #43e97b, #38f9d7)", path: "/my-leaves" },
    { label: "Pending Leaves", value: stats.pending, icon: "⏳", gradient: "linear-gradient(135deg, #fa709a, #fee140)", path: "/all-leaves" },
    { label: "Net Payroll", value: `₹${parseFloat(salaryStats.total_net || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: "💰", gradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)", path: "/salary" },
  ]

  const deptData = stats.dept_stats ? stats.dept_stats.map(d => ({ name: d.name, count: parseInt(d.count) })) : []

  const salaryChartData = [
    { name: "Basic", value: parseFloat(salaryStats.total_basic || 0) },
    { name: "PF", value: parseFloat(salaryStats.total_pf || 0) },
    { name: "ESI", value: parseFloat(salaryStats.total_esi || 0) },
    { name: "TDS", value: parseFloat(salaryStats.total_tds || 0) },
    { name: "Net", value: parseFloat(salaryStats.total_net || 0) },
  ]

  const leaveData = [
    { name: "Total", value: parseInt(stats.leaves || 0) },
    { name: "Pending", value: parseInt(stats.pending || 0) },
    { name: "Approved", value: parseInt(stats.leaves || 0) - parseInt(stats.pending || 0) },
  ]

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Segoe UI', sans-serif", color: "white" }}>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? "250px" : "70px", background: "rgba(15,12,41,0.95)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.08)", transition: "width 0.3s", display: "flex", flexDirection: "column", position: "fixed", height: "100vh", zIndex: 100, overflow: "hidden" }}>
        <div style={{ padding: "20px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🏢</div>
          {sidebarOpen && <div><div style={{ fontWeight: "bold", fontSize: "15px" }}>HRMS</div><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Management System</div></div>}
        </div>

        {sidebarOpen && (
          <div style={{ padding: "10px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ background: role === "HR" ? "rgba(102,126,234,0.2)" : role === "Manager" ? "rgba(67,233,123,0.2)" : "rgba(250,112,154,0.2)", border: `1px solid ${role === "HR" ? "rgba(102,126,234,0.4)" : role === "Manager" ? "rgba(67,233,123,0.4)" : "rgba(250,112,154,0.4)"}`, borderRadius: "8px", padding: "6px 12px", textAlign: "center", fontSize: "12px", fontWeight: "bold", color: role === "HR" ? "#667eea" : role === "Manager" ? "#43e97b" : "#fa709a" }}>
              {role === "HR" ? "👔 HR" : role === "Manager" ? "🎯 Manager" : "👤 Employee"}
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
          {menuItems.map((item, i) => (
            <div key={i} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 10px", borderRadius: "10px", cursor: "pointer", marginBottom: "4px", background: window.location.pathname === item.path ? "rgba(102,126,234,0.25)" : "transparent", borderLeft: window.location.pathname === item.path ? "3px solid #667eea" : "3px solid transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = window.location.pathname === item.path ? "rgba(102,126,234,0.25)" : "transparent"}
            >
              <span style={{ fontSize: "17px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: "13px", fontWeight: "500" }}>{item.label}</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 10px", borderRadius: "10px", cursor: "pointer", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)" }}>
            <span style={{ fontSize: "17px", flexShrink: 0 }}>🚪</span>
            {sidebarOpen && <span style={{ fontSize: "13px", color: "#ff6b6b", fontWeight: "500" }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: sidebarOpen ? "250px" : "70px", flex: 1, transition: "margin-left 0.3s" }}>

        {/* Navbar */}
        <div style={{ background: "rgba(15,12,41,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 25px", height: "65px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 99 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "35px", height: "35px", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>☰</button>
            <h2 style={{ margin: 0, fontSize: "18px" }}>Dashboard Overview</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{time.toLocaleDateString()}</div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#667eea" }}>{time.toLocaleTimeString()}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "8px 15px", borderRadius: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>{name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>{name}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{role}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "25px" }}>
          {/* Welcome */}
          <div style={{ background: "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))", border: "1px solid rgba(102,126,234,0.3)", borderRadius: "20px", padding: "25px 30px", marginBottom: "25px" }}>
            <h1 style={{ margin: "0 0 5px", fontSize: "24px" }}>👋 Welcome back, {name}!</h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Role: <strong style={{ color: "#667eea" }}>{role}</strong></p>
          </div>

          {/* Stats Cards */}
          <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase" }}>📊 Overview</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "18px", marginBottom: "25px" }}>
            {cards.map((card, i) => (
              <div key={i} onClick={() => navigate(card.path)} style={{ background: card.gradient, borderRadius: "18px", padding: "22px", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", transition: "all 0.3s", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ position: "absolute", top: "-15px", right: "-15px", fontSize: "70px", opacity: 0.15 }}>{card.icon}</div>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</div>
                <div style={{ fontSize: "26px", fontWeight: "800" }}>{card.value}</div>
                <div style={{ fontSize: "12px", marginTop: "5px", opacity: 0.9 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* 5 Charts */}
          <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase" }}>📈 Analytics</p>

          {/* Row 1 - 2 charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Chart 1 - Department Bar */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 15px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>👥 Employees by Department</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {deptData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2 - Dept Pie */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 15px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>🥧 Department Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deptData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {deptData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2 - 2 charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Chart 3 - Salary Bar */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 15px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>💰 Salary Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salaryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {salaryChartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 4 - Leave Pie */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 15px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>📅 Leave Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={leaveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                    {leaveData.map((entry, index) => <Cell key={index} fill={["#667eea", "#ffd43b", "#43e97b"][index]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5 - Area Chart */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px", marginBottom: "25px" }}>
            <h3 style={{ margin: "0 0 15px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>📊 Salary Components Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={salaryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#302b63", border: "none", borderRadius: "10px", color: "white" }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="value" stroke="#667eea" fill="rgba(102,126,234,0.3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 15px", fontSize: "15px" }}>⚡ Quick Actions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {menuItems.filter(m => m.path !== "/dashboard").map((item, i) => (
                <button key={i} onClick={() => navigate(item.path)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
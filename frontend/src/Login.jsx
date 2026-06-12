import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("Employee")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(pwd)) return "Must have at least one uppercase letter (A-Z)"
    if (!/[0-9]/.test(pwd)) return "Must have at least one number (0-9)"
    if (!/[!@#$%^&*]/.test(pwd)) return "Must have at least one special character (!@#$%^&*)"
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    if (!isLogin) {
      const pwdError = validatePassword(password)
      if (pwdError) { setError(pwdError); setLoading(false); return }
      if (password !== confirmPassword) { setError("Passwords do not match!"); setLoading(false); return }
    }
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/login", { email, password })
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("userName", res.data.name)
        localStorage.setItem("userRole", res.data.role)
        navigate("/dashboard")
      } else {
        await axios.post("http://localhost:5000/signup", { name, email, password, role })
        setSuccess("Account created successfully! Please login.")
        setIsLogin(true)
        setName(""); setEmail(""); setPassword(""); setConfirmPassword("")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const inputStyle = {
    width: "100%", padding: "12px 15px",
    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)", color: "white",
    fontSize: "14px", boxSizing: "border-box", outline: "none",
    marginBottom: "15px"
  }

  const TalentCoreLogo = () => (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 20px 40px rgba(102,126,234,0.6))" }}>
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea"/>
          <stop offset="100%" stopColor="#764ba2"/>
        </linearGradient>
        <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#bgGrad)"/>
      <rect width="120" height="120" rx="28" fill="url(#shineGrad)"/>
      <rect x="25" y="45" width="70" height="55" rx="4" fill="white" opacity="0.95"/>
      <rect x="25" y="45" width="70" height="10" rx="4" fill="white" opacity="0.7"/>
      <rect x="35" y="60" width="12" height="10" rx="2" fill="#667eea" opacity="0.8"/>
      <rect x="54" y="60" width="12" height="10" rx="2" fill="#667eea" opacity="0.8"/>
      <rect x="73" y="60" width="12" height="10" rx="2" fill="#667eea" opacity="0.8"/>
      <rect x="35" y="76" width="12" height="10" rx="2" fill="#764ba2" opacity="0.8"/>
      <rect x="54" y="76" width="12" height="10" rx="2" fill="#764ba2" opacity="0.8"/>
      <rect x="73" y="76" width="12" height="10" rx="2" fill="#764ba2" opacity="0.8"/>
      <rect x="51" y="85" width="18" height="15" rx="2" fill="#667eea" opacity="0.9"/>
      <polygon points="20,48 60,20 100,48" fill="white" opacity="0.9"/>
      <line x1="60" y1="20" x2="60" y2="10" stroke="white" strokeWidth="2"/>
      <polygon points="60,10 72,14 60,18" fill="#ffd43b"/>
      <circle cx="30" cy="30" r="2" fill="white" opacity="0.6"/>
      <circle cx="90" cy="25" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="100" cy="40" r="1" fill="white" opacity="0.4"/>
    </svg>
  )

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      display: "flex", fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Left Side - Branding */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "40px", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(102,126,234,0.15)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(118,75,162,0.15)", filter: "blur(60px)" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "500px" }}>
          {/* SVG Logo */}
          <div style={{ width: "120px", height: "120px", margin: "0 auto 25px" }}>
            <TalentCoreLogo />
          </div>

          <h1 style={{
            fontSize: "38px", fontWeight: "900", margin: "0 0 10px",
            background: "linear-gradient(135deg, #667eea, #a18cd1, #fbc2eb)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>TalentCore Pro</h1>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 40px" }}>Enterprise Management System</p>

          {/* Feature List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
            {[
              { icon: "👥", text: "Complete Employee Management" },
              { icon: "💰", text: "Payroll, TDS, ESI & PF Processing" },
              { icon: "📅", text: "Smart Leave Management System" },
              { icon: "💼", text: "Asset Tracking & Allocation" },
              { icon: "📊", text: "Advanced Analytics & Reports" },
              { icon: "🔐", text: "Role-Based Access Control" },
            ].map((feature, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "12px 18px",
                transition: "all 0.3s"
              }}>
                <span style={{ fontSize: "20px" }}>{feature.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "500" }}>{feature.text}</span>
              </div>
            ))}
          </div>

          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginTop: "30px" }}>
            Trusted by 500+ companies worldwide 🌐
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{
        width: "500px", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px",
        background: "rgba(15,12,41,0.7)", backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ width: "60px", height: "60px", margin: "0 auto 15px" }}>
              <TalentCoreLogo />
            </div>
            <h2 style={{ color: "white", margin: "0 0 8px", fontSize: "22px", fontWeight: "800" }}>
              {isLogin ? "Welcome Back! 👋" : "Create Account ✨"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: "13px" }}>
              {isLogin ? "Sign in to TalentCore Pro" : "Join TalentCore Pro today"}
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px", marginBottom: "25px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <button onClick={() => { setIsLogin(true); setError(""); setSuccess("") }} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", background: isLogin ? "linear-gradient(135deg, #667eea, #764ba2)" : "transparent", color: "white", boxShadow: isLogin ? "0 4px 15px rgba(102,126,234,0.4)" : "none" }}>🔑 Login</button>
            <button onClick={() => { setIsLogin(false); setError(""); setSuccess("") }} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", background: !isLogin ? "linear-gradient(135deg, #667eea, #764ba2)" : "transparent", color: "white", boxShadow: !isLogin ? "0 4px 15px rgba(102,126,234,0.4)" : "none" }}>✨ Sign Up</button>
          </div>

          {error && <div style={{ background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b", padding: "12px 15px", borderRadius: "10px", marginBottom: "15px", fontSize: "13px" }}>❌ {error}</div>}
          {success && <div style={{ background: "rgba(67,233,123,0.15)", border: "1px solid rgba(67,233,123,0.3)", color: "#43e97b", padding: "12px 15px", borderRadius: "10px", marginBottom: "15px", fontSize: "13px" }}>✅ {success}</div>}

          {!isLogin && (
            <div style={{ background: "rgba(102,126,234,0.1)", border: "1px solid rgba(102,126,234,0.2)", borderRadius: "10px", padding: "12px 15px", marginBottom: "15px" }}>
              <p style={{ margin: "0 0 8px", fontWeight: "bold", color: "#667eea", fontSize: "12px" }}>🔐 Password Requirements:</p>
              {["Minimum 8 characters", "At least one uppercase letter (A-Z)", "At least one number (0-9)", "At least one special character (!@#$%^&*)"].map((rule, i) => (
                <p key={i} style={{ margin: "3px 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>• {rule}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input type="text" placeholder="👤 Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="Employee" style={{ background: "#302b63" }}>👤 Employee</option>
                  <option value="HR" style={{ background: "#302b63" }}>👔 HR Manager</option>
                  <option value="Manager" style={{ background: "#302b63" }}>🎯 Department Manager</option>
                </select>
              </>
            )}

            <input type="email" placeholder="📧 Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

            <div style={{ position: "relative", marginBottom: "15px" }}>
              <input type={showPassword ? "text" : "password"} placeholder="🔒 Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{ ...inputStyle, marginBottom: 0, paddingRight: "50px" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {!isLogin && (
              <div style={{ position: "relative", marginBottom: "15px" }}>
                <input type={showConfirm ? "text" : "password"} placeholder="🔒 Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  style={{ ...inputStyle, marginBottom: 0, paddingRight: "50px" }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px",
              background: loading ? "rgba(102,126,234,0.5)" : "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white", border: "none", borderRadius: "12px",
              fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 25px rgba(102,126,234,0.4)", marginTop: "5px"
            }}>
              {loading ? "⏳ Please wait..." : isLogin ? "🚀 Login to TalentCore Pro" : "✨ Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "20px" }}>
            © 2026 TalentCore Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
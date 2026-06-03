import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div>
      <h2>Welcome to Dashboard!</h2>
      <p>You are logged in successfully.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard

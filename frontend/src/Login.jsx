import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      })
      localStorage.setItem("token", res.data.token)
      alert("Login successful!")
      navigate("/dashboard")
    } catch (err) {
      console.log(err)
      alert("Login failed")
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
      <button type="submit">Login</button>
      <p>Don't have an account? <a href="/signup">Signup</a></p>
    </form>
  )
}

export default Login

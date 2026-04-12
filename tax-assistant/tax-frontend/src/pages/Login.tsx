 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/tax.png";
import "./Login.css";
import ReCAPTCHA from "react-google-recaptcha";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!captcha) {
      setError("Please verify the captcha");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ---
        credentials: "include", 
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          captcha: captcha
        })
      });

       const data = await response.json();

console.log("Login Success Response:", data);  // 👈 DEBUG

if (response.ok && data.message === "Login Successful") {
  console.log("Navigating to dashboard...");  // 👈 add this also

  const userRole = data.role ? data.role.toLowerCase() : "user";
  localStorage.setItem("userRole", userRole);
  localStorage.setItem("isAuth","true");

  navigate("/dashboard", { state: { role: userRole } }); 
} else {
  setError(data.message || "Invalid email or password.");
}

    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Hello, Welcome!</h2>
          <img src={loginImage} alt="Login" className="left-image" />
          <button onClick={() => navigate("/register")} className="outline-btn">Register</button>
        </div>
        <div className="auth-right">
          <h2>Login</h2>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(value: string | null) => setCaptcha(value)}
          />
          {error && <p className="error">{error}</p>}
          <button className="main-btn" onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
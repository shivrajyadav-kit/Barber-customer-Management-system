import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { useState } from "react";
import api from "../components/utils/api.js";

function Register() {
    const[username, setUsername] = useState();
    const[email, setEmail] = useState();
    const[password, setPassword] = useState();
    const [error, setError] = useState("");
    const[phone, setPhone]= useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    
    const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    // if (password !== confirmPassword) {
    //         setError("Passwords do not match");
    //         return;
    //     }

    try {
      setLoading(true);
        console.log(api);
      const response = await api.post("/v1/signup", {
        username,
        email,
        phone,
        password,
      });

      console.log("Register successful:", response.data);

      navigate("/");
    } catch (err) {
      console.error("Register failed:", err);

      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
    return (
        <main className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <div className="register-logo">
                        CUT & STYLE
                    </div>
                    <p className="register-label">
                        JOIN US
                    </p>
                    <h1>Create Account</h1>
                    <p>
                        Create an account to book your appointments.
                    </p>
                </div>
                <form className="register-form" onSubmit={handleRegister}>
                    <div className="register-field">
                        <label htmlFor="name">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={username}
                            onChange={(e)=>setUsername(e.target.value)}
                        />
                    </div>
                    <div className="register-field">
                        <label htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="register-field">
                        <label htmlFor="phone">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="register-field">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Craete a Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="register-field">
                        <label htmlFor="password">
                            Confirm Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Craete your Password"
                            
                        />
                    </div>
                    <button
                        type="submit"
                        
                        className="register-submit"
                    >
                        Register
                    </button>
                </form>
                <div className="login-link">
                    <span>Already have an account?</span>
                    <Link to="/login">
                    SignIn
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default Register;
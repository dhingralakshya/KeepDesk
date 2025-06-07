import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import styles from "./login.module.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      togglePasswordVisibility();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store the JWT token in localStorage if login is successful
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setErrorMessage(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setErrorMessage(
        err.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.section}>
        <form onSubmit={handleSubmit}>
          <div className={styles.loginDetails}>
            <h3>Login</h3>
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            
            <div className={styles.emailInput}>
              <label htmlFor="email" className={styles.label}>
                Email
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </label>
            </div>
            
            <div className={styles.passwordInput}>
              <label htmlFor="password" className={styles.label}>
                Password
                <div className={styles.passwordContainer}>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.password}`}
                    placeholder="Enter your password"
                    required
                  />
                  <span
                    className={styles.eye_icon}
                    onClick={togglePasswordVisibility}
                    onKeyDown={handleKeyDown}
                    role="button"
                    tabIndex="0"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? (
                      <VisibilityOffOutlinedIcon className={styles.icon} />
                    ) : (
                      <VisibilityOutlinedIcon className={styles.icon} />
                    )}
                  </span>
                </div>
              </label>
              <Link className={styles.forgot} to="/forgot">
                Forgot Password?
              </Link>
            </div>
            
            <div className={styles.signIn}>
              <button
                type="submit"
                className={styles.signInButton}
              >
                Sign In
              </button>
            </div>
          </div>
        </form>
        
        <div className={styles.account}>
          <Link to="/register">Don&apos;t have an account?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
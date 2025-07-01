import React from "react";
import { useNavigate, Link } from "react-router-dom";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import styles from "./register.module.css";

function Register() {
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [serverError, setServerError] = React.useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const navigate = useNavigate();

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      togglePasswordVisibility();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    // Basic validation to check if required fields are filled
    const validationErrors = {};

    if (!name) validationErrors.name = "Name is required.";
    if (!email) validationErrors.email = "Email is required.";
    if (!phoneNumber) validationErrors.phoneNumber = "Phone number is required.";
    if (!password) {
      validationErrors.password = "Password is required.";
    } else {
      // Password Validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
      if (!passwordRegex.test(password)) {
        validationErrors.password = "Password must be 8-16 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character.";
      }
    }

    // If there are validation errors, set the error state and return early
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const userData = {
      name,
      email,
      phone: phoneNumber,
      password,
    };

    try {
      // Sending POST request to the backend
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/"); 
    } catch (error) {
      console.error("Error:", error);
      setServerError(error.message);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.section}>
        <form onSubmit={handleSubmit}>
          <div className={styles.loginDetails}>
            <h3>Sign-up</h3>
            {serverError && (
              <p className={styles.serverError}>{serverError}</p>
            )}
            <div className={styles.emailInput}>
              <label htmlFor="name" className={styles.label}>
                Name
                <input
                  type="text"
                  id="name"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </label>
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>
            
            <div className={styles.emailInput}>
              <label htmlFor="email" className={styles.label}>
                Email
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </label>
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>
            
            <div className={styles.passwordInput}>
              <label htmlFor="password" className={styles.label}>
                Password
                <div className={styles.passwordContainer}>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    className={`${styles.input} ${styles.password}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
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
              {errors.password && <p className={styles.error}>{errors.password}</p>}
            </div>
            
            <div className={styles.emailInput}>
              <label htmlFor="phone" className={styles.label}>
                Phone Number
                <PhoneInput
                  country="in"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  inputClass={styles.input}
                  containerClass={styles.phoneContainer}
                  inputProps={{
                    id: "phone",
                    name: "phone",
                    required: true,
                  }}
                />
              </label>
              {errors.phoneNumber && <p className={styles.error}>{errors.phoneNumber}</p>}
            </div>
            
            <div className={styles.signIn}>
              <button type="submit" className={styles.signInButton}>
                Register
              </button>
            </div>
          </div>
        </form>
        <div className={styles.account}>
          <Link to="/login">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
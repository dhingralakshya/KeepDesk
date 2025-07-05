import React, { useEffect, useState } from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Header() {
  const [name, setName] = useState(null);
  const navigate = useNavigate();
  const apiUrl = window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL;

  const { token, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    let user = null;
    setName(null);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        user = decoded;
        if (decoded.exp * 1000 > Date.now()) {
          fetch(`${apiUrl}/user/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => {
              if (!res.ok) throw new Error("User not found");
              return res.json();
            })
            .then((data) => setName(data.name))
            .catch(() => setName(null));
        }
      } catch {
        setName(null);
      }
    }
  }, [token, apiUrl]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      <div className="nav">
        <div>
          <h1>
            <HighlightIcon />
            KeepDesk
          </h1>
        </div>
        <div className="right-nav">
          <div className="userDetails">
            {isAuthenticated && name}
          </div>
          <div className="logout">
            {isAuthenticated ? (
              <button onClick={handleLogout} type="button">
                <PowerSettingsNewIcon sx={{ fontSize: 35 }} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                type="button"
                style={{ fontSize: 20, padding: 5 }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

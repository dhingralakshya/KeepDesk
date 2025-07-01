import React from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function Header() {

  const navigate = useNavigate();
  const apiUrl = window._env_ && window._env_.REACT_APP_API_URL;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [name,setName] =React.useState(null);
  React.useEffect(() => {
    let user=null;
    const token = localStorage.getItem("token");
    if(token){
      try{
        const decoded = jwtDecode(token);
        user = decoded;
        fetch(`${apiUrl}/user/${user._id}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if(!res.ok) throw new Error("User not found");
          return res.json();
        })
        .then((data) =>{
          setName(data.name);
        })
        .catch((err) => {
          setName(null);
        })
      } catch (e) {
        user = null;
      }
    }
  },[]);
  
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
            {name}
          </div>
          <div className="logout">
            <button onClick={handleLogout} type="button"><PowerSettingsNewIcon sx={{ fontSize: 35 }} /></button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

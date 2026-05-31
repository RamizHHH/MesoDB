import "./NavBar.css";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/`);
  };

  const handleAuthClick = () => {
    navigate(`/login`);
  };

  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  return (
    <>
      <nav className="nav">
        <img
          src="/MesoDB_Favicon.png"
          alt="MesoDB Logo"
          className="logo"
          onClick={handleClick}
        />
        <p id="mesodb_button" onClick={handleClick}>
          MesoDB
        </p>
        <p id="login_button" onClick={handleAuthClick}>
          Login
        </p>
        <p id="profile_button" onClick={handleProfileClick}>
          Profile
        </p>
      </nav>
    </>
  );
}

export default NavBar;

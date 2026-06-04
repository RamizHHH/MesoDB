import "./NavBar.css";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/`);
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
      </nav>
    </>
  );
}

export default NavBar;

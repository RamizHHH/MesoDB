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
        <p id="mesodb_button" onClick={handleClick}>
          MesoDB
        </p>
      </nav>
    </>
  );
}

export default NavBar;

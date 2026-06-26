import "./RandomButton.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function RandomButton() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRandomClick() {
    const API = import.meta.env.VITE_API_URL;
    setIsLoading(true);

    try {
      const response = await fetch(`${API}/getRandomCreature`);
      const data = await response.json();
      const randomCreature = data.message;

      if (!randomCreature) {
        throw new Error("No random creature returned from the backend.");
      }

      navigate(`/creature/${encodeURIComponent(randomCreature.Name)}`, {
        preventScrollReset: true,
      });
    } catch (error) {
      console.error("Error fetching random creature:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <div className="random-button-container">
        <button
          className="random-button"
          onClick={handleRandomClick}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Random"}
        </button>
      </div>
    </>
  );
}

export default RandomButton;

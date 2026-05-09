import "./Home.css";
import SearchBar from "../Components/SearchBar/SearchBar";
import { useState } from "react";

function Home() {
  const [period, setPeriod] = useState("");
  const [activeButton, setActiveButton] = useState("");

  return (
    <>
      <div className="title_subtitle">
        <h1 id="title">MesoDB</h1>
        <div className="subtitle_container">
          <p id="subtitle">
            Explore dinosaurs, marine reptiles, pterosaurs, and early mammals
            from the Triassic, Jurassic, and Cretaceous periods.
          </p>
        </div>
      </div>
      <div className="search_bar_div">
        <SearchBar />
      </div>
      <div className="featured_dinos">
        <div className="featured_title">
          <h2 id="featured_h2">Featured</h2>
        </div>
        <div className="period_buttons">
          <button
            id="Period_button2"
            onClick={() => setActiveButton("All")}
            style={{
              backgroundColor:
                activeButton === "All"
                  ? "hsl(170, 46%, 30%)"
                  : "hsl(170, 46%, 59%)",
            }}
          >
            All
          </button>
          <button
            id="Period_button"
            onClick={() => setActiveButton("Triassic")}
            style={{
              backgroundColor:
                activeButton === "Triassic"
                  ? "hsl(170, 46%, 30%)"
                  : "hsl(170, 46%, 59%)",
            }}
          >
            Triassic
          </button>
          <button
            id="Period_button"
            onClick={() => setActiveButton("Jurassic")}
            style={{
              backgroundColor:
                activeButton === "Jurassic"
                  ? "hsl(170, 46%, 30%)"
                  : "hsl(170, 46%, 59%)",
            }}
          >
            Jurassic
          </button>
          <button
            id="Period_button"
            onClick={() => setActiveButton("Cretaceous")}
            style={{
              backgroundColor:
                activeButton === "Cretaceous"
                  ? "hsl(170, 46%, 30%)"
                  : "hsl(170, 46%, 59%)",
            }}
          >
            Cretaceous
          </button>
        </div>
      </div>
    </>
  );
}
export default Home;

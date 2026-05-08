import { useState, type FormEvent } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [searchItem, setSearchItem] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchItem === "") {
      return;
    } else {
      setSearchItem(String(searchItem).trim());
      navigate(`/creature/${encodeURIComponent(searchItem)}`);
    }
  };

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
        <form className="search_form" onSubmit={handleSearch}>
          <input
            id="search_bar"
            placeholder="T.rex, Triceratops, Velociraptor"
            value={searchItem}
            onChange={(event) => setSearchItem(event.target.value)}
          ></input>
          <button id="search_button" type="submit">
            Search
          </button>
        </form>
      </div>
    </>
  );
}
export default Home;

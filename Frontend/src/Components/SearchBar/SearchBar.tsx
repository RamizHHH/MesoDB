import "./SearchBar.css";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type Creature = {
  id: string;
  Name: string;
  Scientific_Name: string;
  Era: string;
  Period: string;
  Diet: string;
  Length: string;
  Weight: string;
  Image_URL: string;
  Summary: string;
};

function SearchBar() {
  const [results, setResults] = useState<Creature[]>([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    const response = await fetch(
      `${API}/getCreature?query=${encodeURIComponent(value ?? "")}`,
    );

    const data = await response.json();

    setResults(data.message ?? []);
  }

  function handleResultClick(creatureName: string) {
    navigate(`/creature/${encodeURIComponent(creatureName)}`);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    navigate(`/creature/${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <>
      <div className="search_container">
        <form className="search_form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="T. Rex Triceratops Velociraptor"
          />
          <button type="submit">Search</button>
        </form>

        <div className="dropdown">
          {results.map((dino) => (
            <div key={dino.id} className="dropdown_item">
              <button
                type="button"
                onClick={() => handleResultClick(dino.Name)}
              >
                {dino.Name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SearchBar;

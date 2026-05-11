import "./Featured.css";
import { useState, useEffect, useMemo } from "react";

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

type CreatureResponse = {
  message?: Creature[];
};

function Featured() {
  const [activeButton, setActiveButton] = useState("");
  const [data, setData] = useState<Creature[]>([]);
  const API = import.meta.env.VITE_API_URL;
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch(`${API}/getCreature?query=`)
      .then((response) => response.json())
      .then((data: CreatureResponse) => {
        setData(data.message ?? []);
      })
      .catch((error) => {
        console.error("Error fetching creature data:", error);
        setData([]);
      });
  }, [API]);

  const featuredCreatures = useMemo(() => {
    if (!data.length) return [];

    const count = Math.min(3, data.length);
    const indexes = new Set<number>();
    let seed = today
      .split("")
      .reduce((total, char) => total + char.charCodeAt(0), 0);

    while (indexes.size < count) {
      seed = (seed * 9301 + 49297) % 233280;
      indexes.add(seed % data.length);
    }

    return Array.from(indexes).map((index) => data[index]);
  }, [data, today]);

  return (
    <>
      <section className="featured_dinos">
        <div className="featured_title">
          <h2 id="featured_h2">Featured</h2>
        </div>

        <div className="period_buttons">
          <button
            className="period_button"
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
            className="period_button"
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
            className="period_button"
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
            className="period_button"
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

        <div className="Featured_cards">
          {activeButton === "All"
            ? featuredCreatures.map((creature) => (
                <article className="card_id" key={creature.id}>
                  <h3 className="featured_creature_name">{creature.Name}</h3>
                  <p className="featured_creature_period">{creature.Period}</p>
                </article>
              ))
            : ""}
          {activeButton === "Triassic"
            ? featuredCreatures
                .filter((creature) => creature.Period === "Triassic")
                .map((creature) => (
                  <article className="card_id" key={creature.id}>
                    <h3 className="featured_creature_name">{creature.Name}</h3>
                    <p className="featured_creature_period">
                      {creature.Period}
                    </p>
                  </article>
                ))
            : ""}
          {activeButton === "Jurassic"
            ? featuredCreatures
                .filter((creature) => creature.Period === "Jurassic")
                .map((creature) => (
                  <article className="card_id" key={creature.id}>
                    <h3 className="featured_creature_name">{creature.Name}</h3>
                    <p className="featured_creature_period">
                      {creature.Period}
                    </p>
                  </article>
                ))
            : ""}
          {activeButton === "Cretaceous"
            ? featuredCreatures
                .filter((creature) => creature.Period === "Cretaceous")
                .map((creature) => (
                  <article className="card_id" key={creature.id}>
                    <h3 className="featured_creature_name">{creature.Name}</h3>
                    <p className="featured_creature_period">
                      {creature.Period}
                    </p>
                  </article>
                ))
            : ""}
        </div>
      </section>
    </>
  );
}

export default Featured;

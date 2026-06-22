import "./Related.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Creature = {
  id: string;
  Name: string;
  Scientific_Name?: string | null;
  Era?: string | null;
  Period?: string | null;
  Diet?: string | null;
  Length?: string | null;
  Weight?: string | null;
  Image_URL?: string | null;
  Summary?: string | null;
  Family?: string | null;
};

function Related({
  family,
  creatureName,
  currentCreature,
}: {
  family: string;
  creatureName: string;
  currentCreature?: Creature;
}) {
  const creatureFamily = family;
  const name = creatureName;

  const [relatedDinos, setRelatedDinos] = useState<Creature[]>([]);

  const API = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `${API}/RelatedDinos?family=${encodeURIComponent(creatureFamily)}&creatureName=${encodeURIComponent(name)}`,
    )
      .then((response) => response.json())
      .then((data) => {
        setRelatedDinos(data.message ?? []);
      })
      .catch((error) => {
        console.error("Error fetching related dinos:", error);
        setRelatedDinos([]);
      });
  }, [API, creatureFamily, name]);

  function handleResultClick(creatureName: string) {
    navigate(`/creature/${encodeURIComponent(creatureName)}`, {
      state: { previousCreature: currentCreature ?? null },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="related_dinos">
        <h2 id="related_dinos_h2">Related Dinos</h2>

        <div className="related_dinos_container">
          <div className="related_dino_list">
            {relatedDinos.length > 0
              ? relatedDinos.map((dino) => (
                <div
                  key={dino.id}
                  className="related_dino_card"
                  onClick={() => handleResultClick(dino.Name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleResultClick(dino.Name);
                    }
                  }}
                >
                  <h3 id="dino_name_h3">{dino.Name}</h3>
                  <p id="dino_family_p">{dino.Family}</p>
                </div>
                ))
              : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default Related;

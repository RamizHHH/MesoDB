import "./Related.css";
import { useEffect, useState } from "react";
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
  Family: string;
};

function Related({
  family,
  creatureName,
}: {
  family: string;
  creatureName: string;
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
    navigate(`/creature/${encodeURIComponent(creatureName)}`);
  }

  return (
    <>
      <div className="related_dinos">
        <h2 id="related_dinos_h2">Related Dinos</h2>

        <div className="related_dinos_container">
          <div className="related_dino_list">
            {relatedDinos.length > 0
              ? relatedDinos.map((dino) => (
                  <div key={dino.id} className="related_dino_card">
                    <h3
                      id="dino_name_h3"
                      onClick={() => handleResultClick(dino.Name)}
                    >
                      {dino.Name}
                    </h3>
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

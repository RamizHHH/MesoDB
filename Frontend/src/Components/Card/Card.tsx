import { useNavigate, useParams } from "react-router-dom";
import "./Card.css";
import { useEffect, useState } from "react";

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

function Card() {
  const { creatureName } = useParams<{ creatureName: string }>();
  const [data, setData] = useState<Creature[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const creature = data[0];
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(
      `http://localhost:8000/getCreature?query=${encodeURIComponent(
        creatureName ?? "",
      )}`,
    )
      .then((response) => response.json())
      .then((data: CreatureResponse) => {
        setData(data.message ?? []);
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("Error fetching creature data:", error);
        setErrorMessage(
          "Could not load this creature. Check that the backend is running.",
        );
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [creatureName]);

  useEffect(() => {
    if (
      !loading &&
      creature &&
      creature.Name &&
      creature.Name !== creatureName
    ) {
      navigate(`/creature/${encodeURIComponent(creature.Name)}`, {
        replace: true,
      });
    }
  }, [loading, creature, creatureName, navigate]);

  if (loading) {
    return (
      <>
        <div className="loading_div">
          <p id="loading_p">Loading creature...</p>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!creature) {
    return (
      <>
        <div className="No_creature_div">
          <p id="no_creature_p">No Creature Found :(</p>
        </div>
      </>
    );
  }

  if (
    creature.Name &&
    !creature.Diet &&
    !creature.Era &&
    !creature.Image_URL &&
    !creature.Length &&
    !creature.Period &&
    !creature.Scientific_Name &&
    !creature.Weight
  ) {
    return (
      <>
        <div className="No_creature_div">
          <p id="no_creature_p">Creature Coming Soon ;)</p>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="creature-info">
        <div className="creature-image">
          <img
            id="creature_img"
            src={creature.Image_URL}
            alt={creature.Name}
          ></img>
        </div>
        <div className="creature-details">
          <h1 id="creature_title">{creature.Name}</h1>
          <h2 id="creature_sci_name">{creature.Scientific_Name}</h2>
          <div className="creature-stats-grid">
            <div className="era_div">
              <p id="era_p">Era: {creature.Era}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Period: {creature.Period}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Diet: {creature.Diet}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Length: {creature.Length}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Length: {creature.Weight}</p>
            </div>
          </div>
          <div className="summary_div">
            <h3 id="summary_h3">Summary</h3>
            <p id="summary_p">{creature.Summary}</p>
          </div>
        </div>
      </div>
      <p id="image_disc">
        All Images Used Are Not My Own and Are Property of Their Respective
        Owners
      </p>
    </>
  );
}

export default Card;

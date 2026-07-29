import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Card.css";
import { useEffect, useState } from "react";
import Related from "../Related/Related";
import RandomButton from "../RandomButton/RandomButton";

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
  Family?: string | null;
};

type CreatureResponse = {
  message?: Creature[];
};

function Card() {
  const { creatureName } = useParams<{ creatureName: string }>();
  const location = useLocation();
  const initialCreature = (
    location.state as { previousCreature?: Creature | null } | null
  )?.previousCreature;
  const initialCreatureName = initialCreature?.Name ?? "";
  const [data, setData] = useState<Creature[]>([]);
  const [AIData, setAIData] = useState<string>("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(!initialCreature);
  const [hasFetchedCurrentCreature, setHasFetchedCurrentCreature] =
    useState(false);
  const creature = data[0];
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!initialCreature) {
      setLoading(true);
    }
    setAIData("");
    setIsAILoading(false);
    setHasFetchedCurrentCreature(false);
    fetch(`${API}/getCreature?query=${encodeURIComponent(creatureName ?? "")}`)
      .then((response) => response.json())
      .then((data: CreatureResponse) => {
        setData(data.message ?? []);
        setErrorMessage("");
        setHasFetchedCurrentCreature(true);
      })
      .catch((error) => {
        console.error("Error fetching creature data:", error);
        setErrorMessage(
          "Could not load this creature. Check that the backend is running.",
        );
        setData([]);
        setHasFetchedCurrentCreature(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API, creatureName, initialCreature]);

  useEffect(() => {
    if (initialCreature && !data.length) {
      setData([initialCreature]);
    }
  }, [initialCreature, data.length]);

  useEffect(() => {
    if (creatureName) {
      setAIData("");
      setIsAILoading(false);
    }
  }, [creatureName]);

  useEffect(() => {
    const shouldRedirect =
      hasFetchedCurrentCreature &&
      !loading &&
      creature &&
      creature.Name &&
      creature.Name !== creatureName &&
      creature.Name !== initialCreatureName;

    if (shouldRedirect) {
      navigate(`/creature/${encodeURIComponent(creature.Name)}`, {
        replace: true,
      });
    }
  }, [
    loading,
    creature,
    creatureName,
    navigate,
    hasFetchedCurrentCreature,
    initialCreatureName,
  ]);

  async function handleAISummary() {
    setAIData("");
    setIsAILoading(true);

    try {
      const response = await fetch(
        `${API}/AISummary?query=${encodeURIComponent(
          creature.Name ?? creatureName ?? "",
        )}`,
      );

      if (!response.ok) {
        setAIData("Could not fetch AI summary. Try again later.");
        return;
      }

      const data = await response.json();
      setAIData(data.message ?? "Could not fetch AI summary. Try again later.");
    } catch (error) {
      console.error("Error fetching AI summary:", error);
      setAIData("Could not fetch AI summary. Try again later.");
    } finally {
      setIsAILoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <div className="creature-info">
          <div className="creature-image">
            <div className="skeleton_block skeleton_image"></div>
          </div>
          <div className="creature-details">
            <div className="skeleton_block skeleton_title"></div>
            <div className="skeleton_block skeleton_subtitle"></div>
            <div className="creature-stats-grid">
              <div className="era_div skeleton_stat">
                <div className="skeleton_block skeleton_stat_text"></div>
              </div>
              <div className="era_div skeleton_stat">
                <div className="skeleton_block skeleton_stat_text"></div>
              </div>
              <div className="era_div skeleton_stat">
                <div className="skeleton_block skeleton_stat_text"></div>
              </div>
              <div className="era_div skeleton_stat">
                <div className="skeleton_block skeleton_stat_text"></div>
              </div>
              <div className="era_div skeleton_stat">
                <div className="skeleton_block skeleton_stat_text"></div>
              </div>
            </div>
            <div className="summary_div skeleton_summary">
              <div className="skeleton_block skeleton_summary_heading"></div>
              <div className="skeleton_block skeleton_summary_line"></div>
              <div className="skeleton_block skeleton_summary_line"></div>
              <div className="skeleton_block skeleton_summary_line short"></div>
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
          {creature.Image_URL ? (
            <img
              id="creature_img"
              src={creature.Image_URL}
              alt={creature.Name}
            ></img>
          ) : (
            <p>No image available</p>
          )}
        </div>
        <div className="creature-details">
          <h1 id="creature_title">{creature.Name}</h1>
          <h2 id="creature_sci_name">
            {creature.Scientific_Name ?? "Scientific name unavailable"}
          </h2>
          <div className="creature-stats-grid">
            <div className="era_div">
              <p id="era_p">Era: {creature.Era ?? "Unknown"}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Period: {creature.Period ?? "Unknown"}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Diet: {creature.Diet ?? "Unknown"}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Length: {creature.Length ?? "Unknown"}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Weight: {creature.Weight ?? "Unknown"}</p>
            </div>
            <div className="era_div">
              <p id="era_p">Family: {creature.Family ?? "Unknown"}</p>
            </div>
          </div>
          {/* <div className="summary_div">
            <h3 id="summary_h3">Summary</h3>
            <p id="summary_p">{creature.Summary ?? "Summary unavailable."}</p>
          </div> */}
        </div>
      </div>

      <div className="ai_tools_grid">
        <div className="ai_summary_div">
          <button
            id="ai_summary_button"
            onClick={handleAISummary}
            disabled={isAILoading}
          >
            {isAILoading ? "Generating..." : "Generate Larger AI Summary"}
          </button>
          {AIData !== "" || isAILoading ? (
            <>
              <div className="ai_summary_result">
                <p id="ai_summary_placeholder">
                  {isAILoading ? "Generating summary..." : AIData}
                </p>
              </div>
            </>
          ) : (
            <div className="ai_summary_result ai_summary_empty">
              <p id="ai_summary_placeholder">
                Generate a larger AI summary to see more details here.
              </p>
            </div>
          )}
        </div>
        <Related
          family={creature.Family ?? ""}
          creatureName={creature.Name ?? ""}
          currentCreature={creature}
        />
      </div>
      <div className="RandomDino">
        <RandomButton />
      </div>
      <p id="image_disc">
        All Images Used Are Not My Own and Are Property of Their Respective
        Owners
      </p>
    </>
  );
}

export default Card;

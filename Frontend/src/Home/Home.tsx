import "./Home.css";
import SearchBar from "../Components/SearchBar/SearchBar";
import Featured from "../Components/Featured/Featured";
import RandomButton from "../Components/RandomButton/RandomButton";

function Home() {
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
      <div className="featured_div">
        <Featured />
      </div>
      <div className="random_button_div">
        <RandomButton />
      </div>
    </>
  );
}
export default Home;

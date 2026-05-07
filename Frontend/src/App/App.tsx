import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../Home/Home";
import Card from "../Card/Card";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/creature/:creatureName" element={<Card />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

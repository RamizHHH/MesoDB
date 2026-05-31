import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { saveAuthFromUrl } from "../Auth/Auth";
import Home from "../Home/Home";
import NavBar from "../Components/Navbar/NavBar";
import Card from "../Components/Card/Card";
import Login from "../Components/Login/Login";
import Profile from "../Components/Profile/Profile";

function App() {
  useEffect(() => {
    saveAuthFromUrl();
  }, []);

  return (
    <>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/creature/:creatureName" element={<Card />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}

export default App;

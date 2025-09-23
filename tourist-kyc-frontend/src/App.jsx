import React from "react";
import { Routes, Route, Router } from "react-router-dom";
import TouristKYCHomepage from "./pages/Home";
import TouristKYCPortal from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/home" element={<TouristKYCHomepage/>} />
      <Route path="/register" element={<TouristKYCPortal />} />
    </Routes>
  );
}

export default App;

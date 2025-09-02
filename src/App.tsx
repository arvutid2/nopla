import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Play from "./pages/Play";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/play" element={<Play />} />
    </Routes>
  );
}
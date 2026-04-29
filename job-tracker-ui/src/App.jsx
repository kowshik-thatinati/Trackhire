import { useState } from "react";
import "./index.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function getInitialView() {
  return localStorage.getItem("token") ? "dashboard" : "login";
}

export default function App() {
  const [view, setView] = useState(getInitialView);

  return (
    <>
      {/* Animated background — always visible */}
      <div className="animated-bg" />
      <div className="blob-extra blob-extra-1" />
      <div className="blob-extra blob-extra-2" />

      {view === "login" && (
        <Login
          onLogin={() => setView("dashboard")}
          onSwitch={() => setView("register")}
        />
      )}
      {view === "register" && (
        <Register onSwitch={() => setView("login")} />
      )}
      {view === "dashboard" && (
        <Dashboard onLogout={() => setView("login")} />
      )}
    </>
  );
}

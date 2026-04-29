import { useState, useEffect } from "react";
import "./index.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function getInitialView() {
  const token = localStorage.getItem("token");
  return token ? "dashboard" : "home";
}

export default function App() {
  const [view, setView] = useState(getInitialView);

  // Sync view if token is removed/added elsewhere (optional but good)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && view === "dashboard") {
      setView("home");
    } else if (token && view !== "dashboard") {
      setView("dashboard");
    }
  }, [view]);

  return (
    <>
      {/* Animated background — always visible */}
      <div className="animated-bg" />
      <div className="blob-extra blob-extra-1" />
      <div className="blob-extra blob-extra-2" />

      {view === "home" && (
        <Home
          onLogin={() => setView("login")}
          onRegister={() => setView("register")}
        />
      )}

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
        <Dashboard onLogout={() => setView("home")} />
      )}
    </>
  );
}

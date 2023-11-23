import React, { type ReactElement } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";
import { Host } from "./pages/host";
import { Player } from "./pages/player";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "./components/error";

function App(): ReactElement {
  return (
    <ErrorBoundary fallbackRender={Error}>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Home} />
          <Route path="/host" Component={Host} />
          <Route path="/player" Component={Player} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Welcome from "./Welcome";
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "./Theme/Theme";

function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>

  );
}

export default App

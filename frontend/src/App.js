/**
 *
 * Functional Requirements: FR1-12
 *
 */

import "./App.css";
import { LoginPage } from "./Pages/LoginPage";
import { HomePage } from "./Pages/HomePage";
import { ChangePasswordPage } from "./Pages/ChangePasswordPage";
import { Route, Routes } from "react-router-dom";
import { RequestAccountPage } from "./Pages/RequestAccountPage";
import { HyperparameterAdjustmentPage } from "./Pages/HyperparameterAdjustmentPage";
import { ProfilePage } from "./Pages/ProfilePage";
import { VisualizationPage } from "./Pages/VisualizationPage";
import { AnalogyTestPage } from "./Pages/AnalogyTestPage";
import { ClosestWordsPage } from "./Pages/ClosestWordsPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route exact path="/changePassword" element={<ChangePasswordPage />} />
        <Route exact path="/home" element={<HomePage />} />
        <Route exact path="/requestAccount" element={<RequestAccountPage />} />
        <Route
          path="/trainSettings"
          element={<HyperparameterAdjustmentPage />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/visualize" element={<VisualizationPage />} />
        <Route path="/analogyTest" element={<AnalogyTestPage />} />
        <Route path="/closestWords" element={<ClosestWordsPage />} />
      </Routes>
    </div>
  );
}

export default App;

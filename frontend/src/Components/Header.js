/**
 *
 * Provides a way to access the home page and profile page
 *
 * Functional Requirements: No functional requirements mandate the inclusion of this file
 *
 */

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export const Header = ({ showProfileIcon }) => {
  const navigate = useNavigate();

  const openProfilePage = () => {
    navigate("/profile");
  };

  const routeHome = () => {
    navigate("/home");
  };

  return (
    <div className="dms-header flex-row-sb">
      <p id="header" className="dms-header-title" onClick={routeHome}>
        Data Mining System
      </p>
      {showProfileIcon && (
        <FontAwesomeIcon
          id="profile-icon"
          icon={faUserCircle}
          size="2x"
          className="dms-icon"
          onClick={openProfilePage}
        />
      )}
    </div>
  );
};

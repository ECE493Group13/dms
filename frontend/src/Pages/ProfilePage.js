/**
 *
 * Functional Requirements: FR3, 4
 *
 */

import React from "react";
import { Button } from "../Components/Button";
import { Header } from "../Components/Header";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../constants";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const onRequestLogout = () => {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then(() => {
        sessionStorage.clear();
        navigate("/");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const onRequestChangePassword = () => {
    navigate("/changePassword");
  };

  return (
    <div>
      <Header showProfileIcon />
      <div className="logout-button">
        <Button buttonText={"Log out"} onClick={onRequestLogout} />
      </div>
      <div className="change-password-button">
        <Button
          buttonText={"Change Password"}
          onClick={onRequestChangePassword}
        />
      </div>
    </div>
  );
};

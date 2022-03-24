import React, { useEffect } from "react";
import { Button } from "../Components/Button";
import { Header } from "../Components/Header";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../constants";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (token === null) {
      navigate("/");
    }
  }, []);

  const onRequestLogout = () => {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }
      sessionStorage.clear();
      navigate("/");
    });
  };

  return (
    <div>
      <Header showProfileIcon />
      <div className="logout-button">
        <Button buttonText={"Logout"} onClick={onRequestLogout} />
      </div>
    </div>
  );
};

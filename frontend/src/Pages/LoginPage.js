/**
 *
 * Functional Requirements: FR2
 *
 */

import React, { useState } from "react";
import { DoubleInputFormCard } from "../Components/DoubleInputFormCard";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../constants";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const onInputChange = (username, password) => {
    setUsername(username);
    setPassword(password);
  };

  const onLogin = () => {
    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            setErrorMessage("Incorrect username or password.");
          } else {
            setErrorMessage(
              "There was an error processing this request. Please try again later."
            );
          }
          return;
        }

        return response.json();
      })
      .then((json) => {
        if (!json) return;
        if (json && json.token) {
          sessionStorage.setItem("token", `Bearer ${json.token}`);
        }

        if (json && json.is_temp_password) {
          navigate("/changePassword");
        } else {
          navigate("/home");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const requestAccount = () => {
    navigate("/requestAccount");
  };

  return (
    <div className="dark-background">
      <div className="login-form-card-margin-top">
        <DoubleInputFormCard
          onInputChange={onInputChange}
          title="Data Mining System"
          placeholder1="Username"
          placeholder2="Password"
          buttonText="Log in"
          onSubmit={onLogin}
          input1Type="text"
          input2Type="password"
          errorMessage={errorMessage}
        />
        <p
          id="requestAcctButton"
          onClick={requestAccount}
          className="request-account-button"
        >
          No account? Get started here
        </p>
      </div>
    </div>
  );
};

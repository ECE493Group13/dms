/**
 *
 * Functional Requirements: FR5
 *
 */

import React, { useState } from "react";
import { API_BASE_URL } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export const KeywordBar = () => {
  const [input, setInput] = useState("");

  const navigate = useNavigate();

  const onSubmitKeywords = (e) => {
    if (input === "") return;

    e.preventDefault();
    const keywords = input.toLowerCase().split(/\s+/);

    const token = sessionStorage.getItem("token");
    fetch(`${API_BASE_URL}/filter-task`, {
      method: "POST",
      body: JSON.stringify({
        keywords,
      }),
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (response.status === 401) {
          alert("Your session has expired, Please sign in again.");
          navigate("/");
          return;
        }
        return response.json();
      })
      .then((json) => {
        if (json.is_error) {
          console.log(
            "There was an error fetching the dataset with the keywords: ",
            keywords
          );
        }
        window.location.reload(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <form onSubmit={onSubmitKeywords}>
      <div className="flex-row-sb">
        <input
          type="text"
          placeholder="Space separated keywords..."
          className="dms-keyword-bar"
          value={input}
          onInput={(e) => setInput(e.target.value)}
        />
        <button className="keyword-submit-button" onClick={onSubmitKeywords}>
          <FontAwesomeIcon icon={faPlus} size="lg" color="white" />
        </button>
      </div>
    </form>
  );
};

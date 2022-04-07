import React, { useState, useEffect } from "react";
import { Header } from "../Components/Header";
import { Button } from "../Components/Button";
import { LoadingIndicator } from "../Components/LoadingIndicator";
import { API_BASE_URL } from "../constants";
import { useNavigate, useLocation } from "react-router-dom";

export const ClosestWordsPage = () => {
  const [word, setWord] = useState("");
  const [fetchStarted, setFetchStarted] = useState(false);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [closestWords, setClosestWords] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [trainedModelId, setTrainedModelId] = useState();
  const [numWords, setNumWords] = useState(100);

  const navigate = useNavigate();
  const route = useLocation();

  useEffect(() => {
    if (!route || !route.state || !route.state.trainedModelId) {
      navigate("/home");
      return;
    }
    setTrainedModelId(route.state.trainedModelId);
  }, []);

  const getClosestWordProximities = () => {
    if (!isFormValid()) return;
    const token = sessionStorage.getItem("token");

    setFetchStarted(true);
    fetch(
      `${API_BASE_URL}/verify/most-similar?word=${word}&count=${numWords}&trained_model_id=${trainedModelId}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    )
      .then((response) => {
        setFetchComplete(true);
        if (response.status === 401) {
          alert("Your session has expired, Please sign in again.");
          navigate("/");
          return;
        }
        return response.json();
      })
      .then((json) => {
        setClosestWords(json);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const startAnalogyTest = (wordB) => {
    navigate("/analogyTest", {
      state: {
        word_a: word,
        word_b: wordB,
        trained_model_id: trainedModelId,
      },
    });
  };

  const isFormValid = () => {
    if (word === "") {
      setErrorMessage("Please enter a word");
      return false;
    } else if (numWords < 0 || !/^\d+$/.test(numWords)) {
      setErrorMessage("Please enter a positive number");
      return false;
    } else {
      setErrorMessage("");
      return true;
    }
  };

  return (
    <div>
      <Header showProfileIcon />
      <p className="dms-page-title">Closest Words</p>
      <p className="dms-double-input-form-subtitle">
        Enter a word below to receive the n most similar words to it
      </p>
      <div className="analogy-test-form-container">
        <form onSubmit={getClosestWordProximities} id="analogy-test-form">
          <div className="flex-row-sb">
            <input
              id="closest-word-input"
              type="text"
              placeholder="Word"
              className="dms-text-input"
              required
              autoComplete="true"
              value={word}
              onInput={(e) => setWord(e.target.value)}
            />
            <input
              id="num-closest-word-input"
              type="number"
              placeholder="n"
              className="dms-text-input"
              required
              autoComplete="true"
              value={numWords}
              onInput={(e) => setNumWords(e.target.value)}
            />
          </div>
          <p className="error-message">{errorMessage}</p>
          <div className="dms-double-input-form-button">
            <Button
              id="submitButton"
              buttonText="Submit"
              onClick={getClosestWordProximities}
            ></Button>
          </div>
        </form>
      </div>
      <div>
        {fetchStarted && !fetchComplete && (
          <LoadingIndicator style={{ marginTop: "65px" }} />
        )}
        <table className="closest-words-table">
          <tbody>
            {closestWords.length > 0 && (
              <tr>
                <th>Word</th>
                <th>Proximity</th>
              </tr>
            )}
            {closestWords.map((wordProximity, index) => {
              return (
                <tr
                  onClick={() => startAnalogyTest(wordProximity.word)}
                  key={index}
                >
                  <td>{wordProximity.word}</td>
                  <td>{wordProximity.proximity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

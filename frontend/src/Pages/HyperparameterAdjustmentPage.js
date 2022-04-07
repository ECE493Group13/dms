/**
 *
 * Functional Requirements: FR7, 8
 *
 */

import React, { useState, useEffect } from "react";
import { Button } from "../Components/Button";
import { Header } from "../Components/Header";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../constants";

export const HyperparameterAdjustmentPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [datasetId, setDatasetId] = useState();
  const [hyperparamSuggestions, setHyperparamSuggestions] = useState({});

  const navigate = useNavigate();
  const route = useLocation();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!route || !route.state || !route.state.datasetId) {
      navigate("/home");
      return;
    }
    setDatasetId(route.state.datasetId);

    getHyperParameterSuggestions();
  }, []);

  const getHyperParameterSuggestions = () => {
    const token = sessionStorage.getItem("token");

    fetch(`${API_BASE_URL}/train-task/suggest-hparams`, {
      method: "GET",
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
        if (!json) return;
        setHyperparamSuggestions(json);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const onSubmit = () => {
    const hyperparamInputs =
      document.getElementById("hyperparam-form").elements;

    const hyperparameters = {
      embedding_size: parseInt(hyperparamInputs.item(0).value),
      epochs_to_train: parseInt(hyperparamInputs.item(1).value),
      learning_rate: parseFloat(hyperparamInputs.item(2).value),
      num_neg_samples: parseInt(hyperparamInputs.item(3).value),
      batch_size: parseInt(hyperparamInputs.item(4).value),
      concurrent_steps: parseInt(hyperparamInputs.item(5).value),
      window_size: parseInt(hyperparamInputs.item(6).value),
      min_count: parseInt(hyperparamInputs.item(7).value),
      subsample: parseFloat(hyperparamInputs.item(8).value),
    };

    postTrainTask(hyperparameters);
  };

  const postTrainTask = (hyperparameters) => {
    fetch(`${API_BASE_URL}/train-task`, {
      method: "POST",
      body: JSON.stringify({
        dataset_id: datasetId,
        hparams: hyperparameters,
      }),
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 422) {
            setErrorMessage("Please complete all fields.");
          } else if (response.statues === 401) {
            if (response.status === 401) {
              alert("Your session has expired, Please sign in again.");
              navigate("/");
              return;
            }
          } else {
            setErrorMessage(
              "There was an error processing this request. Please try again later"
            );
          }
          throw new Error("HTTP status " + response.status);
        }

        return response.json();
      })
      .then((json) => {
        console.log(json);
        navigate(`/home`);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const formInputs = [
    {
      label: "Embedding Size:",
      name: "embedding_size",
      type: "number",
      default_value: hyperparamSuggestions.embedding_size,
    },
    {
      label: "Epochs to Train:",
      name: "epochs_to_train",
      type: "number",
      default_value: hyperparamSuggestions.epochs_to_train,
    },
    {
      label: "Learning Rate:",
      name: "learning_rate",
      type: "number",
      default_value: hyperparamSuggestions.learning_rate,
    },
    {
      label: "Num Neg Samples:",
      name: "num_neg_samples",
      type: "number",
      default_value: hyperparamSuggestions.num_neg_samples,
    },
    {
      label: "Batch Size:",
      name: "batch_size",
      type: "number",
      default_value: hyperparamSuggestions.batch_size,
    },
    {
      label: "Concurrent Steps:",
      name: "concurrent_steps",
      type: "number",
      default_value: hyperparamSuggestions.concurrent_steps,
    },
    {
      label: "Window Size:",
      name: "window_size",
      type: "number",
      default_value: hyperparamSuggestions.window_size,
    },
    {
      label: "Min Count:",
      name: "min_count",
      type: "number",
      default_value: hyperparamSuggestions.min_count,
    },
    {
      label: "Sub Sample:",
      name: "subsample",
      type: "number",
      default_value: hyperparamSuggestions.subsample,
    },
  ];

  return (
    <div>
      <Header showProfileIcon />
      <h2 className="adjust-hyperparameters-text">
        Adjust Word2Vec Hyperparameters
      </h2>
      <form
        className="flex-column hyperparameter-form"
        onSubmit={onSubmit}
        id="hyperparam-form"
      >
        {formInputs.map((input, id) => {
          return (
            <label
              key={id}
              htmlFor={input.name}
              className="flex-row-sb hyperparameter-form-row"
            >
              <p>{input.label}</p>
              <input
                className="dms-number-input"
                type={input.type}
                name={input.name}
                required
                placeholder={input.default_value}
              ></input>
            </label>
          );
        })}
        <div className="hyperparameter-form-button">
          <Button
            id="submitHyperparametersButton"
            buttonText="Train Model"
            onClick={(e) => onSubmit(e)}
          ></Button>
        </div>
        <p className="error-message">{errorMessage}</p>
      </form>
    </div>
  );
};

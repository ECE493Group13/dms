/**
 *
 * Functional Requirements: FR9
 *
 */

import React, { useState, useEffect } from "react";
import { ModelListItem } from "../ModelListItem";
import { LoadingIndicator } from "../LoadingIndicator";
import { API_BASE_URL } from "../../constants";
import { useNavigate } from "react-router-dom";

export const ModelsTab = () => {
  const [models, setModels] = useState([]);
  const [fetchComplete, setFetchComplete] = useState(false);
  const token = sessionStorage.getItem("token");
  let timeouts = [];

  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();

    return () => {
      timeouts.forEach((timeout) => {
        clearInterval(timeout);
      });
    };
  }, []);

  const fetchModels = () => {
    fetch(`${API_BASE_URL}/train-task`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        setFetchComplete(true);
        if (response.status === 401) {
          alert("Your session has expired, Please signin again.");
          navigate("/");
          return;
        }
        return response.json();
      })
      .then((json) => {
        if (!json) return;
        const incompleteModelTasks = json.filter(
          (modelTask) => !modelTask.is_complete
        );
        incompleteModelTasks.forEach((modelTask) => {
          timeouts[modelTask.id] = setInterval(fetchModel, 60000, modelTask.id);
        });
        setModels(
          json
            .sort(function (a, b) {
              return (
                new Date(a.created).getTime() - new Date(b.created).getTime()
              );
            })
            .reverse() // Want to view newest first
        );
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const fetchModel = (modelId) => {
    fetch(`${API_BASE_URL}/train-task/${modelId}`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (response.status === 401) {
          alert("Your session has expired, Please signin again.");
          navigate("/");
          return;
        }
        return response.json();
      })
      .then((json) => {
        if (json.is_complete) {
          clearInterval(timeouts[modelId]);
          fetchModels();
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className="second-tab">
      {fetchComplete &&
        models.map((model) => {
          return (
            <ModelListItem
              key={model.id}
              trainedModelId={model.model_id}
              trainTaskId={model.id}
              title={model.dataset.name}
              numPapers={model.dataset.num_papers}
              hyperparameters={JSON.parse(model.hparams)}
              startTime={model.start_time}
              endTime={model.end_time}
              showLoadingIndicator={
                !model.is_complete && model.start_time !== null
              }
              disableButtons={!model.is_complete}
              isError={model.is_error}
            />
          );
        })}
      {fetchComplete && models.length === 0 && (
        <p className="center-text">
          You have no models. Train your datasets to generate a new model.
        </p>
      )}
      {/* Show loading indicator until fetch is complete */}
      {!fetchComplete && <LoadingIndicator style={{ marginTop: "65px" }} />}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { DatasetListItem } from "../DatasetListItem";
import { API_BASE_URL } from "../../constants";
import { useNavigate } from "react-router-dom";
import { LoadingIndicator } from "../LoadingIndicator";

export const capitalizeFirstLetters = (title) => {
  return title
    .toLowerCase()
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.substring(1))
    .join(" ");
};

export const DatasetTab = () => {
  const [datasets, setDatasets] = useState([]);
  const [fetchComplete, setFetchComplete] = useState(false);
  const token = sessionStorage.getItem("token");
  let timeouts = [];

  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();

    return () => {
      timeouts.forEach((timeout) => {
        clearInterval(timeout);
      });
    };
  }, []);

  const fetchDataset = (datasetId) => {
    fetch(`${API_BASE_URL}/filter-task/${datasetId}`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    })
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
        if (json.is_complete) {
          clearInterval(timeouts[datasetId]);
          fetchDatasets();
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const fetchDatasets = () => {
    fetch(`${API_BASE_URL}/filter-task`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-type": "application/json; charset=UTF-8",
      },
    })
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
        if (!json) return;
        const incompleteDatasets = json.filter(
          (dataset) => !dataset.is_complete
        );
        incompleteDatasets.forEach((dataset) => {
          timeouts[dataset.id] = setInterval(fetchDataset, 10000, dataset.id);
        });
        setDatasets(
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

  return (
    <div className="first-tab">
      {fetchComplete &&
        datasets.map((dataset) => {
          return (
            <DatasetListItem
              key={dataset.id}
              datasetId={dataset.dataset_id}
              title={capitalizeFirstLetters(dataset.keywords)}
              numPapers={dataset.dataset?.num_papers}
              date={dataset.created.split("T")[0]}
              showLoadingIndicator={!dataset.is_complete}
              isError={dataset.is_error}
            />
          );
        })}
      {/* Fetch is complete but there are no results */}
      {fetchComplete && datasets.length === 0 && (
        <p className="center-text">
          You have no datasets. Enter keywords into the input above to generate
          a new dataset.
        </p>
      )}
      {/* Show loading indicator until fetch is complete */}
      {!fetchComplete && <LoadingIndicator style={{ marginTop: "65px" }} />}
    </div>
  );
};

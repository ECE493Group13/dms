/**
 *
 * Functional Requirements: FR9
 *
 */

import React from "react";
import { Button } from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasksAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetters } from "../Components/Tabs/DatasetTab";

export const ModelListItem = ({
  title,
  numPapers,
  startTime,
  endTime,
  trainedModelId,
  trainTaskId,
  isError,
  hyperparameters,
  showLoadingIndicator,
  disableButtons,
}) => {
  const navigate = useNavigate();

  const openVisualization = () => {
    navigate("/visualize", { state: { trainTaskId } });
  };

  const openClosestWordForm = () => {
    navigate("/closestWords", { state: { trainedModelId } });
  };

  const getFormattedTime = (time) => {
    if (time === null) return " - ";
    return new Date(time).toLocaleString();
  };

  const getNumPapersSubtitle = () => {
    if (numPapers === undefined) return;
    if (numPapers === 0)
      return <p className="num-papers-text error-message">Empty dataset</p>;
    return <p className="num-papers-text">({numPapers} Papers)</p>;
  };

  return (
    <div className="list-item flex-row-sb">
      <div className="list-item-text flex-row-sb">
        <div className="tooltip">
          <FontAwesomeIcon
            icon={faTasksAlt}
            size="xl"
            className="model-list-item-icon"
          />
          <span className="tooltip-content">
            <p>Embedding Size: {hyperparameters.embedding_size}</p>
            <p>Epochs to Train: {hyperparameters.epochs_to_train}</p>
            <p>Learning Rate: {hyperparameters.learning_rate}</p>
            <p>Num Neg Sample: {hyperparameters.num_neg_samples}</p>
            <p>Batch Size: {hyperparameters.batch_size}</p>
            <p>Concurrent Steps: {hyperparameters.concurrent_steps}</p>
            <p>Window Size: {hyperparameters.window_size}</p>
            <p>Min Count: {hyperparameters.min_count}</p>
            <p>Sub Sample: {hyperparameters.subsample}</p>
          </span>
        </div>
        <div className="flex-column">
          <p className="grey-text model-date">
            Started: {getFormattedTime(startTime)}
          </p>
          {isError ? (
            <p className="red-text model-date">
              Failed: {getFormattedTime(endTime)}
            </p>
          ) : (
            <p className="grey-text model-date">
              Ended: {getFormattedTime(endTime)}
            </p>
          )}
        </div>
        <p>{capitalizeFirstLetters(title)}</p>
        {getNumPapersSubtitle()}
      </div>
      <div className="list-item-text flex-row-sb">
        {showLoadingIndicator && (
          <div className="list-item-text flex-row-sb">
            <div className="dms-loading-indicator"></div>
            <p>Training...</p>
          </div>
        )}
        <Button
          buttonText={"Validate"}
          disabled={isError || disableButtons}
          onClick={openClosestWordForm}
        />
        <Button
          buttonText={"Visualize"}
          disabled={isError || disableButtons}
          onClick={openVisualization}
        />
      </div>
    </div>
  );
};

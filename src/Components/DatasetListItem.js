import React from "react";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

export const DatasetListItem = ({
  datasetId,
  title,
  numPapers,
  date,
  showLoadingIndicator,
}) => {
  const navigate = useNavigate();

  const openHyperparameterAdjustmentForm = () => {
    navigate("/trainSettings", { state: { datasetId } });
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
        <p className="grey-text">{date}</p>
        <p>{title}</p>
        {getNumPapersSubtitle()}
      </div>
      <div className="list-item-text flex-row-sb">
        {showLoadingIndicator && (
          <div className="list-item-text flex-row-sb">
            <div className="dms-loading-indicator"></div>
            <p>Fetching Dataset...</p>
          </div>
        )}
        <Button
          buttonText={"Train"}
          disabled={showLoadingIndicator}
          onClick={openHyperparameterAdjustmentForm}
        />
      </div>
    </div>
  );
};

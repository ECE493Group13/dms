/**
 *
 * Functional Requirements: FR1-12
 *
 */

import React from "react";

export const Button = ({ buttonText, onClick, disabled }) => {
  const onclick = (e) => {
    e.preventDefault();
    onClick();
  };

  return (
    <button onClick={onclick} className="dms-button" disabled={disabled}>
      {buttonText}
    </button>
  );
};

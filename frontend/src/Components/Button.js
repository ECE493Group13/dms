/**
 *
 * Functional Requirements: FR1-12
 *
 */

import React from "react";

export const Button = ({ id, buttonText, onClick, disabled }) => {
  const onclick = (e) => {
    e.preventDefault();
    onClick();
  };

  return (
    <button
      id={id}
      onClick={onclick}
      className="dms-button"
      disabled={disabled}
    >
      {buttonText}
    </button>
  );
};

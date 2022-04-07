import React, { useState } from "react";
import { DatasetTab } from "../Components/Tabs/DatasetTab";
import { ModelsTab } from "../Components/Tabs/ModelsTab";

export const Tabs = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const handleTab1 = () => {
    setActiveTab("tab1");
  };

  const handleTab2 = () => {
    setActiveTab("tab2");
  };

  return (
    <div className="dms-tab-container">
      <ul className="dms-tab-navigator">
        <li
          className={activeTab === "tab1" ? "active" : ""}
          onClick={handleTab1}
        >
          Datasets
        </li>
        <li
          className={activeTab === "tab2" ? "active" : ""}
          onClick={handleTab2}
        >
          Models
        </li>
      </ul>
      <div className="outlet">
        {activeTab === "tab1" ? <DatasetTab /> : <ModelsTab />}
      </div>
    </div>
  );
};

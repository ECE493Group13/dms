import React, { useEffect } from "react";
import { Header } from "../Components/Header";
import { KeywordBar } from "../Components/KeywordBar";
import { Tabs } from "../Components/Tabs";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("token") === null) {
      navigate("/");
    }
  }, []);

  return (
    <div>
      <Header showProfileIcon></Header>
      <h2 className="new-dataset-text">New Dataset</h2>
      <KeywordBar />
      <Tabs />
    </div>
  );
};

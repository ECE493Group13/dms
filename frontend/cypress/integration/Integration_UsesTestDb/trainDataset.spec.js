import {
  completeAccountUsername,
  completeAccountPassword,
} from "../secrets.js";

describe("Train Dataset", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url);

    // Login
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type(completeAccountPassword);
    cy.get(".dms-button").contains("Log in").click();
    cy.wait(2000);
  });

  it("should suggest correct hyperparameters", () => {
    cy.get("#trainButton").first().click();

    cy.get('[for="embedding_size"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "200"
    );
    cy.get('[for="epochs_to_train"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "15"
    );
    cy.get('[for="learning_rate"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "0.025"
    );
    cy.get('[for="num_neg_samples"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "5"
    );
    cy.get('[for="batch_size"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "500"
    );
    cy.get('[for="concurrent_steps"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "6"
    );
    cy.get('[for="window_size"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "5"
    );
    cy.get('[for="min_count"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "5"
    );
    cy.get('[for="subsample"] > .dms-number-input').should(
      "have.attr",
      "placeholder",
      "0.001"
    );
  });

  it("should train model with correct id", () => {
    cy.get("#trainButton").first().click();

    cy.get("[for='embedding_size'] > .dms-number-input").type(200);
    cy.get("[for='epochs_to_train'] > .dms-number-input").type(15);
    cy.get("[for='learning_rate'] > .dms-number-input").type(0.025);
    cy.get("[for='num_neg_samples'] > .dms-number-input").type(25);
    cy.get("[for='batch_size'] > .dms-number-input").type(500);
    cy.get("[for='concurrent_steps'] > .dms-number-input").type(12);
    cy.get("[for='window_size'] > .dms-number-input").type(5);
    cy.get("[for='min_count'] > .dms-number-input").type(5);
    cy.get("[for='subsample'] > .dms-number-input").type(0.001);

    cy.get(".dms-button").contains("Train Model").click();

    cy.intercept("/train-task").as("trainTaskRequest");

    cy.wait("@trainTaskRequest").then((req) => {
      expect(req.response.body.dataset_id).to.equal(56);
    });
  });

  it("should show newly trained model in models list", () => {
    cy.get(".dms-tab-navigator > :nth-child(2)").click();
    cy.contains("Flu");
  });
});

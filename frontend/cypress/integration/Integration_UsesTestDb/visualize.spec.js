import {
  completeAccountUsername,
  completeAccountPassword,
} from "../secrets.js";

describe("Visualize", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url);

    // Login
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type(completeAccountPassword);
    cy.get(".dms-button").contains("Log in").click();
  });

  it("should request plot data and recieve the correct arrays in the response", () => {
    cy.get(".dms-tab-navigator > :nth-child(2)").click();
    cy.get("#visualizeButton").click();

    cy.intercept("/visualize?train_task_id=52").as("plotData");

    cy.wait("@plotData").then((req) => {
      const body = JSON.parse(req.response.body);

      expect(Array.isArray(body.labels)).to.equal(true);
      expect(Array.isArray(body.x)).to.equal(true);
      expect(Array.isArray(body.y)).to.equal(true);
    });
  });
});

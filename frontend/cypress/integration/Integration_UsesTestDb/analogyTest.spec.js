import {
  completeAccountUsername,
  completeAccountPassword,
} from "../secrets.js";

describe("Analogy Test", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url);

    // Login
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type(completeAccountPassword);
    cy.get(".dms-button").contains("Log in").click();

    cy.get(".dms-tab-navigator > :nth-child(2)").click();
    cy.wait(2000);
    cy.get("#validateButton").click();
  });

  it("should perform an end to end analogy test", () => {
    cy.url().should("include", "/closestWords");

    cy.get("#closest-word-input").type("pain{enter}");

    cy.get("tbody > :nth-child(2) > :nth-child(1)").click();

    cy.url().should("include", "/analogyTest");

    cy.get(".analogy-test-paragraph > :nth-child(2)").contains("human");

    cy.get("#closest-word-input").type("muscle{enter}");

    cy.get(":nth-child(5) > .analogy-test-word-highlight").contains("muscle");
    cy.get("tbody > :nth-child(4) > :nth-child(1)").contains("blood");
  });
});

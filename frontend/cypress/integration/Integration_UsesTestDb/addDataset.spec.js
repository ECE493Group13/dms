import {
  completeAccountUsername,
  completeAccountPassword,
} from "../secrets.js";

describe("Add Dataset", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url);

    // Login
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type(completeAccountPassword);
    cy.get(".dms-button").contains("Log in").click();

    // Give GET/filter-task a sec to catch up
    cy.wait(2000);
  });

  it("should add incomplete dataset to the list of datasets", () => {
    cy.get(".dms-keyword-bar").type("test{enter}");
    cy.wait(2000);
    cy.get(".first-tab > :nth-child(1)").contains("Test");
    cy.get(".dms-loading-indicator").should("be.visible");
  });
});

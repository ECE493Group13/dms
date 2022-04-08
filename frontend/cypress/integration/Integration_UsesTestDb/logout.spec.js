import {
  completeAccountUsername,
  completeAccountPassword,
} from "../secrets.js";

describe("Logout", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url);

    // Login
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type(completeAccountPassword);
    cy.get(".dms-button").contains("Log in").click();
  });

  it("should log user out without errors", () => {
    cy.get("#profile-icon").click();
    cy.get(".dms-button").contains("Log out").click();
    cy.url().should("include", "/");
  });
});

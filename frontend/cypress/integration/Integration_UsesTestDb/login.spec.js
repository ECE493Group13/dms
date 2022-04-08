import {
  completeAccountUsername,
  completeAccountPassword,
  incompleteAccountUsername2,
  incompleteAccountPassword2,
} from "../secrets.js";

describe("Login", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url);
  });

  it("should show error message if username or password is incorrect", () => {
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type("incorrect_password");

    cy.get(".dms-button").contains("Log in").click();

    cy.contains("Incorrect username or password.");
  });

  it("should route to home page on complete login", () => {
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type(completeAccountPassword);

    cy.get(".dms-button").contains("Log in").click();

    cy.url().should("include", "/home");
  });

  it("should route to change password page on complete login", () => {
    cy.get("#input1").type(incompleteAccountUsername2);
    cy.get("#input2").type(incompleteAccountPassword2);

    cy.get(".dms-button").contains("Log in").click();

    cy.url().should("include", "/changePassword");
  });
});

import { completeAccountUsername, completeAccountEmail } from "../secrets.js";

describe("Request Account", () => {
  const url = "http://localhost:3000";
  const newUsername = "user42";
  const newEmail = "user42@example.com";

  beforeEach(() => {
    cy.visit(url);
    cy.contains("No account? Get started here").click();
  });

  it("should show error message if using duplicate username", () => {
    cy.get("#input1").type(completeAccountUsername);
    cy.get("#input2").type(newEmail);
    cy.get(".dms-button").contains("Request Account").click();
    cy.contains("Username or email already exists.");
  });

  it("should show error message if using duplicate email", () => {
    cy.get("#input1").type(newUsername);
    cy.get("#input2").type(completeAccountEmail);
    cy.get(".dms-button").contains("Request Account").click();
    cy.contains("Username or email already exists.");
  });

  // Will only succeed on a clean database since submission will put newUsername into the db
  it("should redirect to login screen on successful submission", () => {
    cy.get("#input1").type(newUsername);
    cy.get("#input2").type(newEmail);
    cy.get(".dms-button").contains("Request Account").click();
    cy.url().should("include", "/");
    cy.url().should("not.include", "/requestAccount");
  });
});

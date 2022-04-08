import {
  incompleteAccountUsername,
  incompleteAccountPassword,
} from "../secrets.js";

/* Database MUST be reset in between runs since the last test will update the password */
/* These tests MUST be ran in order since the last test depends on the newly changed password */
describe("Change Password", () => {
  const url = "http://localhost:3000";
  const newPassword = "Str0ngPass!";

  beforeEach(() => {
    cy.visit(url);
  });

  it("should redirect to change password page on login", () => {
    cy.get("#input1").clear().type(incompleteAccountUsername);
    cy.get("#input2").clear().type(incompleteAccountPassword);
    cy.get(".dms-button").contains("Log in").click();
    cy.url().should("include", "/changePassword");
  });

  it("should show error message if old password does not match temp password", () => {
    cy.get("#input1").clear().type(incompleteAccountUsername);
    cy.get("#input2").clear().type(incompleteAccountPassword);
    cy.get(".dms-button").contains("Log in").click();
    cy.url().should("include", "/changePassword");

    const oldPassword = "someinput";

    cy.get("#input1").clear().type(oldPassword);
    cy.get("#input2").clear().type(newPassword);

    cy.get("#submit-button").find("button").click();
    cy.contains("Old password does not match temporary password");
  });

  it("should redirect home on successfull password change", () => {
    cy.get("#input1").clear().type(incompleteAccountUsername);
    cy.get("#input2").clear().type(incompleteAccountPassword);
    cy.get(".dms-button").contains("Log in").click();

    cy.url().should("include", "/changePassword");

    cy.get("#input1").clear().type(incompleteAccountPassword);
    cy.get("#input2").clear().type(newPassword);

    cy.get("#submit-button").find("button").click();
    cy.url().should("include", "/home");
  });

  it("should log in successfully after password change", () => {
    cy.get("#input1").clear().type(incompleteAccountUsername);
    cy.get("#input2").clear().type(newPassword);
    cy.get(".dms-button").contains("Log in").click();
    cy.url().should("include", "/home");
  });
});

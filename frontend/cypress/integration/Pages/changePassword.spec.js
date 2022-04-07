/**
 *
 * Functional Requirements: FR3
 *
 */

describe("Change Password Page", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url + "/changePassword");
  });

  describe("Black box tests", () => {
    it('it should have "Data Mining System" in the header', () => {
      cy.get("#header").should("have.text", "Data Mining System");
    });

    it("it should not have profile icon in the header", () => {
      cy.get("#profile-icon").should("not.exist");
    });

    it("it has a double input form container", () => {
      cy.get("form")
        .parent()
        .should("have.class", "dms-double-input-form-container");
    });
  });

  describe("White box tests", () => {
    it("should show generic error message on API error", () => {
      const oldPassword = "someinput";
      const newPassword = "Str0ngPass!";

      cy.get("#input1").type(oldPassword);
      cy.get("#input2").type(newPassword);

      cy.intercept("POST", "/auth/update-password", {
        statusCode: 404,
      }).as("updatePassword404");

      cy.get("#submit-button").find("button").click();

      cy.wait(["@updatePassword404"]);

      cy.contains(
        "There was an error processing this request. Please try again later."
      );
    });

    it("should show error message if new password isn't strong enough", () => {
      const oldPassword = "someinput";
      const newPassword = "weakpass";

      cy.get("#input1").type(oldPassword);
      cy.get("#input2").type(newPassword);

      cy.intercept("POST", "/auth/update-password").as("updatePassword");

      cy.get("#submit-button").find("button").click();

      cy.contains(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit and one special character."
      );
    });

    it("should route home on successful password change", () => {
      const oldPassword = "someinput";
      const newPassword = "Str0ngPass!";

      cy.get("#input1").type(oldPassword);
      cy.get("#input2").type(newPassword);

      cy.intercept(
        {
          method: "POST",
          path: "/auth/update-password",
        },
        {
          fixture: "successfulLogin",
        }
      ).as("updatePassword");

      cy.intercept(
        {
          method: "GET",
          path: "/filter-task",
        },
        {
          fixture: "emptyArray",
        }
      ).as("sampleDatasets");

      cy.get("#submit-button").find("button").click();

      cy.wait(["@updatePassword"]);
      cy.wait(["@sampleDatasets"]);

      cy.url().should("include", "/home");
    });

    it("should show error message if old password doesn't match temporary password", () => {
      const oldPassword = "someinput";
      const newPassword = "Str0ngPass!";

      cy.get("#input1").type(oldPassword);
      cy.get("#input2").type(newPassword);

      cy.intercept("POST", "/auth/update-password", {
        statusCode: 401,
      }).as("updatePassword401");

      cy.get("#submit-button").find("button").click();

      cy.wait(["@updatePassword401"]);

      cy.contains("Old password does not match temporary password");
    });
  });
});

/**
 *
 * Functional Requirements: FR1
 *
 */

describe("Change Password Page", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url + "/requestAccount");
  });

  describe("Black box tests", () => {
    it("it has a double input form container", () => {
      cy.get("form")
        .parent()
        .should("have.class", "dms-double-input-form-container");
    });

    it('it should have "Request Account" title', () => {
      cy.contains("Request Account");
    });

    it("it should have correct subtitle", () => {
      cy.contains(
        "You will be notified by email if your request is accepted or rejected"
      );
    });

    it('has an username input with placeholder "Username"', () => {
      cy.get("#input1").should("have.attr", "placeholder", "Username");
    });

    it('has an email input with placeholder "Email"', () => {
      cy.get("#input2").should("have.attr", "placeholder", "Email");
    });

    it("accepts username input", () => {
      const input = "test_username";
      cy.get("#input1").type(input).should("have.value", input);
    });

    it("accepts email input", () => {
      const input = "test_email";
      cy.get("#input2").type(input).should("have.value", input);
    });

    it('has a "Request Account" button', () => {
      cy.get("form").find("button").should("have.text", "Request Account");
    });

    it("should show error message if either input is blank", () => {
      cy.get("#submit-button").click();
      cy.contains("Please complete all fields.");
    });

    it("should show error message if username input is blank", () => {
      cy.get("#input2").type("some input");
      cy.get("#submit-button").find("button").click();
      cy.contains("Please complete all fields.");
    });

    it("should show error message if email input is blank", () => {
      cy.get("#input1").type("some input");
      cy.get("#submit-button").find("button").click();
      cy.contains("Please complete all fields.");
    });

    it("should show error message if email is invalid", () => {
      cy.get("#input1").type("someinput");
      cy.get("#input2").type("invalidEmail");
      cy.get("#submit-button").find("button").click();
      cy.contains("Please enter a valid email");
    });
  });

  describe("White box tests", () => {
    it("should show error message if email/password already exists", () => {
      cy.intercept("POST", "/register", {
        statusCode: 409,
      }).as("register409");

      cy.get("#input1").type("someinput");
      cy.get("#input2").type("example@email.com");
      cy.get("#submit-button").find("button").click();

      cy.wait(["@register409"]);

      cy.contains("Username or email already exists.");
    });

    it("should show generic error message if API fails", () => {
      cy.intercept("POST", "/register", {
        statusCode: 404,
      }).as("register404");

      cy.get("#input1").type("someinput");
      cy.get("#input2").type("example@email.com");
      cy.get("#submit-button").find("button").click();

      cy.wait(["@register404"]);

      cy.contains(
        "There was an error processing your request. Please try again later"
      );
    });

    it("should navigate to login page on success", () => {
      cy.intercept("POST", "/register").as("registerIntercept");

      cy.get("#input1").type("someinput");
      cy.get("#input2").type("example@email.com");
      cy.get("#submit-button").find("button").click();

      cy.wait(["@registerIntercept"]);

      cy.url().should("include", "/");
    });
  });
});

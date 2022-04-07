describe("Login Page", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(url);
  });

  describe("Black box tests", () => {
    it('it should have "Data Mining System" title', () => {
      cy.contains("Data Mining System");
    });

    it("it has a double input form container", () => {
      cy.get("form")
        .parent()
        .should("have.class", "dms-double-input-form-container");
    });

    it('has a username input with placeholder "Username"', () => {
      cy.get("[type='text']").should("have.attr", "placeholder", "Username");
    });

    it('has a password input with placeholder "Password"', () => {
      cy.get("[type='password']").should(
        "have.attr",
        "placeholder",
        "Password"
      );
    });

    it("accepts username input", () => {
      const input = "test_username";
      cy.get("#input1").type(input).should("have.value", input);
    });

    it("accepts password input", () => {
      const input = "test_password";
      cy.get("#input2").type(input).should("have.value", input);
    });

    it('it has a "Log in" button', () => {
      cy.get("form").find("button").should("have.text", "Log in");
    });

    it('it has a "No account? Get started here" clickable text', () => {
      cy.contains("No account? Get started here")
        .invoke("css", "cursor")
        .should("equal", "pointer");
    });
  });

  describe("Black box tests", () => {
    it("should show error message if username or password is incorrect", () => {
      const username = "test_username";
      const password = "test_password";

      cy.get("#input1").type(username);
      cy.get("#input2").type(password);

      cy.intercept("POST", "http://localhost:4433/auth/login", {
        statusCode: 401,
      }).as("backendAPI");

      cy.get(".dms-button").contains("Log in").click();
      cy.wait(["@backendAPI"]);

      cy.contains("Incorrect username or password.");
    });

    it("should show generic error message if API fails", () => {
      const username = "test_username";
      const password = "test_password";

      cy.get("#input1").type(username);
      cy.get("#input2").type(password);

      cy.intercept("POST", "http://localhost:4433/auth/login", {
        statusCode: 404,
        body: {
          username: username,
          password: password,
        },
      }).as("backendAPI");

      cy.get(".dms-button").contains("Log in").click();
      cy.wait(["@backendAPI"]);

      cy.contains(
        "There was an error processing this request. Please try again later."
      );
    });

    it("should route to change password page on incomplete login", () => {
      const username = "test_username";
      const password = "test_password";

      cy.get("#input1").type(username);
      cy.get("#input2").type(password);

      cy.intercept(
        {
          method: "POST",
          path: "/auth/login",
        },
        {
          fixture: "incompleteLogin",
        }
      ).as("backendAPI");

      cy.get(".dms-button").contains("Log in").click();

      cy.url().should("include", "/changePassword");
    });

    it("should route to home page on complete login", () => {
      const username = "test_username";
      const password = "test_password";

      cy.get("#input1").type(username);
      cy.get("#input2").type(password);

      cy.intercept(
        {
          method: "POST",
          path: "/auth/login",
        },
        {
          fixture: "completeLogin",
        }
      ).as("backendAPI");

      cy.get(".dms-button").contains("Log in").click();

      cy.url().should("include", "/home");
    });
  });
});

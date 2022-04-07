/**
 *
 * Functional Requirements: FR10.1
 *
 */

describe("Closest Words Page", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.setToken();

    cy.intercept(
      {
        method: "GET",
        path: "/filter-task",
      },
      {
        fixture: "emptyArray",
      }
    ).as("sampleDatasets");
    cy.visit(url + "/home");
    cy.wait(["@sampleDatasets"]);

    cy.intercept(
      {
        method: "GET",
        path: "/train-task",
      },
      {
        fixture: "sampleModels",
      }
    ).as("sampleModels");
    cy.get(".dms-tab-navigator").contains("Models").click();
    cy.wait(["@sampleModels"]);

    cy.get(".dms-button").contains("Validate").click();
    cy.visit(url + "/closestWords");
  });

  describe("Black box tests", () => {
    it('should have "Data Mining System" in the header', () => {
      cy.get("#header").should("have.text", "Data Mining System");
    });

    it("should have a clickable profile icon in the header", () => {
      cy.get("#profile-icon")
        .invoke("css", "cursor")
        .should("equal", "pointer");
    });

    it('should have "Closest Words" title', () => {
      cy.contains("Closest Words");
    });

    it('should have "Enter a word below to receive the n most similar words to it" subtitle', () => {
      cy.contains(
        "Enter a word below to receive the n most similar words to it"
      );
    });

    it('should have a text input with "Word" placeholder', () => {
      cy.get("[type='text']").should("have.attr", "placeholder", "Word");
    });

    it("should have a number input with default value 100", () => {
      cy.get("[type='number']").should("have.attr", "value", "100");
    });

    it("accepts word input", () => {
      const input = "word";
      cy.get("#closest-word-input").type(input).should("have.value", input);
    });

    it("accepts number input", () => {
      const input = 5;
      cy.get("#num-closest-word-input")
        .clear()
        .type(input)
        .should("have.value", input);
    });

    it("should show error message if submit is clicked without entering word", () => {
      cy.get(".dms-button").contains("Submit").click();
      cy.contains("Please enter a word");
    });

    it("should show error message if non-number is entered in number field", () => {
      const input = "e";
      cy.get("#closest-word-input").type(input);

      cy.get("#num-closest-word-input").clear().type(input);
      cy.get(".dms-button").contains("Submit").click();
      cy.contains("Please enter a positive number");
    });

    it("should show error message if negative number is entered in number field", () => {
      const input = -5;
      cy.get("#closest-word-input").type(input);

      cy.get("#num-closest-word-input")
        .clear()
        .type(input)
        .should("have.value", input);
      cy.get(".dms-button").contains("Submit").click();
      cy.contains("Please enter a positive number");
    });
  });

  describe("White box tests", () => {
    it("should route to home page if trained model Id is not given", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/filter-task",
        },
        {
          fixture: "sampleDatasets",
        }
      ).as("sampleDatasets");
      cy.visit(url + "/home");
      cy.wait(["@sampleDatasets"]);

      cy.visit(url + "/closestWords");
      cy.wait(2000);
      cy.url().should("include", "/home");
    });

    it("should show alert if API throws 401", () => {
      cy.intercept(
        "GET",
        "/verify/most-similar?word=word&count=100&trained_model_id=15",
        {
          statusCode: 401,
        }
      ).as("closestWordsUnauthed");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@closestWordsUnauthed"]);

      cy.on("window:alert", (str) => {
        expect(str).to.equal("Your session has expired, Please sign in again.");
      });
    });

    it("should not show table if no results", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/most-similar?word=word&count=100&trained_model_id=15",
        },
        {
          fixture: "emptyArray",
        }
      ).as("closestWords");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@closestWords"]);

      cy.get("thbody").should("not.exist");
    });

    it("should show table on successful API call", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/most-similar?word=word&count=100&trained_model_id=15",
        },
        {
          fixture: "closestWords",
        }
      ).as("closestWords");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@closestWords"]);

      cy.get("tbody").should("exist");
    });

    it("should show loading indicator while fetching results", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/most-similar?word=word&count=100&trained_model_id=15",
        },
        (req) => {
          // Delay response so we catch loading indicator
          req.on("response", (res) => {
            res.setThrottle(1000);
          });
        },
        {
          fixture: "closestWords",
        }
      ).as("closestWordsDelayed");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.get(".dms-loading-indicator").should("exist");

      cy.wait(["@closestWordsDelayed"]);
    });

    it("should route to analogy test page if a word is clicked", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/most-similar?word=word&count=100&trained_model_id=15",
        },
        {
          fixture: "closestWords",
        }
      ).as("closestWords");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@closestWords"]);

      cy.get("tbody").should("exist");

      cy.get("tbody > :nth-child(2) > :nth-child(1)").click();

      cy.url().should("include", "/analogyTest");
    });
  });
});

/**
 *
 * Functional Requirements: FR10.2
 *
 */

describe("Analogy Test Page", () => {
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

    cy.get("tbody > :nth-child(2) > :nth-child(1)").click();
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

    it('should have "Analogy Test" title', () => {
      cy.contains("Analogy Test");
    });

    it('should have "Enter a third word below to perform an analogy test on the given words.', () => {
      cy.contains(
        "Enter a third word below to perform an analogy test on the given words."
      );
    });

    it("should contain the text entered on the previous page", () => {
      cy.get(".analogy-test-paragraph > :nth-child(1)").contains("word");
    });

    it('should have a text input with "Word is to..." placeholder', () => {
      cy.get("[type='text']").should(
        "have.attr",
        "placeholder",
        "Word is to..."
      );
    });

    it("should have a number input with default value 500", () => {
      cy.get("[type='number']").should("have.attr", "value", "500");
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

    it("should contain the text clicked on the previous page", () => {
      cy.get(".analogy-test-paragraph > :nth-child(2)").contains("facial");
    });
  });

  describe("White box tests", () => {
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

    it("should route home if word A, word B and traned model ID is not defined", () => {
      cy.visit(url + "/home");

      cy.intercept(
        {
          method: "GET",
          path: "/filter-task",
        },
        {
          fixture: "sampleDatasets",
        }
      ).as("sampleDatasets");
      cy.wait(["@sampleDatasets"]);

      cy.visit(url + "/analogyTest");
      cy.wait(2000);
      cy.url().should("include", "/home");
    });

    it("should show alert if /verify/analogy-test throws 401", () => {
      cy.intercept(
        "GET",
        "/verify/analogy-test?word_a=word&word_b=facial&word_c=word&trained_model_id=15&count=500",
        {
          statusCode: 401,
        }
      ).as("analogyTestUnauthed");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@analogyTestUnauthed"]);

      cy.on("window:alert", (str) => {
        expect(str).to.equal("Your session has expired, Please sign in again.");
      });
    });

    it("should show loading indicator while fetching results", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/analogy-test?word_a=word&word_b=facial&word_c=word&trained_model_id=15&count=500",
        },
        (req) => {
          // Delay response so we catch loading indicator
          req.on("response", (res) => {
            res.setThrottle(1000);
          });
        },
        {
          fixture: "emptyArray",
        }
      ).as("delayedIntercept");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.get(".dms-loading-indicator").should("exist");

      cy.wait(["@delayedIntercept"]);
    });

    it("should not show table if no results", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/analogy-test?word_a=word&word_b=facial&word_c=word&trained_model_id=15&count=500",
        },
        {
          fixture: "emptyArray",
        }
      ).as("analogyTest");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@analogyTest"]);

      cy.get("thbody").should("not.exist");
    });

    it("should show table on successful API call", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/analogy-test?word_a=word&word_b=facial&word_c=word&trained_model_id=15&count=500",
        },
        {
          fixture: "analogyTest",
        }
      ).as("analogyTest");

      cy.get("#closest-word-input").type("word");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@analogyTest"]);

      cy.get("tbody").should("exist");
    });

    it("should show newly entered word on successful API call", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/verify/analogy-test?word_a=word&word_b=facial&word_c=word2&trained_model_id=15&count=500",
        },
        {
          fixture: "analogyTest",
        }
      ).as("analogyTest");

      cy.get("#closest-word-input").type("word2");
      cy.get(".dms-button").contains("Submit").click();

      cy.wait(["@analogyTest"]);

      cy.get(":nth-child(5) > .analogy-test-word-highlight").contains("word2");
    });
  });
});

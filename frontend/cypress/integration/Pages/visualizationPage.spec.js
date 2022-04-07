describe("Visualization Page", () => {
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
  });

  describe("Black box tests", () => {
    beforeEach(() => {
      cy.get(".dms-button").contains("Visualize").click();
    });

    it('should have "Data Mining System" in the header', () => {
      cy.get("#header").should("have.text", "Data Mining System");
    });

    it("should have a clickable profile icon in the header", () => {
      cy.get("#profile-icon")
        .invoke("css", "cursor")
        .should("equal", "pointer");
    });

    it("should have a chart visible", () => {
      cy.get("canvas");
    });
  });

  describe("White box tests", () => {
    it("should route to home page if trained model Id is not given", () => {
      cy.visit(url + "/visualize");
      cy.wait(2000);
      cy.url().should("include", "/home");
    });

    it("should show alert if API throws 401", () => {
      cy.intercept("GET", "/visualize?train_task_id=35", {
        statusCode: 401,
      }).as("visualizeUnauthed");

      cy.get(".dms-button").contains("Visualize").click();

      cy.wait(["@visualizeUnauthed"]);

      cy.on("window:alert", (str) => {
        expect(str).to.equal("Your session has expired, Please sign in again.");
      });
    });

    it("should show chart on successful API call", () => {
      cy.intercept(
        {
          method: "GET",
          path: "/visualize?train_task_id=35",
        },
        {
          fixture: "plotData",
        }
      ).as("plotData");

      cy.get(".dms-button").contains("Visualize").click();

      cy.wait("@plotData").then((req) => {
        const body = req.response.body;
        expect(Array.isArray(body.labels)).to.equal(true);
        expect(Array.isArray(body.x)).to.equal(true);
        expect(Array.isArray(body.y)).to.equal(true);
      });
    });
  });
});

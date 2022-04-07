describe("Hyperparameter Adjustment Page", () => {
  const url = "http://localhost:3000";

  describe("Black box tests", () => {
    beforeEach(() => {
      cy.setToken();

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

      cy.intercept(
        {
          method: "GET",
          path: "/train-task/suggest-hparams",
        },
        {
          fixture: "hyperparamSuggestions",
        }
      ).as("hyperparamSuggestions");
      cy.get(".dms-button").contains("Train").first().click();
      cy.wait(["@hyperparamSuggestions"]);
    });

    it('should have "Data Mining System" in the header', () => {
      cy.get("#header").should("have.text", "Data Mining System");
    });

    it("should have a clickable profile icon in the header", () => {
      cy.get("#profile-icon")
        .invoke("css", "cursor")
        .should("equal", "pointer");
    });

    it("should have all correct hyperparameter inputs", () => {
      cy.get('[for="embedding_size"]').contains("Embedding Size");
      cy.get('[for="epochs_to_train"]').contains("Epochs to Train");
      cy.get('[for="learning_rate"]').contains("Learning Rate");
      cy.get('[for="num_neg_samples"]').contains("Num Neg Samples");
      cy.get('[for="batch_size"]').contains("Batch Size");
      cy.get('[for="concurrent_steps"]').contains("Concurrent Steps");
      cy.get('[for="window_size"]').contains("Window Size");
      cy.get('[for="min_count"]').contains("Min Count");
      cy.get('[for="subsample"]').contains("Sub Sample");
    });

    it("should have train model button", () => {
      cy.get(".dms-button").contains("Train Model");
    });
  });

  describe("White box tests", () => {
    beforeEach(() => {
      cy.setToken();

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

      cy.intercept(
        {
          method: "GET",
          path: "/train-task/suggest-hparams",
        },
        {
          fixture: "hyperparamSuggestions",
        }
      ).as("hyperparamSuggestions");
      cy.get(".dms-button").contains("Train").first().click();
      cy.wait(["@hyperparamSuggestions"]);
    });

    it("should navigate to login screen if no dataset id is given", () => {
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

      cy.visit(url + "/trainSettings");
      cy.wait(2000);
      cy.url().should("include", "/home");
    });

    it("should show alert if 401 is thrown for /train-task/suggest-hparams", () => {
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

      cy.intercept("GET", "/train-task/suggest-hparams", {
        statusCode: 401,
      }).as("hyperparamUnauthorized");

      cy.get(".dms-button").contains("Train").first().click();
      cy.wait(["@hyperparamUnauthorized"]);

      cy.on("window:alert", (str) => {
        expect(str).to.equal("Your session has expired, Please sign in again.");
      });
    });

    it("should input suggestions as placeholders correctly", () => {
      cy.get('[for="embedding_size"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "200"
      );
      cy.get('[for="epochs_to_train"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "15"
      );
      cy.get('[for="learning_rate"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "0.025"
      );
      cy.get('[for="num_neg_samples"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "25"
      );
      cy.get('[for="batch_size"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "500"
      );
      cy.get('[for="concurrent_steps"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "12"
      );
      cy.get('[for="window_size"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "5"
      );
      cy.get('[for="min_count"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "5"
      );
      cy.get('[for="subsample"] > .dms-number-input').should(
        "have.attr",
        "placeholder",
        "0.001"
      );
    });

    it("should send correct hyperparemters on form submit", () => {
      cy.get("[for='embedding_size'] > .dms-number-input").type(200);
      cy.get("[for='epochs_to_train'] > .dms-number-input").type(15);
      cy.get("[for='learning_rate'] > .dms-number-input").type(0.025);
      cy.get("[for='num_neg_samples'] > .dms-number-input").type(25);
      cy.get("[for='batch_size'] > .dms-number-input").type(500);
      cy.get("[for='concurrent_steps'] > .dms-number-input").type(12);
      cy.get("[for='window_size'] > .dms-number-input").type(5);
      cy.get("[for='min_count'] > .dms-number-input").type(5);
      cy.get("[for='subsample'] > .dms-number-input").type(0.001);

      cy.intercept(
        {
          method: "POST",
          path: "/train-task",
        },
        {
          fixture: "sampleFilterTask",
        }
      ).as("interceptTrainTask");

      cy.get(".dms-button").contains("Train Model").click();

      cy.wait("@interceptTrainTask").then((req) => {
        expect(req.request.body.hparams).to.deep.equal({
          embedding_size: 200,
          epochs_to_train: 15,
          learning_rate: 0.025,
          num_neg_samples: 25,
          batch_size: 500,
          concurrent_steps: 12,
          window_size: 5,
          min_count: 5,
          subsample: 0.001,
        });
      });
    });

    it("should send correct dataset id on form submit", () => {
      cy.get("[for='embedding_size'] > .dms-number-input").type(200);
      cy.get("[for='epochs_to_train'] > .dms-number-input").type(15);
      cy.get("[for='learning_rate'] > .dms-number-input").type(0.025);
      cy.get("[for='num_neg_samples'] > .dms-number-input").type(25);
      cy.get("[for='batch_size'] > .dms-number-input").type(500);
      cy.get("[for='concurrent_steps'] > .dms-number-input").type(12);
      cy.get("[for='window_size'] > .dms-number-input").type(5);
      cy.get("[for='min_count'] > .dms-number-input").type(5);
      cy.get("[for='subsample'] > .dms-number-input").type(0.001);

      cy.intercept(
        {
          method: "POST",
          path: "/train-task",
        },
        {
          fixture: "sampleFilterTask",
        }
      ).as("interceptTrainTask");

      cy.get(".dms-button").contains("Train Model").click();

      cy.wait("@interceptTrainTask").then((req) => {
        expect(req.request.body.dataset_id).to.equal(43);
      });
    });

    it("should show 'Please complete all fields' message if not all fields are filled in", () => {
      cy.intercept("POST", "/train-task", {
        statusCode: 422,
      }).as("interceptTrainTask");

      cy.get(".dms-button").contains("Train Model").click();
      cy.wait(["@interceptTrainTask"]);

      cy.contains("Please complete all fields.");
    });

    it("should show generic error message on API fail", () => {
      cy.intercept("POST", "/train-task", {
        statusCode: 404,
      }).as("interceptTrainTask");

      cy.get(".dms-button").contains("Train Model").click();
      cy.wait(["@interceptTrainTask"]);

      cy.contains(
        "There was an error processing this request. Please try again later"
      );
    });

    it("should route to home page on form submit", () => {
      cy.intercept("POST", "/train-task", {
        body: {
          hparams: {
            embedding_size: 200,
            epochs_to_train: 15,
            learning_rate: 0.025,
            num_neg_samples: 25,
            batch_size: 500,
            concurrent_steps: 12,
            window_size: 5,
            min_count: 5,
            subsample: 0.001,
          },
          dataset_id: 0,
        },
      }).as("interceptTrainTask");

      cy.get(".dms-button").contains("Train Model").click();
      cy.url().should("include", "/home");
    });
  });
});

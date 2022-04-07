/**
 *
 * Functional Requirements: FR4
 *
 */

describe("Logout Page", () => {
  const url = "http://localhost:3000";

  beforeEach(() => {
    cy.setToken();
    cy.visit(url + "/profile");
  });

  describe("White box tests", () => {
    it('it should have "Data Mining System" in the header', () => {
      cy.get("#header").should("have.text", "Data Mining System");
    });

    it("it should have a clickable profile icon in the header", () => {
      cy.get("#profile-icon")
        .invoke("css", "cursor")
        .should("equal", "pointer");
    });

    it("it should have a logout button", () => {
      cy.get(".logout-button").contains("Logout");
    });
  });

  describe("White box tests", () => {
    it("should redirect to home page when logout is clicked", () => {
      cy.intercept("POST", "/auth/logout").as("logout");
      cy.get(".dms-button").contains("Logout").click();

      cy.url().should("include", "/");
    });
  });
});

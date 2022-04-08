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
      cy.get(".logout-button").contains("Log out");
    });

    it("it should have a change password button", () => {
      cy.get(".change-password-button").contains("Change Password");
    });
  });

  describe("Black box tests", () => {
    it("should redirect to login page when logout is clicked", () => {
      cy.intercept("POST", "/auth/logout").as("logout");
      cy.get(".dms-button").contains("Log out").click();

      cy.url().should("include", "/");
    });

    it("should redirect to change password page when change password is clicked", () => {
      cy.get(".dms-button").contains("Change Password").click();
      cy.url().should("include", "/changePassword");
    });
  });
});

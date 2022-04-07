Cypress.Commands.add("setToken", (path, visitOptions) => {
  sessionStorage.setItem(
    "token",
    `Bearer 1337a911dea0f1fbcde334f757dd41e9c8fbc2fea391c08954932d248c8a9416`
  );
});

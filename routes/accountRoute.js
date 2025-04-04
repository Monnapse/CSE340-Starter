// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

router.get("/", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
);
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildSignUp));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get("/update", utilities.handleErrors(accountController.buildUpdateAccountView));
router.post(
  "/update/basic",
  regValidate.updateAccountBasicRules(),
  regValidate.checkUpdateAccountBasicData,
  utilities.handleErrors(accountController.accountUpdateBasics)
)
router.post(
  "/update/password",
  regValidate.updateAccountAuthRules(),
  regValidate.checkUpdateAccountAuthData,
  utilities.handleErrors(accountController.accountUpdateBasics)
)

router.get("/logout", utilities.handleErrors(accountController.logoutAccount));

module.exports = router;

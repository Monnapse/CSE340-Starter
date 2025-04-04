const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const utilities = require("../utilities/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { get } = require("../routes/static");
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,   
  });
}

/* ****************************************
 *  Gets the account type from the JWT token
 * *************************************** */
function getAccountType(req) {
  const token = req.cookies.jwt;
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded.account_type;
  } catch (error) {
    console.error("Error decoding token: ", error);
    return null;
  }
}

/* ****************************************
 *  Gets the account data from the JWT token
 * *************************************** */
async function getAccountData(req, include_password = false) {
  const token = req.cookies.jwt;
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const accountData = await accountModel.getAccountById(decoded.account_id);
    
    if (!accountData) {
      return null;
    }
    if (!include_password) {
      delete accountData.account_password; // Remove password from the account data
    }

    console.log("Account Data: ", accountData);

    return accountData;
  } catch (error) {
    console.error("Error decoding token: ", error);
    return null;
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();

  res.render("account/index", {
    title: "Account Home",
    nav,
    errors: null,   
  });
}

/* ****************************************
 *  Deliver Sign Up view
 * *************************************** */
async function buildSignUp(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Sign Up",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.session.loggedin = true
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ***************************
 *  Check if user is logged in and has permission to access the page
 * ************************** */
async function checkPermissions(req, res, next, acc_types = []) {
  if (req.session.loggedin) { // Check if user is logged in
    // Now check if user has permissions
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const acc_type = decoded.account_type;

    console.log("Account Type: ", acc_type);

    if (acc_types.length > 0) {
      if (acc_types.includes(acc_type)) {
        next();
      } else {
        req.flash("notice", "You do not have permission to access this page.");
        res.redirect("/account/");
      }
    } else {
      console.error("Something went wrong with permissions check.");
      req.flash("notice", "Something went wrong with permissions check.");
      res.redirect("/account/");
    }
  } else {
    req.flash("notice", "You need permissions to access this page.");
    res.redirect("/account/");
  }
}

/* ***************************
 *  Check if user is logged in and has permission to access the page
 * ************************** */
async function checkPermissionsForEmployeeAndAdmin(req, res, next) {
  return checkPermissions(req, res, next, ["Employee", "Admin"]);
}

/* ****************************************
  *  Update Account View
  * *************************************** */
async function buildUpdateAccountView(req, res, next) {
  let nav = await utilities.getNav();

  const accountData = await getAccountData(req);

  if (!accountData) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }

  res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  });
}

/* ****************************************
 *  Process account update basic request
 * ************************************ */
async function accountUpdateBasics(req, res) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email 
  } = req.body;

  const accountData = await getAccountData(req);

  // Check if email was changed and if it is already in use
  const emailExists = await accountModel.checkExistingEmail(account_email)
  if (accountData.account_email != account_email && emailExists) {
    // Email already exists in the database 
    req.flash("notice", "Email already exists. Please use a different email.")
    res.status(400).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email 
    })
    return
  }

  const queryData = await accountModel.updateAccountBasicById(accountData.account_id, account_firstname, account_lastname, account_email);
  if (!queryData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email 
    })
    return
  }

  req.flash("notice", "Congratulations, your account was updated successfully.");
  return res.redirect("/account/")
}

/* ****************************************
 *  Process account update authentication request
 * ************************************ */
async function accountUpdateBasics(req, res) {
  let nav = await utilities.getNav()
  const {
    account_password
  } = req.body;

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the account update.')
    res.status(500).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
    })
  }


  const accountData = await getAccountData(req);

  const queryData = await accountModel.updateAccountAuthById(accountData.account_id, hashedPassword);
  if (!queryData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
    })
    return
  }

  req.flash("notice", "Congratulations, your account was updated successfully.");
  return res.redirect("/account/")
}

/* *****************************
* Logout of account
* ***************************** */
async function logoutAccount (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error: ", err)
      return res.status(500).send("Error logging out")
    }
    res.clearCookie("jwt")
    res.redirect("/")
  })
}

module.exports = { buildLogin, buildSignUp, registerAccount, accountLogin, buildManagement, checkPermissions, checkPermissionsForEmployeeAndAdmin, getAccountType, getAccountData, buildUpdateAccountView, accountUpdateBasics, logoutAccount };

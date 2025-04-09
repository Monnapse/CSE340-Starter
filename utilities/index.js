const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildVehicleDetail = async function (data, loggedIn, isFavorited) {
  console.log("buildVehicleDetail", data, loggedIn, isFavorited);
  let item;
  if (data) {
    const vehicle = data;

    // Format the price with commas
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(vehicle.inv_price);

    const formattedMiles = new Intl.NumberFormat("en-US").format(
      vehicle.inv_miles
    );

    favorite = `<a href="/inv/favorite/${vehicle.inv_id}">${isFavorited ? "Remove from Favorites" : "Add to Favorites"}</a>`;

    item = `
      <h1>${vehicle.inv_year} ${vehicle.inv_make}</h1>
      <div class="split-sideways">
          <img class="resp-img" src="${vehicle.inv_image}" alt="${vehicle.inv_make} Image" loading="lazy">
          <div>
              <h3>${vehicle.inv_make} Details</h3>
              <span>${formattedPrice}</span>
              <p><h3>Description: </h3>${vehicle.inv_description}</p>
              <p><h3>Color: </h3>${vehicle.inv_color}</p>
              <p><h3>Miles: </h3>${formattedMiles}</p>
              ${loggedIn ? favorite : ""}
          </div>
      </div>
    `;
  } else {
    item = `
      <h1>404</h1>
      <p class="notice">Sorry, no matching vehicles could be found.</p>
    `;
  }
  return item;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin && req.cookies.jwt) {
    next();
    return true;
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
  return false;
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLoginNoRedirect = (req, res, next) => {
  if (res.locals.loggedin && req.cookies.jwt) {
    return true;
  }
  return false;
};

module.exports = Util;

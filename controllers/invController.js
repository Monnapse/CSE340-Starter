const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
}

invCont.buildByDetailId = async function (req, res, next) {
  try {
    const detail_id = req.params.detailId;
    const data = await invModel.getInventoryByDetailId(detail_id);
    const detail = await utilities.buildVehicleDetail(data);
    let nav = await utilities.getNav();
    const detailName = data.length > 0?  `${data[0]?.detail_name} vehicle` : "Vehicle Not Found";
    res.render("./inventory/detail", {
      title: detailName,
      nav,
      detail,
    });
  } catch (error) {
    console.error("buildByDetailId error " + error);
  }
}

invCont.buildInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const messages = req.flash("notice"); // Retrieve flash messages
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    messages: messages
  });
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  });
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    errors: null,
    classifications: classifications.rows,
    inv_img_path: "/images/vehicles/no-image.png",
    inv_thumbnail_path: "/images/vehicles/no-image.png",
  });
}

/* ****************************************
 *  Process Add Classification
 * *************************************** */
invCont.addClassification = async function(req, res) {
  let nav = await utilities.getNav();
  const {
    classification_name,
  } = req.body;

  const regResult = await invModel.createNewClassification(
    classification_name,
  );

  if (regResult) {
    req.flash(
      "notice",
      `The ${classification_name} classification was successfully added.`
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      messages: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Sorry, failed to create classification.");
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process Add Inventory
 * *************************************** */
invCont.addInventory = async function(req, res) {
  let nav = await utilities.getNav();
  const {
    inv_class,
    inv_make,
    inv_model,
    inv_description,
    inv_img_path,
    inv_thumbnail_path,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  const regResult = await invModel.createNewInventory(
    inv_class,
    inv_make,
    inv_model,
    inv_description,
    inv_img_path,
    inv_thumbnail_path,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  );

  if (regResult) {
    req.flash(
      "notice",
      `The ${inv_make} was successfully added.`
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      messages: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Sorry, failed to create inventory.");
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: null,
    });
  }
}

module.exports = invCont;
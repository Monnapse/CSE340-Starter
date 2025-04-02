const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0]?.classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

invCont.buildByDetailId = async function (req, res, next) {
  try {
    const detail_id = req.params.detailId;
    const data = await invModel.getInventoryByDetailId(detail_id);
    const detail = await utilities.buildVehicleDetail(data);
    console.log(detail);
    let nav = await utilities.getNav();
    const detailName = data.length > 0 ? `${data[0]?.detail_name} vehicle` : "Vehicle Not Found";

    res.render("./inventory/detail", {
      title: detailName,
      nav,
      detail,
    });
  } catch (error) {
    console.error("buildByDetailId error " + error);
  }
};

invCont.buildInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const messages = req.flash("notice"); // Retrieve flash messages
  const classifications = await invModel.getClassifications();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    messages: messages,
    classifications: classifications.rows,
  });
};

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    errors: null,
    classifications: classifications.rows,
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image.png",
  });
};

/* ****************************************
 *  Process Add Classification
 * *************************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  const regResult = await invModel.createNewClassification(classification_name);

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
};

/* ****************************************
 *  Process Add Inventory
 * *************************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_class,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
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
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  );

  if (regResult) {
    req.flash("notice", `The ${inv_make} was successfully added.`);
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
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByDetailId(inv_id);
  console.log(itemData, inv_id);
  const classifications = await invModel.getClassifications();
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classifications: classifications.rows,
    inv_class: itemData.classification_id,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    inv_class,
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    inv_class
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    //const classificationSelect = await utilities.buildClassificationList(classification_id)
    const classifications = await invModel.getClassifications();
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classifications: classifications.rows,
      inv_class: classification_id,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByDetailId(inv_id);
  res.render("./inventory/delete-inventory", {
    title: "CONFIRM DELETION - THE DELETION IS PERMANENT.",
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year,
  } = req.body;
  const updateResult = await invModel.deleteInventoryItem(
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year,
  );

  if (updateResult) {
    req.flash("notice", `The deletion was successful.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "CONFIRM DELETION - THE DELETION IS PERMANENT.",
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

module.exports = invCont;

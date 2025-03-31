const utilities = require(".");
const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");

const validate = {};

/*  **********************************
 *  Add Classification Data Validation Rules
 * ********************************* */
validate.addClassificationRules = () => {
  return [
    // valid name is required and cannot already exist in the DB
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isAlpha()
      .withMessage("A valid classification name is required.")
      .custom(async (classification_name) => {
        const classificationExists =
          await inventoryModel.checkExistingClassification(classification_name);
        if (classificationExists) {
          throw new Error(
            "Classification exists. Please use a different name."
          );
        }
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to classification
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values/error messages.
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Add Vehicle Data Validation Rules
 * ********************************* */
validate.addVehicleRules = () => {
  return [
    // valid name is required and cannot already exist in the DB
    body("inv_class")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("A valid classification is required.")
      .custom(async (classification_id) => {
        const classificationExists =
          await inventoryModel.checkExistingClassification(
            null,
            classification_id
          );
        if (!classificationExists) {
          throw new Error(
            "Classification does not exist. Please use a different one."
          );
        }
      }),

    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("A valid make is required."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("A valid model is required."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("A valid description is required."),

    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("A valid image path is required."),

    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("A valid thumbnail path is required."),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isDecimal()
      .withMessage("A valid price is required."),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("A valid year is required."),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("A valid mile is required."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("A valid color is required."),
  ];
};

/* ******************************
 * Check data and return errors or continue to inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
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

  let errors = [];
  errors = validationResult(req);

  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values/error messages.
    let nav = await utilities.getNav();
    const classifications = await inventoryModel.getClassifications();
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classifications: classifications.rows,

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
    });
    return;
  }
  next();
};

/* ******************************
 * Check data thats updated
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
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
    inv_id
  } = req.body;

  let errors = [];
  errors = validationResult(req);

  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values/error messages.
    let nav = await utilities.getNav();
    const classifications = await inventoryModel.getClassifications();
    res.render("inventory/edit-inventory", {
      errors,
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classifications: classifications.rows,

      inv_class: inv_class,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id
    });
    return;
  }
  next();
};

module.exports = validate;

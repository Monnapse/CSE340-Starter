// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const regValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

// Root
router.get("", invController.buildInventory);

// Add Classification
router.get("/add-classification", invController.buildAddClassification);

// Process the Add Classification attempt
router.post(
  "/add-classification",
  regValidate.addClassificationRules(),
  regValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory
router.get("/add-inventory", invController.buildAddInventory);

// Process the Add Inventory attempt
router.post(
    "/add-inventory",
    regValidate.addVehicleRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
  )

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by detail view
router.get("/detail/:detailId", invController.buildByDetailId)

module.exports = router;
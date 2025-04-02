// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const regValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

// Root
router.get("", invController.buildInventory);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Add Classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

router.get("/edit/:inv_id", invController.editInventoryView);
router.post("/update/", 
  regValidate.addVehicleRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory))

router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteInventoryView));
router.post("/delete/", 
  regValidate.deleteVehicleRules(),
  regValidate.checkDeleteData,
  utilities.handleErrors(invController.deleteInventory)
);

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
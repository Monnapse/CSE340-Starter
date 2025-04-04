// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const regValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");

// Root
router.get("", 
  accountController.checkPermissionsForEmployeeAndAdmin,
  invController.buildInventory);

router.get("/getInventory/:classification_id", 
  accountController.checkPermissionsForEmployeeAndAdmin,
  utilities.handleErrors(invController.getInventoryJSON))

// Add Classification
router.get("/add-classification", 
  accountController.checkPermissionsForEmployeeAndAdmin,
  utilities.handleErrors(invController.buildAddClassification));

router.get("/edit/:inv_id",
  accountController.checkPermissionsForEmployeeAndAdmin,
  invController.editInventoryView);
router.post("/update/", 
  accountController.checkPermissionsForEmployeeAndAdmin,
  regValidate.addVehicleRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory))

router.get("/delete/:inv_id", 
  accountController.checkPermissionsForEmployeeAndAdmin,
  utilities.handleErrors(invController.deleteInventoryView));
router.post("/delete/", 
  accountController.checkPermissionsForEmployeeAndAdmin,
  regValidate.deleteVehicleRules(),
  regValidate.checkDeleteData,
  utilities.handleErrors(invController.deleteInventory)
);

// Process the Add Classification attempt
router.post(
  "/add-classification",
  accountController.checkPermissionsForEmployeeAndAdmin,
  regValidate.addClassificationRules(),
  regValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory
router.get("/add-inventory", 
  accountController.checkPermissionsForEmployeeAndAdmin,
  invController.buildAddInventory);

// Process the Add Inventory attempt
router.post(
    "/add-inventory",
    accountController.checkPermissionsForEmployeeAndAdmin,
    regValidate.addVehicleRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
  )

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by detail view
router.get("/detail/:detailId", invController.buildByDetailId)

module.exports = router;
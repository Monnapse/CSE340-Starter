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

module.exports = invCont;
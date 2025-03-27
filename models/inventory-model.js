const pool = require("../database/");

/* **********************
 *   Check for existing classification
 * ********************* */
async function checkExistingClassification(classification_name, classification_id) {
  try {
    const sql = `SELECT * FROM public.classification WHERE ${classification_name != null ? "classification_name ILIKE" : "classification_id ="} $1`
    const classification = await pool.query(sql, [classification_name ? classification_name : classification_id])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  Get inventory item and classification_name by classification_id
 * ************************** */
async function getInventoryByDetailId(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.inv_id = $1`,
      [inventory_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* *****************************
*   Create new classification
* *************************** */
async function createNewClassification(classification_name){
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Create new invenotry
* *************************** */
async function createNewInventory(
  inv_class,
  inv_make,
  inv_model,
  inv_description,
  inv_img_path,
  inv_thumbnail_path,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
){
  try {
    // Ensure inv_year is exactly 4 characters
    const year = inv_year.toString().slice(0, 4);

    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

    return await pool.query(sql, [
      inv_make,
      inv_model,
      year,
      inv_description,
      inv_img_path,
      inv_thumbnail_path,
      inv_price,
      inv_miles,
      inv_color,
      inv_class,
    ]);
  } catch (error) {
    return error.message
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByDetailId, checkExistingClassification, createNewClassification, createNewInventory };

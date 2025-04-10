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
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getAccountFavorites(account_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory i
	      JOIN public.account_favorite af ON i.inv_id = af.inv_id
	      WHERE af.account_id = $1`,
      [account_id]
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
    return data.rows[0];
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
*   Create new inventory
* *************************** */
async function createNewInventory(
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
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      inv_class,
    ]);
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* ***************************
  Check if user has vehicle favorited
* ************************** */
async function isFavorited(inv_id, accountId) {
  try {
    const sql = 'SELECT account_id, inv_id FROM public.account_favorite WHERE account_id=$1 AND inv_id=$2'
    const data = await pool.query(sql, [accountId, inv_id])
    return data.rowCount > 0 ? true : false
    //return data
  } catch (error) {
    new Error("Inventory Check Error")
  }
}

/* ***************************
  Adds vehicle to users favorites
* ************************** */
async function addFavorite(inv_id, accountId) {
  try {
    console.log("addFavorite", inv_id, accountId)
    const sql = 'INSERT INTO public.account_favorite(account_id, inv_id) VALUES ($1, $2)'
    const data = await pool.query(sql, [accountId, inv_id])
    //return data.rowCount > 0 ? true : false
    return data
  } catch (error) {
    new Error("Add Inventory Error")
  }
}

/* ***************************
  Adds vehicle to users favorites
* ************************** */
async function removeFavorite(inv_id, accountId) {
  try {
    const sql = 'DELETE FROM public.account_favorite WHERE account_id=$1 AND inv_id=$2'
    const data = await pool.query(sql, [accountId, inv_id])
    //return data.rowCount > 0 ? true : false
    return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* ***************************
  Toggle users vehicle favorite status
* ************************** */
async function toggleVehicleFavorite(inv_id, accountId) {
  try {
    const favorited = await isFavorited(inv_id, accountId);
    console.log("isFavorited", favorited);
    if (favorited) {
      await removeFavorite(inv_id, accountId)
    } else {
      await addFavorite(inv_id, accountId)
    }
    return !favorited;
  } catch (error) {
    new Error("Toggle Inventory Error")
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByDetailId, checkExistingClassification, 
  createNewClassification, createNewInventory, updateInventory, deleteInventoryItem, toggleVehicleFavorite, isFavorited, addFavorite, removeFavorite,
  getAccountFavorites };

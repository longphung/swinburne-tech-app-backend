const express =  require("express");
const router = express.Router();
const {getAllServices} = require("../controllers/services");

router.route("/services").get(getAllServices);

module.exports = router;
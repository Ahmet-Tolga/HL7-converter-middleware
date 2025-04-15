const {Router}=require("express");
const { createHl7v2Message } = require("../controllers/hl7v3.controller");

const v3Router=Router();

v3Router.post("/createHlv3",createHl7v2Message);


module.exports=v3Router;

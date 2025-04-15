const {Router}=require("express");
const { createHl7v3Message } = require("../controllers/hl7v2.controller");

const v2Router=Router();

v2Router.post("/createHlv2",createHl7v3Message);

module.exports=v2Router;

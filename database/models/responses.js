const { json } = require("express");
const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
mat: {type: String},
id: {type: String},
email: {type: String},
resp: {type: Array},
result: {type: Number},
type: {type: String}
});

module.exports = mongoose.model('responses', LevelSchema);
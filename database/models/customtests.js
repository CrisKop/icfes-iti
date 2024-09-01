const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
mat: {type: String},
creator: {type: String},
customid: {type: String},
questions: {type: String},
});

module.exports = mongoose.model('customtests', LevelSchema);
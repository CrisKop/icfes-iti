const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
module: {type: String},
array: {type: Array}
});

module.exports = mongoose.model('cods', LevelSchema);
const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
mat: {type: String},
type: {type: Number},
cod: {type: Number},
question: {type: Number},
filename: {type: String},
respuesta: {type: Number},
cantidadrespuestas: {type: Number}
});

module.exports = mongoose.model('questions', LevelSchema);
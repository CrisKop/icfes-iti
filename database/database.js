const mongoose = require("mongoose");
module.exports = mongoose.connect("mongodb+srv://cluster0-mjsvu.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true, user: process.env.db_user, pass: process.env.db_pass, dbName: 'icfes'})
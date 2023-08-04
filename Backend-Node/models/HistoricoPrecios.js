const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    idProducto:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Productos",
    },
    price:{
        type: Number,
        required: false,
    },
    date:{
        type: Date,
        required: true,
    },

});


module.exports = mongoose.model('HistoricoPrecios', itemSchema);
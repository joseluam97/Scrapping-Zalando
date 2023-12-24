const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    idProducto:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Productos",
    },
    talla:{
        type: String,
        required: false,
    },
    price:{
        type: Number,
        required: false,
    },
    date:{
        type: Date,
        required: true,
    },
    disponible:{
        type: Boolean,
        required: false,
    },

});


module.exports = mongoose.model('HistoricoPrecios', itemSchema);
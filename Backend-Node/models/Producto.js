const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    id_zalando:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    color:{
        type: String,
        required: true,
    },
    brand:{
        type: String,
        required: true,
    },
    imagen:{
        type: String,
        required: true,
    },
    link:{
        type: String,
        required: true,
    }

});


module.exports = mongoose.model('Productos', itemSchema);
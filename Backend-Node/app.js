const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Conectado a BD'))

//Importar Rutas
const productosRouter = require('./routes/productos');
const historicoPreciosRouter = require('./routes/historicoPrecios');

//Middleware
app.use(cors());
app.use(express.json())
app.use('/productos', productosRouter);
app.use('/prices', historicoPreciosRouter);

//Rutas
app.get('/', (req, res) => {
    res.send('HOME');
})

//Start
app.listen((process.env.PORT || 3000), function () {
    console.log('Servidor iniciado en el puerto ' + (process.env.PORT || 3000));
});


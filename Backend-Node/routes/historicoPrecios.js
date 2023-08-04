const express = require('express');
const router = express.Router();

//Modelos
const HistoricoPrecios = require('../models/HistoricoPrecios');
const historicoPrecios = require("../controllers/historicoPrecios.controller");


router.get("/:id", function (req, res) {
  const { id } = req.params;
  HistoricoPrecios.findById(id, {}, function (err, historicoPrecios) {
    res.status(200).send(historicoPrecios);
  });
});

router.get('/byProduct/:id', historicoPrecios.getPricesByProduct);

router.post('/', historicoPrecios.postHistoricoPrecios);
router.put("/:id", historicoPrecios.putHistoricoPrecios);

router.get("/", function (req, res) {
  HistoricoPrecios.find({}, function (err, historicoPrecios) {
    res.status(200).send(historicoPrecios);
  });
});


router.delete("/:id", function (req, res) {
  const { id } = req.params;
  HistoricoPrecios.findByIdAndRemove(id, (error, historicoPrecios) => {
    if (!error) {
      console.log(historicoPrecios)
    }
  });
});

module.exports = router;
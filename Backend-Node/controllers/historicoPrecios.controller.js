const HistoricoPrecios = require("../models/HistoricoPrecios");

const historicoPreciosCtrl = {};
/*
historicoPreciosCtrl.getHistoricoPrecios = async (req, res) => {
  const citas = await Citas.find();
  res.json(citas);
};

historicoPreciosCtrl.getHistoricoPreciosById = async (req, res) => {
  const { id } = req.params;
  const cita = await Citas.findById(id);
  res.json(cita);
};*/

historicoPreciosCtrl.getPricesByProduct = async(req, res) => {
  try {
    const { id } = req.params;
		const prices = await HistoricoPrecios.find({ idProducto: id })

		res.send(prices)
	} catch {
		res.status(404)
		res.send({ error: "Post doesn't exist!" })
	}
};

historicoPreciosCtrl.postHistoricoPrecios = async(req, res) => {
  console.log(req.body);
  const historicoPrecios = new HistoricoPrecios({
    idProducto: req.body.idProducto,
    price: req.body.price,
    date: new Date(),
  });
  try{
      const newHistoricoPrecios = await historicoPrecios.save();
      res.json(newHistoricoPrecios);
  }catch(err){
      console.log(err);
      res.json({message: err.message});
  }
};

historicoPreciosCtrl.putHistoricoPrecios = async (req, res) => {
  try {
		const post = await HistoricoPrecios.findOne({ _id: req.params.id })

		if (req.body.idProducto) {
			post.idProducto = req.body.idProducto
		}
		if (req.body.price) {
			post.price = req.body.price
		}
    if (req.body.date) {
			post.date = req.body.date
		}

		await post.save()
		res.send(post)
	} catch {
		res.status(404)
		res.send({ error: "Post doesn't exist!" })
	}
};


module.exports = historicoPreciosCtrl;
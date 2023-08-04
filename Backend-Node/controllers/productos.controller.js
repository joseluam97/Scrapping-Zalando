const Producto = require("../models/Producto");

const productoCtrl = {};
/*
productoCtrl.getProducto = async (req, res) => {
  const citas = await Citas.find();
  res.json(citas);
};

productoCtrl.getProductoById = async (req, res) => {
  const { id } = req.params;
  const cita = await Citas.findById(id);
  res.json(cita);
};*/

productoCtrl.getAllBrand = async (req, res) => {

  const allProduct = await Producto.find({})

  // Utilizar un Set para almacenar marcas únicas
  const uniqueBrandsSet = new Set();

  // Recorrer el vector de objetos JSON y agregar las marcas únicas al Set
  for (const obj of allProduct) {
    uniqueBrandsSet.add(obj.brand);
  }

  // Convertir el Set en un array de marcas únicas
  const uniqueBrandsArray = Array.from(uniqueBrandsSet);

  res.json(uniqueBrandsArray);

};

productoCtrl.postProducto = async(req, res) => {
  console.log(req.body);
  const producto = new Producto({
    name: req.body.name,
    brand: req.body.brand,
    imagen: req.body.imagen,
    link: req.body.link,
  });
  try{
      const newProducto = await producto.save();
      res.json(newProducto);
  }catch(err){
      console.log(err);
      res.json({message: err.message});
  }
};

productoCtrl.putProducto = async (req, res) => {
  try {
		const post = await Producto.findOne({ _id: req.params.id })

		if (req.body.name) {
			post.name = req.body.name
		}
    if (req.body.brand) {
			post.brand = req.body.brand
		}
    if (req.body.imagen) {
			post.imagen = req.body.imagen
		}
    if (req.body.link) {
			post.link = req.body.link
		}

		await post.save()
		res.send(post)
	} catch {
		res.status(404)
		res.send({ error: "Post doesn't exist!" })
	}
};


module.exports = productoCtrl;
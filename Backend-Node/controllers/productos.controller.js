const Productos = require("../models/Producto");
const Precios = require("../models/HistoricoPrecios");

const { ObjectId } = require('mongodb');

const productoCtrl = {};
const marcasFiltradas = ["Nike", "Adidas", "Vans", "Converse", "New Balance", "Puma", "Jordan"];

productoCtrl.getBestOffertByBrand = async (req, res) => {
  const { brand } = req.body

  const productsFilter = await Productos.find({ brand: brand });
  vectorResultado = []

  for (const producto of productsFilter) {
    const idProducto = producto._id;

    // Obtener los precios del producto ordenados por fecha
    const precios = await HistoricoPrecios
      .find({ idProducto })
      .sort({ date: 1 }) // Orden ascendente por fecha


    if (precios.length >= 2) {
      const primerPrecio = precios[0].price;
      const ultimoPrecio = precios[precios.length - 1].price;
      const penultimoPrecio = precios[precios.length - 2].price;

      const diferenciaUltimoPrimer = ultimoPrecio - primerPrecio;
      const diferenciaUltimoPenultimo = ultimoPrecio - penultimoPrecio;

      vectorResultado.push({
        "name": producto.name,
        "diferenciaUltimoPrimer": diferenciaUltimoPrimer,
        "diferenciaUltimoPenultimo": diferenciaUltimoPenultimo
      })


    }

  }

  resultadoFinal = vectorResultado.sort((a, b) => b.diferenciaUltimoPrimer - a.diferenciaUltimoPrimer);

  res.json(resultadoFinal);
};

productoCtrl.getAllBrand = async (req, res) => {

  const marcasUnicas = await Productos.distinct("brand", {
    brand: { $regex: new RegExp(marcasFiltradas.join("|"), "i") }
  });

  res.status(200).send(marcasUnicas);

};

productoCtrl.postProducto = async (req, res) => {
  console.log(req.body);
  const producto = new Productos({
    name: req.body.name,
    brand: req.body.brand,
    imagen: req.body.imagen,
    link: req.body.link,
  });
  try {
    const newProducto = await producto.save();
    res.json(newProducto);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message });
  }
};

productoCtrl.putProducto = async (req, res) => {
  try {
    const post = await Productos.findOne({ _id: req.params.id })

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

productoCtrl.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Productos.findById(id);

    const pipeline = [
      {
        $match: {
          idProducto: ObjectId(id)
        }
      },
      {
        $sort: {
          date: -1
        }
      },
      {
        $group: {
          _id: "$idProducto",
          precio_actual: {
            $first: "$price"
          },
          precios: {
            $push: "$price"
          }
        }
      }
    ];

    const preciosAggregados = await Precios.aggregate(pipeline);

    const precio_medio = preciosAggregados.length > 0
      ? parseFloat((preciosAggregados[0].precios.reduce((acc, curr) => acc + curr, 0) / preciosAggregados[0].precios.length))
      : 0;

    const precio_actual = preciosAggregados.length > 0 ? preciosAggregados[0].precio_actual : 0

    const diferencia_porcentual = -1 * (((precio_medio * 100) / precio_actual) - 100);

    const productoConPrecios = {
      ...producto._doc,
      precio_actual,
      precio_medio,
      diferencia_porcentual: parseFloat(diferencia_porcentual)
    };

    res.status(200).send(productoConPrecios);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

productoCtrl.getAllProduct = async (req, res) => {
  try {
    // Agregación para obtener los productos con sus precios actuales y medios
    const productosConPrecios = await Productos.aggregate([
      {
        $match: {
          brand: {
            $regex: marcasFiltradas.join('|'),
            $options: 'i',
          },
        }
      },
      {
        $lookup: {
          from: "historicoprecios",
          localField: "_id",
          foreignField: "idProducto",
          as: "historicoprecios",
        },
      },
      {
        $addFields: {
          precio_actual: {
            $let: {
              vars: {
                ultimoPrecio: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$historicoprecios",
                        as: "precio",
                        cond: {
                          $eq: ["$$precio.date", { $max: "$historicoprecios.date" }],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$ultimoPrecio.price",
            },
          },
          precio_medio: {
            $avg: "$historicoprecios.price",
          },
          diferencia_porcentual: {
            $multiply: [
              {
                $subtract: [{
                  $divide: [
                    {
                      $multiply: [{ $avg: "$historicoprecios.price" }, 100]
                    },
                    {
                      $let: {
                        vars: {
                          ultimoPrecio: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$historicoprecios",
                                  as: "precio",
                                  cond: {
                                    $eq: ["$$precio.date", { $max: "$historicoprecios.date" }],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: "$$ultimoPrecio.price",
                      }
                    }
                  ]
                }, 100]
              },
              -1,
            ],
          },
        },
      },
    ]);

    res.status(200).send(productosConPrecios);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = productoCtrl;
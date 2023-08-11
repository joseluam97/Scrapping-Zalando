const Productos = require("../models/Producto");
const Precios = require("../models/HistoricoPrecios");

const { ObjectId } = require('mongodb');

const productoCtrl = {};
/*
productoCtrl.getProducto = async (req, res) => {
  const citas = await Citas.find();
  res.json(citas);
};
*/
productoCtrl.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Productos.findById(id);

    const pipeline = [
      {
        $match: {
          idProducto: ObjectId(id) // Reemplaza esto con el ID del producto que estás buscando
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
      ? parseFloat((preciosAggregados[0].precios.reduce((acc, curr) => acc + curr, 0) / preciosAggregados[0].precios.length).toFixed(2))
      : 0;

    const precio_actual = preciosAggregados.length > 0 ? preciosAggregados[0].precio_actual : 0

    const diferencia_porcentual = -1 * (((precio_medio * 100) / precio_actual) - 100);

    const productoConPrecios = {
      ...producto._doc,
      precio_actual,
      precio_medio,
      diferencia_porcentual: parseFloat(diferencia_porcentual.toFixed(2)),
    };

    res.status(200).send(productoConPrecios);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

productoCtrl.getBestOffertByBrand = async (req, res) => {
  const { brand } = req.body

  /*Productos.find({ brand: brand }, function (err, producto) {
    if (err) {
      console.error('Error al obtener los productos:', err);
      res.status(500).json({ error: 'Error al obtener los productos' });
    } else {
      res.status(200).json(producto);
    }
  });*/

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

  const allProduct = await Productos.find({})

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


productoCtrl.getAllProduct = async (req, res) => {
  try {
    // Obtener todos los productos y precios
    const productos = await Productos.find({});
    const precios = await Precios.find({});

    // Organizar los precios por idProducto
    const preciosPorProducto = {};
    precios.forEach((precio) => {
      if (!preciosPorProducto[precio.idProducto]) {
        preciosPorProducto[precio.idProducto] = [];
      }
      preciosPorProducto[precio.idProducto].push(precio);
    });

    // Calcular precio_actual y precio_medio para cada producto
    const productosConPrecios = productos.map((producto) => {
      const preciosProducto = preciosPorProducto[producto._id] || [];

      // Obtener el precio más reciente
      const ultimoPrecio = preciosProducto.reduce((max, precio) =>
        (new Date(precio.date) > new Date(max.date)) ? precio : max
        , preciosProducto[0]);

      // Calcular precio_medio
      const precio_actual = ultimoPrecio ? ultimoPrecio.price : 0
      const sumaPrecios = preciosProducto.reduce((suma, precio) => suma + precio.price, 0);
      const precioMedio = preciosProducto.length ? sumaPrecios / preciosProducto.length : 0;
      const diferencia_porcentual = -1 * (((precioMedio * 100) / precio_actual) - 100);

      return {
        ...producto.toObject(),
        precio_actual: precio_actual,
        precio_medio: parseFloat(precioMedio.toFixed(2)),
        diferencia_porcentual: parseFloat(diferencia_porcentual.toFixed(2)),
      };
    });

    res.status(200).send(productosConPrecios);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = productoCtrl;
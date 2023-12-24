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


productoCtrl.getProductoByIdZalando = async (req, res) => {

  const id_producto_zalando = req.params.id_zalando;

  const productoFind = await Productos.findOne({ id_zalando: id_producto_zalando })

  if (productoFind == null) {
    res.status(200).json({});
  } else {
    res.status(200).json(productoFind);
  }

};

productoCtrl.postProducto = async (req, res) => {
  console.log(req.body);
  const producto = new Productos({
    id_zalando: req.body.id_zalando,
    name: req.body.name,
    color: req.body.color,
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

    if (req.body.id_zalando) {
      post.id_zalando = req.body.id_zalando
    }
    if (req.body.name) {
      post.name = req.body.name
    }
    if (req.body.color) {
      post.color = req.body.color
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
    const idProducto = req.params.id;
    const tallaProvided = req.query.talla;

    if(tallaProvided == undefined || tallaProvided == ""){
      return res.status(404).json({ error: 'Debe proporcionar una talla' });
    }

    // Obtener información básica del producto
    const producto = await Productos.findById(idProducto);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Utilizar el modelo HistoricoPrecio para realizar la consulta
    const precios = await Precios.find({
      idProducto,
      talla: tallaProvided,
    }).sort({ date: -1 }); // Ordenar por fecha descendente para obtener el precio más reciente primero

    if (precios.length === 0) {
      return res.status(404).json({ error: 'No hay registros de precios para el producto y talla proporcionados' });
    }

    // Obtener el precio actual (más reciente)
    const precioActual = precios[0].price;

    // Formatear el vector de precios con fecha y precio
    const vectorPrecios = precios.map(precio => ({ fecha: precio.date, precio: precio.price }));

    // Calcular estadísticas de precios
    const precioMaximo = Math.max(...precios.map(precio => precio.price));
    const precioMinimo = Math.min(...precios.map(precio => precio.price));
    const precioMedio = precios.reduce((sum, precio) => sum + precio.price, 0) / precios.length;

    // Calcular porcentaje de cambio, manejando la posibilidad de que el precio medio sea cero
    let porcentajeCambio = 0
    if(precioActual != precioMedio){
      porcentajeCambio = (precioActual - precioMedio)/(precioMedio*100)
    }
    
    const respuesta = {
      producto,
      estadisticasPrecios: {
        precioActual,
        porcentajeCambio,
        precioMaximo,
        precioMinimo,
        precioMedio,
        numeroRegistros: precios.length,
        vectorPrecios,
      },
    };

    res.json(respuesta);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

productoCtrl.getAllProduct = async (req, res) => {
  try {
    // Agregación para obtener los productos con sus precios actuales y medios
    const tallaProvided = req.query.talla;

    let productosConPrecios = [];

    if(tallaProvided == undefined){
      productosConPrecios = await Productos.find({})
    }
    else{
      productosConPrecios = await Precios.aggregate([
        {
          $match: {
            talla: tallaProvided,
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $group: {
            _id: '$idProducto',
            precio_actual_talla: { $first: '$price' },
            disponible: { $first: '$disponible' },
            precios: { $push: '$price' }, // Agregar todos los precios a un array
          },
        },
        {
          $lookup: {
            from: 'productos', // Nombre de la colección de productos
            localField: '_id',
            foreignField: '_id',
            as: 'producto',
          },
        },
        {
          $unwind: '$producto',
        },
        {
          $project: {
            _id: '$producto._id',
            name: '$producto.name',
            color: '$producto.color',
            brand: '$producto.brand',
            imagen: '$producto.imagen',
            link: '$producto.link',
            precio_actual_talla: 1,
            disponible: 1,
            precio_medio: { $avg: '$precios' }, // Calcular el precio medio
            porcentaje_cambio: {
              $cond: {
                if: { $ne: [{ $avg: '$precios' }, 0] }, // Evitar la división por cero
                then: {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ['$precio_actual_talla', { $avg: '$precios' }] },
                        { $avg: '$precios' },
                      ],
                    },
                    100,
                  ],
                },
                else: 0, // En caso de división por cero, establecer el porcentaje a 0
              },
            },
          },
        },
      ]);
    }

    res.status(200).send(productosConPrecios);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
};

productoCtrl.getCheckProductHavePrices = async (req, res) => {
  try {
    // Obtener la fecha y hora actual
    const fechaActual = new Date();

    // Convertir la fecha a un rango para el día actual
    const inicioDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 0, 0, 0);
    const finDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() + 1, 0, 0, 0);

    // Obtener productos que NO tienen un precio para el día actual
    const productosSinPrecioHoy = await Productos.find({
      _id: {
        $nin: await Precios.distinct('idProducto', {
          date: {
            $gte: inicioDia,
            $lt: finDia,
          },
        }),
      },
    });

    console.log("Hay un total de " +productosSinPrecioHoy.length+ " productos sin precio a dia de hoy.")

    res.status(200).send(productosSinPrecioHoy);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = productoCtrl;
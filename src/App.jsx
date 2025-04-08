import { useState, useEffect ,Fragment} from 'react';
import Swal from 'sweetalert2';
import './App.css'

function App() {
  const [name, setName] = useState('')
  const [features, setFeatures] = useState('')
  const [price, setPrice] = useState('')
  const [year, setYear] = useState('')
  const [products, setProducts] = useState([])

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  const addProduct = async (e) => {
    e.preventDefault() //evita que recargue la pagina
    console.log(`producto creado: ${name}, ${features}, ${price}, ${year}`)

    const newProduct = {
      name,
      data:{
        features,
        price,
        year
      },
    }

    try {
      const response = await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(newProduct)   
      });

      const data = await response.json();
      console.log('respuesta API',data);

      const updatedProducts = [...products, data];
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      if (!response.ok) {        
        throw new Error('Error al crear el producto');
      }

      Swal.fire({
        icon: 'success',
        title: 'Producto creado',
        text: 'El producto se ha creado correctamente',
      })
      console.log('productos guardados en localStorage:', localStorage.getItem('products'));

      //dejar los campos en blanco
      setName('');
      setFeatures('');
      setPrice('');
      setYear('');
      
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Ups...',
        text: error.message || 'Ocurrió un error al crear el producto',
      })
    }
    
  }
  

  const editProduct = async (id) => {
    const productToEdit = products.find((product) => product.id === id);

    //formulario de swal:
    const { value: formValues } = await Swal.fire({
      title: 'Editar producto',
      html: `
        <div class="swal-form-row">
          <label for="swal-input1">Nombre:</label>
          <input id="swal-input1" class="swal2-input swal-fixed" value="${productToEdit.name}">
        </div>
        <div class="swal-form-row">
          <label for="swal-input2">Caract.:</label>
          <input id="swal-input2" class="swal2-input swal-fixed" value="${productToEdit.data.features}">
        </div>
        <div class="swal-form-row">
          <label for="swal-input3">Precio:</label>
          <input id="swal-input3" class="swal2-input swal-fixed" value="${productToEdit.data.price}">
        </div>
        <div class="swal-form-row">
          <label for="swal-input4">Año:</label>
          <input id="swal-input4" class="swal2-input swal-fixed" value="${productToEdit.data.year}">
        </div>
      `,
      customClass: {
        htmlContainer: 'swal-form-container'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
          const name = document.getElementById('swal-input1').value;
          const features = document.getElementById('swal-input2').value;
          const price = document.getElementById('swal-input3').value;
          const year = document.getElementById('swal-input4').value;
          
          const newProduct = {
            name,
            data:{
              features,
              price,
              year
            },
          }

          return newProduct
      }
    });

    if (!formValues) {
      console.log('no se han guardado los cambios');
      return;
    }
    
    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${id}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(formValues)  
      });
      const data = await response.json();
      console.log('respuesta API', data);
      const updatedProducts = products.map((product) => {
        return product.id === id ? data : product;
      });
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      console.log('productos guardados en localStorage:', localStorage.getItem('products'));

      if (!response.ok) {
        throw new Error('Error al editar el producto');
      }

      Swal.fire({
        icon: 'success',
        title: 'Producto editado',
        text: 'El producto se ha editado correctamente',  
      })

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Ups...',
        text: error.message || 'Ocurrió un error al editar el producto',
      })
    }
  }

  
  const deleteProduct = async (id) => {
    const confirmResult = await Swal.fire({
      title: 'Eliminar producto',
      text: '¿Estas seguro de que deseas eliminar este producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar',
    });
  
    if (!confirmResult.isConfirmed) {
      console.log('no se ha eliminado el producto');
      return;
    }
    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      console.log('respuesta API', data);
      
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          text: 'El producto se ha eliminado correctamente',
        })

        const updatedProducts = products.filter((product)=> product.id !== id);
        setProducts (updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        console.log('localStorage actualizada:', localStorage.getItem('products'));
        
      } else {
        console.log('no se pudo eliminar el producto');
        throw new Error('Error al eliminar el producto');
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Ups...',
        text: error.message || 'Ocurrió un error al eliminar el producto',
      })
    }
  };


  return (
    <Fragment>
      <header>
        <h1>CRUD API REST</h1>
      </header>
      
      <section>
        <h2>Crear un nuevo producto</h2>
        
          <form onSubmit={addProduct}>
            <fieldset>
              <legend>Información del producto</legend>
              <div className='fieldAddProduct'>
                <label htmlFor="name">Nombre del producto: </label>
                <input
                id='name' 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Ej: Teclado'
                required
                />
              </div>
              
              <div className='fieldAddProduct'>
                <label htmlFor="features">Características: </label>
                <input
                  id='features' 
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder='Ej: Mecánico, retroiluminado'
                  required
                />
              </div>
              
              <div className='fieldAddProduct' >
                <label htmlFor="price">Precio: </label>
                <input
                  id='price' 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  // onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : 0)}
                  placeholder='Ej: 1000'
                  required
                />
              </div>

              <div className='fieldAddProduct'>
                <label htmlFor="year">Año: </label>
                <input
                  id='year' 
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  placeholder='Ej: 2025'
                  required
                />
              </div>
              
              <button type='submit' style={{ marginTop: '1rem' }}>Crear producto</button>
            </fieldset>
          </form>

          
      </section>
      
      <section>
        <h2>Lista de productos</h2>
        
        <table>  
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Características</th>
              <th>Precio</th>
              <th>Año</th>
            </tr>
          </thead>
          
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.data.features}</td>
                <td>${product.data.price}</td>
                <td>{product.data.year}</td>
                <td>
                  <button onClick={() => product.id && editProduct(product.id)}>Editar</button>
                </td>
                <td>
                  <button onClick={() => product.id && deleteProduct(product.id)}>Eliminar</button>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </section>
  
    </Fragment>
  )
}

export default App

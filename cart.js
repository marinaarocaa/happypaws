// Sistema de Carrito de Compras

// Estructura de datos del carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Productos disponibles en la tienda
const products = [
    { id: 1, name: 'Comedero perros', price: 15, image: 'IMAGENES/comedero-perro.jpg' },
    { id: 2, name: 'Pelota perros', price: 5, image: 'IMAGENES/pelota.webp' },
    { id: 3, name: 'Cepillo', price: 12, image: 'IMAGENES/cepillo.jpg' },
    { id: 4, name: 'Transportin', price: 35, image: 'IMAGENES/transportin.jpg' },
    { id: 5, name: 'Juguete gato', price: 5, image: 'IMAGENES/raton.avif' },
    { id: 6, name: 'Bola Hamster', price: 8, image: 'IMAGENES/bola-hamster.jpg' },
    { id: 7, name: 'Correa', price: 10, image: 'IMAGENES/correa.webp' },
    { id: 8, name: 'Cama gatos', price: 30, image: 'IMAGENES/cama-gatos.jpg' },
    { id: 9, name: 'Cuerda', price: 5, image: 'IMAGENES/cuerda.avif' },
    { id: 10, name: 'Pienso gatos', price: 15, image: 'IMAGENES/pienso-gatos.avif' }
];

// Función para agregar producto al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    if (!product) {
        console.error('Producto no encontrado');
        return;
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Mostrar notificación
    showNotification(`${product.name} agregado al carrito`);

    // Actualizar el carrito en la página de perfil si está abierta
    updateCartDisplay();
}

// Función para eliminar producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Producto eliminado del carrito');
}

// Función para actualizar la cantidad de un producto
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

// Función para calcular el total del carrito
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
    const cartContainer = document.getElementById('cartContainer');
    const cartTotal = document.getElementById('cartTotal');
    const totalAmount = document.getElementById('totalAmount');

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: #777; font-size: 14px;">Tu carrito está vacío.</p>';
        if (cartTotal) cartTotal.style.display = 'none';
        return;
    }

    // Mostrar productos en el carrito
    cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-price">${item.price}€</p>
      </div>
      <div class="cart-item-quantity">
        <button onclick="updateQuantity(${item.id}, -1)" class="qty-btn">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)" class="qty-btn">+</button>
      </div>
      <button onclick="removeFromCart(${item.id})" class="remove-btn">🗑️</button>
    </div>
  `).join('');

    // Mostrar total
    if (cartTotal && totalAmount) {
        cartTotal.style.display = 'block';
        totalAmount.textContent = `${calculateTotal()}€`;
    }
}

// Función para mostrar notificaciones
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para proceder al pago
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    const total = calculateTotal();
    alert(`Total a pagar: ${total}€\n\nGracias por tu compra. Los fondos se destinarán al cuidado de nuestros animales.`);

    // Vaciar carrito
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    // Actualizar visualización del carrito si estamos en la página de perfil
    updateCartDisplay();

    // Agregar event listener al botón de checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }

    // Agregar event listeners a todos los botones "Añadir al carrito"
    const addToCartButtons = document.querySelectorAll('.tarjetas-tienda button');
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            addToCart(index + 1); // Los IDs de productos empiezan en 1
        });
    });
});

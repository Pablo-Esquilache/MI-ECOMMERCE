document.addEventListener('DOMContentLoaded', () => {
    let carrito = JSON.parse(localStorage.getItem('cart')) || [];
    if (carrito.length === 0) {
        window.location.href = '/';
        return;
    }
    renderSummary();
    calcularEnvio(); // Calcular un envío inicial por defecto

    document.getElementById('checkout-form').addEventListener('submit', procesarCheckout);
});

let subtotalCheckout = 0;
let costoEnvioFinal = 0;

function renderSummary() {
    let carrito = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('checkout-items');
    subtotalCheckout = 0;
    
    carrito.forEach(item => {
        subtotalCheckout += item.precio * item.cantidad;
        container.innerHTML += `
            <div class="summary-item">
                <span>${item.cantidad}x ${item.nombre}</span>
                <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
        `;
    });
    
    document.getElementById('resumen-subtotal').innerText = `$${subtotalCheckout.toFixed(2)}`;
}

async function calcularEnvio() {
    // Shipping is disabled for now, all calculations are skipped and cost is 0.
    costoEnvioFinal = 0;
    
    const total = subtotalCheckout + costoEnvioFinal;
    const resumenTotalEl = document.getElementById('resumen-total');
    if (resumenTotalEl) {
        resumenTotalEl.innerText = `$${total.toFixed(2)}`;
    }
}

async function procesarCheckout(e) {
    e.preventDefault();
    const carrito = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cliente = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        genero: document.getElementById('genero').value,
        direccion: document.getElementById('direccion').value,
        ciudad: document.getElementById('ciudad').value,
        provincia: document.getElementById('provincia').value,
        codigo_postal: document.getElementById('codigo_postal').value
    };

    const metodo_pago = document.getElementById('metodo_pago').value;
    
    // Método de envío para el backend (podría ser un selector)
    const metodo_envio = costoEnvioFinal === 0 ? 'promocion' : 'domicilio';

    const payload = {
        cliente,
        carrito,
        metodo_pago,
        metodo_envio
    };

    try {
        const btn = document.querySelector('button[type="submit"]');
        btn.innerText = "Procesando...";
        btn.disabled = true;

        const response = await fetch('http://localhost:3000/api/pedidos/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            // Vaciar carrito
            localStorage.removeItem('cart');
            
            if (metodo_pago === 'mercadopago' && data.mpUrl) {
                // Redirigir a MercadoPago
                window.location.href = data.mpUrl;
            } else {
                alert(`¡Pedido #${data.pedido.id} confirmado con éxito! Nos comunicaremos vía email.`);
                window.location.href = '/';
            }
        } else {
            alert('Error al procesar el pedido: ' + data.error);
            btn.innerText = "Confirmar Pedido";
            btn.disabled = false;
        }

    } catch (error) {
        console.error(error);
        alert('Ocurrió un error inesperado de red.');
        document.querySelector('button[type="submit"]').disabled = false;
    }
}

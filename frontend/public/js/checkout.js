document.addEventListener('DOMContentLoaded', () => {
    let carrito = JSON.parse(localStorage.getItem('cart')) || [];
    if (carrito.length === 0) {
        window.location.href = '/';
        return;
    }
    renderSummary();
    calcularEnvio(); // Calcular un envío inicial por defecto
    inicializarGeoRef(); // Iniciar selectores de GeoRef

    document.getElementById('checkout-form').addEventListener('submit', procesarCheckout);

    const metodoPagoSelect = document.getElementById('metodo_pago');
    const datosBancariosDiv = document.getElementById('datos-bancarios');

    if (metodoPagoSelect && datosBancariosDiv) {
        metodoPagoSelect.addEventListener('change', async (e) => {
            if (e.target.value === 'transferencia') {
                datosBancariosDiv.style.display = 'block';
                try {
                    const res = await fetch('/api/configuracion');
                    const conf = await res.json();
                    document.getElementById('b_banco').innerText = conf.banco_nombre || '-';
                    document.getElementById('b_titular').innerText = conf.banco_titular || '-';
                    document.getElementById('b_cuit').innerText = conf.banco_cuit || '-';
                    document.getElementById('b_cbu').innerText = conf.banco_cbu || '-';
                    document.getElementById('b_alias').innerText = conf.banco_alias || '-';
                } catch (err) {
                    console.error('Error cargando los datos bancarios:', err);
                }
            } else {
                datosBancariosDiv.style.display = 'none';
            }
        });

        // Trigger the check once on initialization
        metodoPagoSelect.dispatchEvent(new Event('change'));
    }
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

        const response = await fetch('/api/pedidos/checkout', {
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

// --- Integración API GeoRef / Argentina ---
async function inicializarGeoRef() {
    const provSelect = document.getElementById('provincia');
    const ciudadSelect = document.getElementById('ciudad');
    if(!provSelect || !ciudadSelect) return;

    try {
        const provRes = await fetch('https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre&max=100');
        const provData = await provRes.json();
        
        // Ordenar alfabéticamente
        provData.provincias.sort((a,b) => a.nombre.localeCompare(b.nombre));
        
        provSelect.innerHTML = '<option value="">Seleccione Provincia...</option>';
        provData.provincias.forEach(p => {
            provSelect.innerHTML += `<option value="${p.nombre}" data-id="${p.id}">${p.nombre}</option>`;
        });

        provSelect.addEventListener('change', async (e) => {
            const selectedOption = provSelect.options[provSelect.selectedIndex];
            const provId = selectedOption.getAttribute('data-id');
            
            if (!provId) {
                ciudadSelect.innerHTML = '<option value="">Seleccionar provincia primero...</option>';
                ciudadSelect.disabled = true;
                return;
            }

            ciudadSelect.innerHTML = '<option value="">Cargando ciudades...</option>';
            ciudadSelect.disabled = true;

            try {
                // Usamos municipios (partidos/departamentos) para asegurar que quepan en el max=1000
                const muniRes = await fetch(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${provId}&campos=nombre&max=1000`);
                const muniData = await muniRes.json();
                
                muniData.municipios.sort((a,b) => a.nombre.localeCompare(b.nombre));
                
                ciudadSelect.innerHTML = '<option value="">Seleccione Ciudad...</option>';
                // Evitamos duplicados sutiles si hay nombres iguales aunque técnicamente todos los municipios son distintos
                muniData.municipios.forEach(m => {
                    ciudadSelect.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`;
                });
                ciudadSelect.disabled = false;
            } catch (err) {
                console.error("Error cargando ciudades", err);
                ciudadSelect.innerHTML = '<option value="">Error de conexión (Ciudad)</option>';
                ciudadSelect.disabled = false;
            }
        });
    } catch(err) {
        console.error("Error cargando provincias", err);
        provSelect.innerHTML = '<option value="">Error de conexión (Provincia)</option>';
    }
}

// trabajador.js - Lógica del dashboard de trabajador

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const fechaHoraElement = document.getElementById('fechaHora');
    const rutInput = document.getElementById('rut');
    const btnEntrada = document.getElementById('btnEntrada');
    const btnSalida = document.getElementById('btnSalida');
    const mensajeAsistencia = document.getElementById('mensajeAsistencia');
    
    const btnMostrarFormularioMerma = document.getElementById('btnMostrarFormularioMerma');
    const formularioMerma = document.getElementById('formularioMerma');
    const btnRegistrarMerma = document.getElementById('btnRegistrarMerma');
    const btnCancelarMerma = document.getElementById('btnCancelarMerma');
    const mensajeMerma = document.getElementById('mensajeMerma');
    
    // Variables globales
    let rutActual = '';
    
    // Configuración inicial
    btnEntrada.disabled = true;
    btnSalida.disabled = true;
    mensajeAsistencia.style.display = 'none';
    mensajeMerma.style.display = 'none';
    
    // RUTs de ejemplo para probar
    const rutsEjemplo = ['12345678-9', '23456789-0', '34567890-1', '45678901-2'];
    
    // Actualizar fecha y hora cada segundo
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    // Mostrar RUTs de ejemplo
    mostrarRUTsEjemplo();
    
    // Event listeners
    rutInput.addEventListener('input', function() {
        rutActual = this.value.trim();
        verificarEstadoAsistencia();
    });
    
    rutInput.addEventListener('blur', verificarEstadoAsistencia);
    btnEntrada.addEventListener('click', registrarEntrada);
    btnSalida.addEventListener('click', registrarSalida);
    
    btnMostrarFormularioMerma.addEventListener('click', mostrarFormularioMerma);
    btnCancelarMerma.addEventListener('click', ocultarFormularioMerma);
    btnRegistrarMerma.addEventListener('click', registrarMerma);
    
    // Funciones
    function actualizarFechaHora() {
        const ahora = new Date();
        const opciones = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        fechaHoraElement.textContent = ahora.toLocaleDateString('es-CL', opciones);
    }
    
    function mostrarRUTsEjemplo() {
        // Crear un pequeño indicador con RUTs de prueba
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-ruts';
        infoDiv.innerHTML = `
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                <strong>RUTs de prueba:</strong> ${rutsEjemplo.join(', ')}
            </p>
        `;
        rutInput.parentNode.appendChild(infoDiv);
    }
    
    async function verificarEstadoAsistencia() {
        const rut = rutInput.value.trim();
        
        if (rut.length < 10) {
            btnEntrada.disabled = true;
            btnSalida.disabled = true;
            mostrarMensajeAsistencia('Ingrese RUT completo (ej: 12345678-9)', 'info', 3000);
            return;
        }
        
        try {
            mostrarMensajeAsistencia('Verificando...', 'info');
            
            const response = await fetch('api/asistencia.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'verificar',
                    rut: rut
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                mensajeAsistencia.style.display = 'none';
                
                if (!data.tieneEntrada) {
                    btnEntrada.disabled = false;
                    btnSalida.disabled = true;
                    btnEntrada.innerHTML = '🟢 Registrar ENTRADA';
                    btnEntrada.style.backgroundColor = '#16a34a';
                } else if (data.tieneEntrada && !data.tieneSalida) {
                    btnEntrada.disabled = true;
                    btnSalida.disabled = false;
                    btnSalida.innerHTML = '🔴 Registrar SALIDA';
                    btnSalida.style.backgroundColor = '#dc2626';
                    mostrarMensajeAsistencia('✅ Tiene entrada registrada. Puede registrar salida.', 'success', 5000);
                } else {
                    btnEntrada.disabled = true;
                    btnSalida.disabled = true;
                    mostrarMensajeAsistencia('ℹ️ Ya tiene entrada y salida registradas para hoy', 'info', 5000);
                }
            } else {
                btnEntrada.disabled = true;
                btnSalida.disabled = true;
                mostrarMensajeAsistencia(`❌ ${data.message}`, 'error');
            }
        } catch (error) {
            console.error('Error en verificarEstadoAsistencia:', error);
            mostrarMensajeAsistencia('❌ Error de conexión con el servidor', 'error');
        }
    }
    
    async function registrarEntrada() {
        const rut = rutInput.value.trim();
        
        if (rut.length < 10) {
            mostrarMensajeAsistencia('❌ RUT incompleto', 'error');
            return;
        }
        
        try {
            btnEntrada.disabled = true;
            mostrarMensajeAsistencia('Registrando entrada...', 'info');
            
            const response = await fetch('api/asistencia.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'entrada',
                    rut: rut
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                mostrarMensajeAsistencia(`✅ ENTRADA registrada exitosamente a las ${data.hora}`, 'success');
                btnEntrada.disabled = true;
                btnSalida.disabled = false;
                btnSalida.innerHTML = '🔴 Registrar SALIDA';
                btnSalida.style.backgroundColor = '#dc2626';
                
                // Actualizar estado
                setTimeout(verificarEstadoAsistencia, 1000);
            } else {
                mostrarMensajeAsistencia(`❌ ${data.message}`, 'error');
                btnEntrada.disabled = false;
            }
        } catch (error) {
            console.error('Error en registrarEntrada:', error);
            mostrarMensajeAsistencia('❌ Error de conexión con el servidor', 'error');
            btnEntrada.disabled = false;
        }
    }
    
    async function registrarSalida() {
        const rut = rutInput.value.trim();
        
        try {
            btnSalida.disabled = true;
            mostrarMensajeAsistencia('Registrando salida...', 'info');
            
            const response = await fetch('api/asistencia.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'salida',
                    rut: rut
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                let mensaje = `✅ SALIDA registrada exitosamente a las ${data.hora}`;
                mensaje += `\n⏱️ Horas trabajadas: ${data.horas_trabajadas} horas`;
                
                if (data.horas_extra > 0) {
                    mensaje += `\n💰 Se registraron ${data.horas_extra.toFixed(2)} horas extra`;
                }
                
                mostrarMensajeAsistencia(mensaje, 'success');
                btnSalida.disabled = true;
                
                // Actualizar estado
                setTimeout(verificarEstadoAsistencia, 1000);
            } else {
                mostrarMensajeAsistencia(`❌ ${data.message}`, 'error');
                btnSalida.disabled = false;
            }
        } catch (error) {
            console.error('Error en registrarSalida:', error);
            mostrarMensajeAsistencia('❌ Error de conexión con el servidor', 'error');
            btnSalida.disabled = false;
        }
    }
    
    function mostrarMensajeAsistencia(texto, tipo, tiempo = 5000) {
        mensajeAsistencia.textContent = texto;
        mensajeAsistencia.className = 'mensaje ' + tipo;
        mensajeAsistencia.style.display = 'block';
        
        if (tiempo > 0) {
            setTimeout(() => {
                if (mensajeAsistencia.textContent === texto) {
                    mensajeAsistencia.style.display = 'none';
                }
            }, tiempo);
        }
    }
    
    function mostrarFormularioMerma() {
        const rut = rutInput.value.trim();
        
        if (rut.length <= 9) {
            mostrarMensajeMerma('❌ Debe ingresar su RUT primero', 'error');
            return;
        }
        
        formularioMerma.style.display = 'block';
        btnMostrarFormularioMerma.style.display = 'none';
    }
    
    function ocultarFormularioMerma() {
        formularioMerma.style.display = 'none';
        btnMostrarFormularioMerma.style.display = 'block';
        limpiarFormularioMerma();
    }
    
    async function registrarMerma() {
        const rut = rutInput.value.trim();
        const producto = document.getElementById('producto').value.trim();
        const unidades = parseInt(document.getElementById('unidades').value);
        const pesoVolumen = parseFloat(document.getElementById('pesoVolumen').value) || 0;
        const unidadMedida = document.getElementById('unidadMedida').value;
        const observaciones = document.getElementById('observaciones').value.trim();
        
        // Validaciones
        if (!producto) {
            mostrarMensajeMerma('❌ El producto es requerido', 'error');
            return;
        }
        
        if (!unidades || unidades <= 0) {
            mostrarMensajeMerma('❌ Las unidades deben ser mayor a 0', 'error');
            return;
        }
        
        if (rut.length < 10) {
            mostrarMensajeMerma('❌ RUT inválido', 'error');
            return;
        }
        
        try {
            btnRegistrarMerma.disabled = true;
            btnRegistrarMerma.innerHTML = '⌛ Registrando...';
            mostrarMensajeMerma('⌛ Registrando merma...', 'info');
            
            // Depuración: mostrar datos que se enviarán
            console.log('Datos a enviar:', {
                rut: rut,
                producto: producto,
                unidades: unidades,
                peso_volumen: pesoVolumen,
                unidad_medida: unidadMedida,
                observaciones: observaciones
            });
            
            const response = await fetch('api/mermas.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    rut: rut,
                    producto: producto,
                    unidades: unidades,
                    peso_volumen: pesoVolumen,
                    unidad_medida: unidadMedida,
                    observaciones: observaciones
                })
            });
            
            console.log('Respuesta del servidor:', response);
            
            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no JSON:', text);
                throw new Error('El servidor no respondió con JSON');
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            if (data.success) {
                mostrarMensajeMerma('✅ Merma registrada exitosamente', 'success');
                ocultarFormularioMerma();
            } else {
                mostrarMensajeMerma(`❌ ${data.message || 'Error desconocido'}`, 'error');
            }
        } catch (error) {
            console.error('Error completo en registrarMerma:', error);
            mostrarMensajeMerma(`❌ Error: ${error.message}`, 'error');
        } finally {
            btnRegistrarMerma.disabled = false;
            btnRegistrarMerma.innerHTML = '✅ Registrar Merma';
        }
    }
    
    function limpiarFormularioMerma() {
        document.getElementById('producto').value = '';
        document.getElementById('unidades').value = '1';
        document.getElementById('pesoVolumen').value = '';
        document.getElementById('unidadMedida').value = 'kg';
        document.getElementById('observaciones').value = '';
    }
    
    function mostrarMensajeMerma(texto, tipo) {
        mensajeMerma.textContent = texto;
        mensajeMerma.className = 'mensaje ' + tipo;
        mensajeMerma.style.display = 'block';
        
        setTimeout(() => {
            mensajeMerma.style.display = 'none';
        }, 5000);
    }
    
    // Función de utilidad para probar conexión
    async function probarConexionAPI() {
        try {
            const response = await fetch('api/mermas.php?accion=todas');
            const data = await response.json();
            console.log('Prueba de conexión:', data);
            return data.success;
        } catch (error) {
            console.error('Error en prueba de conexión:', error);
            return false;
        }
    }
    
    // Probar conexión al cargar
    probarConexionAPI().then(exito => {
        if (!exito) {
            console.warn('Advertencia: No se pudo conectar a la API de mermas');
        }
    });
});
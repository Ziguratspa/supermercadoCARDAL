// supervisor.js - Lógica del dashboard de supervisor

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const fechaHoraElement = document.getElementById('fechaHora');
    const rutTrabajador = document.getElementById('rutTrabajador');
    const btnBuscarPorRut = document.getElementById('btnBuscarPorRut');
    const selectTrabajador = document.getElementById('selectTrabajador');
    const reporteTrabajador = document.getElementById('reporteTrabajador');
    
    const selectArea = document.getElementById('selectArea');
    const btnBuscarPorArea = document.getElementById('btnBuscarPorArea');
    const reporteArea = document.getElementById('reporteArea');
    
    const btnMermasTotales = document.getElementById('btnMermasTotales');
    const btnMermasDetalladas = document.getElementById('btnMermasDetalladas');
    const reporteMermas = document.getElementById('reporteMermas');
    
    // Actualizar fecha y hora
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    // Cargar lista de trabajadores
    cargarTrabajadores();
    
    // Event listeners
    btnBuscarPorRut.addEventListener('click', buscarPorRut);
    selectTrabajador.addEventListener('change', buscarPorSelect);
    btnBuscarPorArea.addEventListener('click', buscarPorArea);
    btnMermasTotales.addEventListener('click', mostrarMermasTotales);
    btnMermasDetalladas.addEventListener('click', mostrarMermasDetalladas);
    
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
    
    async function cargarTrabajadores() {
        try {
            const response = await fetch('api/reportes.php?tipo=trabajadores');
            const data = await response.json();
            
            if (data.success) {
                selectTrabajador.innerHTML = '<option value="">-- Seleccione un trabajador --</option>';
                data.trabajadores.forEach(trabajador => {
                    const option = document.createElement('option');
                    option.value = trabajador.rut;
                    option.textContent = `${trabajador.primer_nombre} ${trabajador.primer_apellido} - ${trabajador.rut}`;
                    selectTrabajador.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    async function buscarPorRut() {
        const rut = rutTrabajador.value.trim();
        
        if (!rut) {
            reporteTrabajador.innerHTML = '<p class="mensaje error">Ingrese un RUT válido</p>';
            return;
        }
        
        await obtenerReporteTrabajador(rut);
    }
    
    async function buscarPorSelect() {
        const rut = selectTrabajador.value;
        
        if (!rut) return;
        
        rutTrabajador.value = rut;
        await obtenerReporteTrabajador(rut);
    }
    
    async function obtenerReporteTrabajador(rut) {
        try {
            const response = await fetch(`api/reportes.php?tipo=por_trabajador&rut=${rut}`);
            const data = await response.json();
            
            if (data.success) {
                mostrarReporteTrabajador(data);
            } else {
                reporteTrabajador.innerHTML = `<p class="mensaje error">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            reporteTrabajador.innerHTML = '<p class="mensaje error">Error al obtener reporte</p>';
        }
    }
    
    function mostrarReporteTrabajador(data) {
        const t = data.trabajador;
        const areaNombre = formatearArea(t.area);
        
        let html = `
            <div class="reporte-datos">
                <h4>👤 Información del Trabajador</h4>
                <div class="dato-trabajador">
                    <strong>RUT:</strong>
                    <span>${t.rut}</span>
                </div>
                <div class="dato-trabajador">
                    <strong>Nombre:</strong>
                    <span>${t.primer_nombre} ${t.segundo_nombre || ''} ${t.primer_apellido} ${t.segundo_apellido || ''}</span>
                </div>
                <div class="dato-trabajador">
                    <strong>Área:</strong>
                    <span class="badge badge-${t.area}">${areaNombre}</span>
                </div>
                <div class="dato-trabajador">
                    <strong>Fecha Contratación:</strong>
                    <span>${formatearFecha(t.fecha_contratacion)}</span>
                </div>
            </div>
        `;
        
        // Asistencias
        if (data.asistencias.length > 0) {
            html += `
                <div class="reporte-datos">
                    <h4>📋 Registros de Asistencia (Últimos 30 días)</h4>
                    <div class="tabla-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Entrada</th>
                                    <th>Salida</th>
                                    <th>Horas</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            data.asistencias.forEach(asist => {
                const horas = calcularHoras(asist.fecha_hora_entrada, asist.fecha_hora_salida);
                html += `
                    <tr>
                        <td>${formatearFecha(asist.fecha)}</td>
                        <td>${asist.hora_entrada || '-'}</td>
                        <td>${asist.hora_salida || '-'}</td>
                        <td>${horas}</td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        // Asignaciones
        if (data.asignaciones.length > 0) {
            html += `
                <div class="reporte-datos">
                    <h4>💰 Asignaciones</h4>
                    <div class="tabla-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Monto</th>
                                    <th>Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            data.asignaciones.forEach(asig => {
                html += `
                    <tr>
                        <td>${formatearFecha(asig.fecha)}</td>
                        <td>${formatearTipoAsignacion(asig.tipo_asignacion)}</td>
                        <td>${asig.cantidad}</td>
                        <td>$${formatearMonto(asig.monto)}</td>
                        <td>${asig.descripcion}</td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        // Mermas
        if (data.mermas.length > 0) {
            html += `
                <div class="reporte-datos">
                    <h4>📦 Mermas Registradas</h4>
                    <div class="tabla-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha/Hora</th>
                                    <th>Producto</th>
                                    <th>Unidades</th>
                                    <th>Peso/Volumen</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            data.mermas.forEach(merma => {
                html += `
                    <tr>
                        <td>${formatearFechaHora(merma.fecha_registro)}</td>
                        <td>${merma.producto}</td>
                        <td>${merma.unidades}</td>
                        <td>${merma.peso_volumen} ${merma.unidad_medida}</td>
                        <td>${merma.observaciones || '-'}</td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            html += '<div class="reporte-datos"><p>No hay mermas registradas para este trabajador</p></div>';
        }
        
        reporteTrabajador.innerHTML = html;
    }
    
    async function buscarPorArea() {
        const area = selectArea.value;
        
        if (!area) {
            reporteArea.innerHTML = '<p class="mensaje error">Seleccione un área</p>';
            return;
        }
        
        try {
            const response = await fetch(`api/reportes.php?tipo=por_area&area=${area}`);
            const data = await response.json();
            
            if (data.success) {
                mostrarReporteArea(data);
            } else {
                reporteArea.innerHTML = `<p class="mensaje error">${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            reporteArea.innerHTML = '<p class="mensaje error">Error al obtener reporte</p>';
        }
    }
    
    function mostrarReporteArea(data) {
        const areaNombre = formatearArea(data.area);
        
        let html = `
            <div class="reporte-datos">
                <h4>🏢 Resumen del Área: ${areaNombre}</h4>
                <div class="tabla-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Trabajador</th>
                                <th>RUT</th>
                                <th>Días Trabajados (30d)</th>
                                <th>Horas Extra (30d)</th>
                                <th>Mermas (30d)</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        data.trabajadores.forEach(item => {
            const t = item.trabajador;
            html += `
                <tr>
                    <td>${t.primer_nombre} ${t.primer_apellido}</td>
                    <td>${t.rut}</td>
                    <td>${item.dias_trabajados}</td>
                    <td>${item.horas_extra || 0} hrs</td>
                    <td>${item.total_mermas}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        reporteArea.innerHTML = html;
    }
    
    async function mostrarMermasTotales() {
        try {
            const response = await fetch('api/reportes.php?tipo=mermas_totales');
            const data = await response.json();
            
            if (data.success) {
                let html = `
                    <div class="reporte-datos">
                        <h4>📊 Resumen Total de Mermas</h4>
                        <div class="tabla-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Registros</th>
                                        <th>Total Unidades</th>
                                        <th>Total Peso/Volumen</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                data.resumen.forEach(item => {
                    html += `
                        <tr>
                            <td><strong>${item.producto}</strong></td>
                            <td>${item.cantidad_registros}</td>
                            <td>${item.total_unidades}</td>
                            <td>${item.total_peso} ${item.unidad_medida}</td>
                        </tr>
                    `;
                });
                
                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                
                reporteMermas.innerHTML = html;
            }
        } catch (error) {
            console.error('Error:', error);
            reporteMermas.innerHTML = '<p class="mensaje error">Error al obtener reporte</p>';
        }
    }
    
    async function mostrarMermasDetalladas() {
        try {
            const response = await fetch('api/reportes.php?tipo=mermas_totales');
            const data = await response.json();
            
            if (data.success) {
                let html = `
                    <div class="reporte-datos">
                        <h4>📋 Detalle de Todas las Mermas</h4>
                        <div class="tabla-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fecha/Hora</th>
                                        <th>Trabajador</th>
                                        <th>Área</th>
                                        <th>Producto</th>
                                        <th>Unidades</th>
                                        <th>Peso/Vol</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                data.mermas.forEach(merma => {
                    html += `
                        <tr>
                            <td>${formatearFechaHora(merma.fecha_registro)}</td>
                            <td>${merma.nombre_trabajador}</td>
                            <td><span class="badge badge-${merma.area}">${formatearArea(merma.area)}</span></td>
                            <td>${merma.producto}</td>
                            <td>${merma.unidades}</td>
                            <td>${merma.peso_volumen} ${merma.unidad_medida}</td>
                            <td>${merma.observaciones || '-'}</td>
                        </tr>
                    `;
                });
                
                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                
                reporteMermas.innerHTML = html;
            }
        } catch (error) {
            console.error('Error:', error);
            reporteMermas.innerHTML = '<p class="mensaje error">Error al obtener reporte</p>';
        }
    }
    
    // Funciones auxiliares
    function formatearFecha(fecha) {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-CL');
    }
    
    function formatearFechaHora(fechaHora) {
        const d = new Date(fechaHora);
        return d.toLocaleString('es-CL');
    }
    
    function formatearMonto(monto) {
        return new Intl.NumberFormat('es-CL').format(monto);
    }
    
    function formatearArea(area) {
        const areas = {
            'panaderia': 'Panadería',
            'fiambreria': 'Fiambrería',
            'caja': 'Caja',
            'prevencion_perdidas': 'Prevención de Pérdidas',
            'reposicion': 'Reposición',
            'jefatura': 'Jefatura',
            'externo': 'Externo'
        };
        return areas[area] || area;
    }
    
    function formatearTipoAsignacion(tipo) {
        const tipos = {
            'horas_extra': 'Horas Extra',
            'bono_produccion': 'Bono Producción',
            'bono_puntualidad': 'Bono Puntualidad'
        };
        return tipos[tipo] || tipo;
    }
    
    function calcularHoras(entrada, salida) {
        if (!entrada || !salida) return '-';
        
        const e = new Date(entrada);
        const s = new Date(salida);
        const diff = (s - e) / 1000 / 60 / 60;
        
        return diff.toFixed(2) + ' hrs';
    }
});

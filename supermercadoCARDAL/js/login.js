// login.js - Lógica de autenticación

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const mensaje = document.getElementById('mensaje');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;
        const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
        
        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuario: usuario,
                    password: password,
                    tipoUsuario: tipoUsuario
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                mostrarMensaje('Inicio de sesión exitoso. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);
            } else {
                mostrarMensaje(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión con el servidor', 'error');
        }
    });
    
    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = 'mensaje ' + tipo;
        mensaje.style.display = 'block';
    }
});
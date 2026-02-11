<?php
// auth.php - API de autenticación
require_once 'config.php';

$conn = getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $usuario = $data['usuario'] ?? '';
    $password = $data['password'] ?? '';
    $tipoUsuario = $data['tipoUsuario'] ?? '';
    
    // Validación simple para el ambiente académico
    if ($usuario === DEFAULT_USER && $password === DEFAULT_PASS) {
        $response = [
            'success' => true,
            'message' => 'Autenticación exitosa',
            'tipoUsuario' => $tipoUsuario,
            'redirect' => $tipoUsuario === 'TRABAJADOR' ? 
                'dashboardtrabajador.html' : 'dashboardsupervisor.html'
        ];
    } else {
        // Intentar autenticar con base de datos
        try {
            $stmt = $conn->prepare("
                SELECT rut, tipo_usuario 
                FROM usuarios 
                WHERE rut = ? AND password = ? AND tipo_usuario = ?
            ");
            $stmt->execute([$usuario, md5($password), $tipoUsuario]);
            $user = $stmt->fetch();
            
            if ($user) {
                $response = [
                    'success' => true,
                    'message' => 'Autenticación exitosa',
                    'tipoUsuario' => $tipoUsuario,
                    'redirect' => $tipoUsuario === 'TRABAJADOR' ? 
                        'dashboardtrabajador.html' : 'dashboardsupervisor.html'
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ];
            }
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'message' => 'Error en la autenticación: ' . $e->getMessage()
            ];
        }
    }
    
    echo json_encode($response);
}
?>
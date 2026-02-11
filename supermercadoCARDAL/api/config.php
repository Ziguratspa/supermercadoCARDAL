<?php
// config.php - Configuración de conexión a base de datos
// Sistema de Gestión CARDAL

// Configuración para InfinityFree u otro hosting
define('DB_HOST', 'sql202.infinityfree.com'); 
define('DB_NAME', 'if0_41119280_cardal_db');
define('DB_USER', 'if0_41119280');
define('DB_PASS', 'Desarrolla2026');
define('DB_CHARSET', 'utf8mb4');

// Credenciales de acceso por defecto (para ambiente de desarrollo)
define('DEFAULT_USER', 'admin');
define('DEFAULT_PASS', 'admin123');

// Configuración de zona horaria
date_default_timezone_set('America/Santiago');

// Activar logs de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Función para establecer conexión con la base de datos
function getConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => true
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        // Verificar que la conexión funciona
        $pdo->query("SELECT 1");
        
        error_log("Conexión a BD exitosa");
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a BD: " . $e->getMessage());
        error_log("Host: " . DB_HOST . ", DB: " . DB_NAME . ", User: " . DB_USER);
        return null;
    }
}

// Función para validar RUT chileno - VERSIÓN SIMPLIFICADA PARA PRUEBAS
function validarRUT($rut) {
    if (empty($rut)) return false;
    
    $rut = trim($rut);
    
    // Formato básico: 12345678-9 o 12345678-k
    if (!preg_match('/^[0-9]{7,8}-[0-9kK]$/', $rut)) {
        // Intentar validar sin guion
        $rut_sin_guion = preg_replace('/[^0-9kK]/', '', $rut);
        if (strlen($rut_sin_guion) < 8) {
            return false;
        }
        
        // Si no tiene guion pero tiene dígito verificador, aceptarlo igual
        if (strlen($rut_sin_guion) >= 8 && strlen($rut_sin_guion) <= 9) {
            return true;
        }
        return false;
    }
    
    return true;
}

// Función para formatear RUT
function formatearRUT($rut) {
    $rut = preg_replace('/[^0-9kK]/', '', $rut);
    if (strlen($rut) < 8) return $rut;
    
    $dv = substr($rut, -1);
    $numero = substr($rut, 0, -1);
    return number_format($numero, 0, '', '.') . '-' . strtoupper($dv);
}

// Headers para API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
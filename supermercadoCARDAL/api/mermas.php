<?php
// mermas.php - API para registro de mermas
require_once 'config.php';

$conn = getConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del POST
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Si no se puede decodificar JSON, intentar con $_POST
    if ($data === null && !empty($_POST)) {
        $data = $_POST;
    }
    
    // Depuración: guardar lo que llega
    error_log("Datos recibidos en mermas.php: " . print_r($data, true));
    
    $rut = isset($data['rut']) ? trim($data['rut']) : '';
    $producto = isset($data['producto']) ? trim($data['producto']) : '';
    $unidades = isset($data['unidades']) ? intval($data['unidades']) : 0;
    $peso_volumen = isset($data['peso_volumen']) ? floatval($data['peso_volumen']) : 0;
    $unidad_medida = isset($data['unidad_medida']) ? trim($data['unidad_medida']) : 'kg';
    $observaciones = isset($data['observaciones']) ? trim($data['observaciones']) : '';
    
    // Depuración: mostrar valores recibidos
    error_log("RUT: $rut, Producto: $producto, Unidades: $unidades");
    
    // Formatear RUT si viene sin guion
    $rut = strtoupper($rut);
    if (preg_match('/^[0-9]{7,8}[0-9kK]$/', str_replace('-', '', $rut))) {
        $rut_sin_guion = preg_replace('/[^0-9kK]/', '', $rut);
        if (strlen($rut_sin_guion) >= 8) {
            $dv = substr($rut_sin_guion, -1);
            $numero = substr($rut_sin_guion, 0, -1);
            $rut = $numero . '-' . $dv;
        }
    }
    
    error_log("RUT formateado: $rut");
    
    // Verificar que el trabajador existe
    $stmt = $conn->prepare("SELECT rut FROM trabajadores WHERE rut = ?");
    $stmt->execute([$rut]);
    $trabajador = $stmt->fetch();
    
    if (!$trabajador) {
        error_log("Trabajador no encontrado: $rut");
        echo json_encode(['success' => false, 'message' => 'Trabajador no encontrado']);
        exit;
    }
    
    error_log("Trabajador encontrado: " . print_r($trabajador, true));
    
    if (empty($producto) || $unidades <= 0) {
        error_log("Datos incompletos: producto=$producto, unidades=$unidades");
        echo json_encode(['success' => false, 'message' => 'Datos incompletos. Producto y unidades son requeridos']);
        exit;
    }
    
    $fecha_hora_registro = date('Y-m-d H:i:s');
    
    try {
        $stmt = $conn->prepare("
            INSERT INTO mermas 
            (rut_trabajador, producto, unidades, peso_volumen, unidad_medida, fecha_registro, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([$rut, $producto, $unidades, $peso_volumen, $unidad_medida, $fecha_hora_registro, $observaciones]);
        
        if ($result) {
            $id = $conn->lastInsertId();
            error_log("Merma registrada exitosamente. ID: $id");
            
            echo json_encode([
                'success' => true,
                'message' => 'Merma registrada exitosamente',
                'id' => $id,
                'fecha' => $fecha_hora_registro
            ]);
        } else {
            error_log("Error en execute()");
            echo json_encode(['success' => false, 'message' => 'Error al ejecutar la consulta']);
        }
    } catch (Exception $e) {
        error_log("Excepción en mermas.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $accion = $_GET['accion'] ?? 'todas';
    
    if ($accion === 'todas') {
        // Obtener todas las mermas
        $stmt = $conn->query("
            SELECT 
                m.*,
                CONCAT(t.primer_nombre, ' ', t.primer_apellido) as nombre_trabajador,
                t.area
            FROM mermas m
            INNER JOIN trabajadores t ON m.rut_trabajador = t.rut
            ORDER BY m.fecha_registro DESC
        ");
        $mermas = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'mermas' => $mermas
        ]);
        
    } elseif ($accion === 'por_trabajador') {
        // Obtener mermas por RUT de trabajador
        $rut = $_GET['rut'] ?? '';
        
        // Formatear RUT
        $rut = strtoupper(trim($rut));
        if (preg_match('/^[0-9]{7,8}[0-9kK]$/', str_replace('-', '', $rut))) {
            $rut_sin_guion = preg_replace('/[^0-9kK]/', '', $rut);
            if (strlen($rut_sin_guion) >= 8) {
                $dv = substr($rut_sin_guion, -1);
                $numero = substr($rut_sin_guion, 0, -1);
                $rut = $numero . '-' . $dv;
            }
        }
        
        $stmt = $conn->prepare("
            SELECT * FROM mermas 
            WHERE rut_trabajador = ?
            ORDER BY fecha_registro DESC
        ");
        $stmt->execute([$rut]);
        $mermas = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'mermas' => $mermas
        ]);
        
    } elseif ($accion === 'resumen') {
        // Obtener resumen de mermas
        $stmt = $conn->query("
            SELECT 
                producto,
                SUM(unidades) as total_unidades,
                SUM(peso_volumen) as total_peso,
                unidad_medida,
                COUNT(*) as cantidad_registros
            FROM mermas
            GROUP BY producto, unidad_medida
            ORDER BY total_unidades DESC
        ");
        $resumen = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'resumen' => $resumen
        ]);
    }
}
?>
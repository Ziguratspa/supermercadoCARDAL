<?php
// asistencia.php - API para registro de entrada/salida
require_once 'config.php';

$conn = getConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    $rut = $data['rut'] ?? '';
    
    // Sanitizar RUT (aceptar con o sin guion)
    $rut = strtoupper(trim($rut));
    
    // Si el RUT viene sin guion pero tiene 8-9 caracteres, formatearlo
    if (preg_match('/^[0-9]{7,8}[0-9kK]$/', str_replace('-', '', $rut))) {
        $rut_sin_guion = preg_replace('/[^0-9kK]/', '', $rut);
        if (strlen($rut_sin_guion) >= 8) {
            $dv = substr($rut_sin_guion, -1);
            $numero = substr($rut_sin_guion, 0, -1);
            $rut = $numero . '-' . $dv;
        }
    }
    
    if ($action === 'verificar') {
        // Verificar si el trabajador tiene entrada registrada hoy
        
        // PRIMERO: Verificar que el trabajador exista en la base de datos
        $stmt = $conn->prepare("SELECT rut FROM trabajadores WHERE rut = ?");
        $stmt->execute([$rut]);
        $trabajador = $stmt->fetch();
        
        if (!$trabajador) {
            echo json_encode([
                'success' => false, 
                'message' => 'Trabajador no encontrado. Use RUT: 12345678-9'
            ]);
            exit;
        }
        
        // SEGUNDO: Verificar estado de asistencia hoy
        $fecha_actual = date('Y-m-d');
        
        $stmt = $conn->prepare("
            SELECT hora_entrada, hora_salida 
            FROM registros_asistencia 
            WHERE rut_trabajador = ? AND fecha = ?
        ");
        $stmt->execute([$rut, $fecha_actual]);
        $registro = $stmt->fetch();
        
        if (!$registro) {
            // No tiene registro hoy
            $response = [
                'success' => true,
                'tieneEntrada' => false,
                'tieneSalida' => false,
                'mensaje' => 'Puede registrar entrada'
            ];
        } else {
            $tieneEntrada = !empty($registro['hora_entrada']);
            $tieneSalida = !empty($registro['hora_salida']);
            
            $response = [
                'success' => true,
                'tieneEntrada' => $tieneEntrada,
                'tieneSalida' => $tieneSalida,
                'mensaje' => $tieneEntrada && !$tieneSalida ? 
                    'Ya tiene entrada, puede registrar salida' : 
                    ($tieneEntrada && $tieneSalida ? 
                        'Ya tiene entrada y salida registradas hoy' : 
                        'Estado desconocido')
            ];
        }
        
        echo json_encode($response);
        
    } elseif ($action === 'entrada') {
        // Registrar entrada
        
        // Verificar que el trabajador existe
        $stmt = $conn->prepare("SELECT rut FROM trabajadores WHERE rut = ?");
        $stmt->execute([$rut]);
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Trabajador no encontrado']);
            exit;
        }
        
        // Verificar si ya tiene entrada hoy
        $fecha_actual = date('Y-m-d');
        $stmt = $conn->prepare("
            SELECT id FROM registros_asistencia 
            WHERE rut_trabajador = ? AND fecha = ? AND hora_entrada IS NOT NULL
        ");
        $stmt->execute([$rut, $fecha_actual]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Ya tiene entrada registrada hoy']);
            exit;
        }
        
        $hora_actual = date('H:i:s');
        $fecha_hora_actual = date('Y-m-d H:i:s');
        
        // Insertar registro de entrada
        $stmt = $conn->prepare("
            INSERT INTO registros_asistencia 
            (rut_trabajador, fecha, hora_entrada, fecha_hora_entrada) 
            VALUES (?, ?, ?, ?)
        ");
        
        if ($stmt->execute([$rut, $fecha_actual, $hora_actual, $fecha_hora_actual])) {
            echo json_encode([
                'success' => true,
                'message' => 'Entrada registrada exitosamente',
                'hora' => $hora_actual,
                'rut' => $rut
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al registrar entrada']);
        }
        
    } elseif ($action === 'salida') {
        // Registrar salida
        
        $fecha_actual = date('Y-m-d');
        $hora_actual = date('H:i:s');
        $fecha_hora_actual = date('Y-m-d H:i:s');
        
        // Verificar que existe una entrada sin salida
        $stmt = $conn->prepare("
            SELECT id, fecha_hora_entrada 
            FROM registros_asistencia 
            WHERE rut_trabajador = ? AND fecha = ? AND hora_salida IS NULL
        ");
        $stmt->execute([$rut, $fecha_actual]);
        $registro = $stmt->fetch();
        
        if (!$registro) {
            echo json_encode(['success' => false, 'message' => 'No tiene entrada registrada hoy']);
            exit;
        }
        
        // Actualizar registro con hora de salida
        $stmt = $conn->prepare("
            UPDATE registros_asistencia 
            SET hora_salida = ?, fecha_hora_salida = ?
            WHERE rut_trabajador = ? AND fecha = ? AND hora_salida IS NULL
        ");
        
        if ($stmt->execute([$hora_actual, $fecha_hora_actual, $rut, $fecha_actual])) {
            // Calcular horas trabajadas
            $entrada = new DateTime($registro['fecha_hora_entrada']);
            $salida = new DateTime($fecha_hora_actual);
            $intervalo = $entrada->diff($salida);
            $horas_trabajadas = $intervalo->h + ($intervalo->i / 60) + ($intervalo->s / 3600);
            
            // Si trabajó más de 9 horas, registrar horas extra
            $horas_extra = 0;
            if ($horas_trabajadas > 9) {
                $horas_extra = $horas_trabajadas - 9;
                $monto_horas_extra = $horas_extra * 10000; // $10.000 por hora extra
                
                $stmt = $conn->prepare("
                    INSERT INTO asignaciones 
                    (rut_trabajador, tipo_asignacion, fecha, cantidad, monto, descripcion) 
                    VALUES (?, 'horas_extra', ?, ?, ?, 'Horas extra por jornada extendida')
                ");
                $stmt->execute([$rut, $fecha_actual, $horas_extra, $monto_horas_extra]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Salida registrada exitosamente',
                'hora' => $hora_actual,
                'horas_trabajadas' => round($horas_trabajadas, 2),
                'horas_extra' => round($horas_extra, 2),
                'rut' => $rut
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al registrar salida']);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener registros de asistencia por RUT
    $rut = $_GET['rut'] ?? '';
    $fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-d', strtotime('-30 days'));
    $fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-d');
    
    $stmt = $conn->prepare("
        SELECT * FROM registros_asistencia 
        WHERE rut_trabajador = ? AND fecha BETWEEN ? AND ?
        ORDER BY fecha DESC
    ");
    $stmt->execute([$rut, $fecha_inicio, $fecha_fin]);
    $registros = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'registros' => $registros
    ]);
}
?>
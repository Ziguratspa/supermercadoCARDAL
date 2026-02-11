<?php
// reportes.php - API para reportes de supervisor
require_once 'config.php';

$conn = getConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tipo_reporte = $_GET['tipo'] ?? '';
    
    if ($tipo_reporte === 'por_trabajador') {
        // Reporte completo por RUT de trabajador
        $rut = $_GET['rut'] ?? '';
        
        if (empty($rut)) {
            echo json_encode(['success' => false, 'message' => 'RUT requerido']);
            exit;
        }
        
        // Datos del trabajador
        $stmt = $conn->prepare("
            SELECT * FROM trabajadores WHERE rut = ?
        ");
        $stmt->execute([$rut]);
        $trabajador = $stmt->fetch();
        
        if (!$trabajador) {
            echo json_encode(['success' => false, 'message' => 'Trabajador no encontrado']);
            exit;
        }
        
        // Registros de asistencia
        $stmt = $conn->prepare("
            SELECT * FROM registros_asistencia 
            WHERE rut_trabajador = ?
            ORDER BY fecha DESC
            LIMIT 30
        ");
        $stmt->execute([$rut]);
        $asistencias = $stmt->fetchAll();
        
        // Asignaciones
        $stmt = $conn->prepare("
            SELECT * FROM asignaciones 
            WHERE rut_trabajador = ?
            ORDER BY fecha DESC
        ");
        $stmt->execute([$rut]);
        $asignaciones = $stmt->fetchAll();
        
        // Mermas
        $stmt = $conn->prepare("
            SELECT * FROM mermas 
            WHERE rut_trabajador = ?
            ORDER BY fecha_registro DESC
        ");
        $stmt->execute([$rut]);
        $mermas = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'trabajador' => $trabajador,
            'asistencias' => $asistencias,
            'asignaciones' => $asignaciones,
            'mermas' => $mermas
        ]);
        
    } elseif ($tipo_reporte === 'por_area') {
        // Reporte por área de trabajo
        $area = $_GET['area'] ?? '';
        
        if (empty($area)) {
            echo json_encode(['success' => false, 'message' => 'Área requerida']);
            exit;
        }
        
        // Trabajadores del área
        $stmt = $conn->prepare("
            SELECT * FROM trabajadores WHERE area = ? AND activo = 1
        ");
        $stmt->execute([$area]);
        $trabajadores = $stmt->fetchAll();
        
        $reporte_area = [];
        
        foreach ($trabajadores as $trabajador) {
            $rut = $trabajador['rut'];
            
            // Asistencias del último mes
            $stmt = $conn->prepare("
                SELECT COUNT(*) as dias_trabajados 
                FROM registros_asistencia 
                WHERE rut_trabajador = ? AND fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $stmt->execute([$rut]);
            $dias = $stmt->fetch();
            
            // Total horas extra
            $stmt = $conn->prepare("
                SELECT SUM(cantidad) as total_horas_extra 
                FROM asignaciones 
                WHERE rut_trabajador = ? AND tipo_asignacion = 'horas_extra'
                AND fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $stmt->execute([$rut]);
            $horas_extra = $stmt->fetch();
            
            // Total mermas
            $stmt = $conn->prepare("
                SELECT COUNT(*) as total_mermas 
                FROM mermas 
                WHERE rut_trabajador = ?
                AND fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $stmt->execute([$rut]);
            $mermas = $stmt->fetch();
            
            $reporte_area[] = [
                'trabajador' => $trabajador,
                'dias_trabajados' => $dias['dias_trabajados'] ?? 0,
                'horas_extra' => $horas_extra['total_horas_extra'] ?? 0,
                'total_mermas' => $mermas['total_mermas'] ?? 0
            ];
        }
        
        echo json_encode([
            'success' => true,
            'area' => $area,
            'trabajadores' => $reporte_area
        ]);
        
    } elseif ($tipo_reporte === 'mermas_totales') {
        // Reporte total de mermas
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
        
        // Resumen por producto
        $stmt = $conn->query("
            SELECT 
                producto,
                COUNT(*) as cantidad_registros,
                SUM(unidades) as total_unidades,
                SUM(peso_volumen) as total_peso,
                unidad_medida
            FROM mermas
            GROUP BY producto, unidad_medida
            ORDER BY total_unidades DESC
        ");
        $resumen = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'mermas' => $mermas,
            'resumen' => $resumen
        ]);
        
    } elseif ($tipo_reporte === 'trabajadores') {
        // Listar todos los trabajadores
        $stmt = $conn->query("
            SELECT * FROM trabajadores WHERE activo = 1 ORDER BY primer_apellido, primer_nombre
        ");
        $trabajadores = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'trabajadores' => $trabajadores
        ]);
        
    } elseif ($tipo_reporte === 'areas') {
        // Listar áreas disponibles
        $stmt = $conn->query("
            SELECT DISTINCT area FROM trabajadores WHERE activo = 1 ORDER BY area
        ");
        $areas = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo json_encode([
            'success' => true,
            'areas' => $areas
        ]);
    }
}
?>

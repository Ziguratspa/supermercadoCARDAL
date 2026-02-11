-- Base de datos del Sistema de Gestión CARDAL
-- Proyecto Académico - Técnico en Programación y Análisis de Sistemas

CREATE DATABASE IF NOT EXISTS if0_41119280_cardal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE if0_41119280_cardal_db;

-- Tabla de usuarios (trabajadores y supervisores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('TRABAJADOR', 'SUPERVISOR') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de trabajadores
CREATE TABLE trabajadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    area ENUM('panaderia', 'fiambreria', 'caja', 'prevencion_perdidas', 'reposicion', 'jefatura', 'externo') NOT NULL,
    fecha_contratacion DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (rut) REFERENCES usuarios(rut) ON DELETE CASCADE
);

-- Tabla de registros de entrada/salida
CREATE TABLE registros_asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut_trabajador VARCHAR(12) NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    fecha_hora_entrada DATETIME,
    fecha_hora_salida DATETIME,
    FOREIGN KEY (rut_trabajador) REFERENCES trabajadores(rut) ON DELETE CASCADE,
    INDEX idx_rut_fecha (rut_trabajador, fecha)
);

-- Tabla de asignaciones (horas extra, bonos)
CREATE TABLE asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut_trabajador VARCHAR(12) NOT NULL,
    tipo_asignacion ENUM('horas_extra', 'bono_produccion', 'bono_puntualidad') NOT NULL,
    fecha DATE NOT NULL,
    cantidad DECIMAL(10,2),
    monto DECIMAL(10,2),
    descripcion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rut_trabajador) REFERENCES trabajadores(rut) ON DELETE CASCADE,
    INDEX idx_rut_fecha (rut_trabajador, fecha)
);

-- Tabla de mermas
CREATE TABLE mermas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut_trabajador VARCHAR(12) NOT NULL,
    producto VARCHAR(100) NOT NULL,
    unidades INT NOT NULL,
    peso_volumen DECIMAL(10,2),
    unidad_medida VARCHAR(20),
    fecha_registro DATETIME NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (rut_trabajador) REFERENCES trabajadores(rut) ON DELETE CASCADE,
    INDEX idx_rut_fecha (rut_trabajador, fecha_registro)
);

-- Insertar usuario supervisor por defecto
INSERT INTO usuarios (rut, password, tipo_usuario) VALUES 
('11111111-1', '$2y$10$YourHashedPasswordHere', 'SUPERVISOR');

-- Datos de 30 trabajadores ficticios con RUT chileno válido
INSERT INTO usuarios (rut, password, tipo_usuario) VALUES
('12345678-9', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('23456789-0', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('34567890-1', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('45678901-2', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('56789012-3', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('67890123-4', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('78901234-5', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('89012345-6', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('90123456-7', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('10234567-8', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('21345678-9', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('32456789-0', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('43567890-1', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('54678901-2', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('65789012-3', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('76890123-4', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('87901234-5', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('98012345-6', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('19123456-7', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('20234567-8', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('31345678-9', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('42456789-0', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('53567890-1', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('64678901-2', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('75789012-3', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('86890123-4', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('97901234-5', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('18012345-6', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('29123456-7', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR'),
('30234567-8', '$2y$10$YourHashedPasswordHere', 'TRABAJADOR');

INSERT INTO trabajadores (rut, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, area, fecha_contratacion) VALUES
('12345678-9', 'Juan', 'Carlos', 'González', 'Pérez', 'panaderia', '2023-01-15'),
('23456789-0', 'María', 'José', 'Rodríguez', 'Silva', 'fiambreria', '2023-02-20'),
('34567890-1', 'Pedro', 'Antonio', 'Martínez', 'López', 'caja', '2023-03-10'),
('45678901-2', 'Ana', 'María', 'Fernández', 'García', 'prevencion_perdidas', '2023-04-05'),
('56789012-3', 'Luis', 'Alberto', 'Sánchez', 'Rojas', 'reposicion', '2023-05-12'),
('67890123-4', 'Carmen', 'Elena', 'Torres', 'Muñoz', 'jefatura', '2023-01-08'),
('78901234-5', 'Roberto', 'Miguel', 'Ramírez', 'Vargas', 'panaderia', '2023-06-15'),
('89012345-6', 'Patricia', 'Isabel', 'Flores', 'Castro', 'fiambreria', '2023-07-20'),
('90123456-7', 'Jorge', 'Luis', 'Díaz', 'Morales', 'caja', '2023-08-25'),
('10234567-8', 'Laura', 'Andrea', 'Herrera', 'Núñez', 'reposicion', '2023-09-10'),
('21345678-9', 'Carlos', 'Eduardo', 'Pinto', 'Sepúlveda', 'panaderia', '2023-10-05'),
('32456789-0', 'Mónica', 'Beatriz', 'Vega', 'Contreras', 'caja', '2023-11-12'),
('43567890-1', 'Fernando', 'José', 'Riquelme', 'Alarcón', 'fiambreria', '2023-12-01'),
('54678901-2', 'Claudia', 'Marcela', 'Bravo', 'Parra', 'prevencion_perdidas', '2024-01-15'),
('65789012-3', 'Diego', 'Andrés', 'Fuentes', 'Espinoza', 'reposicion', '2024-02-10'),
('76890123-4', 'Valentina', 'Francisca', 'Campos', 'Salazar', 'caja', '2024-03-05'),
('87901234-5', 'Sebastián', 'Ignacio', 'Medina', 'Reyes', 'panaderia', '2024-04-12'),
('98012345-6', 'Daniela', 'Carolina', 'Valenzuela', 'Gutiérrez', 'fiambreria', '2024-05-20'),
('19123456-7', 'Andrés', 'Felipe', 'Navarro', 'Cortés', 'jefatura', '2024-06-15'),
('20234567-8', 'Gabriela', 'Alejandra', 'Ortiz', 'Tapia', 'caja', '2024-07-01'),
('31345678-9', 'Rodrigo', 'Esteban', 'Carrasco', 'Cabrera', 'reposicion', '2024-08-10'),
('42456789-0', 'Fernanda', 'Javiera', 'Vergara', 'Araya', 'panaderia', '2024-09-05'),
('53567890-1', 'Matías', 'Benjamín', 'Aravena', 'Henríquez', 'fiambreria', '2024-10-12'),
('64678901-2', 'Camila', 'Antonia', 'Muñoz', 'Soto', 'caja', '2024-11-01'),
('75789012-3', 'Nicolás', 'Tomás', 'Peña', 'Zamora', 'prevencion_perdidas', '2024-12-15'),
('86890123-4', 'Isidora', 'Constanza', 'Bustamante', 'Villalobos', 'reposicion', '2025-01-10'),
('97901234-5', 'Joaquín', 'Maximiliano', 'Garrido', 'Yáñez', 'panaderia', '2025-01-20'),
('18012345-6', 'Sofía', 'Emilia', 'Leiva', 'Cáceres', 'fiambreria', '2025-02-01'),
('29123456-7', 'Vicente', 'Agustín', 'Robles', 'Pulgar', 'externo', '2025-02-05'),
('30234567-8', 'Martina', 'Florencia', 'Pizarro', 'Matus', 'caja', '2025-02-08');

-- Registros de asistencia de ejemplo (últimos 7 días)
INSERT INTO registros_asistencia (rut_trabajador, fecha, hora_entrada, hora_salida, fecha_hora_entrada, fecha_hora_salida) VALUES
('12345678-9', '2026-02-03', '08:00:00', '18:30:00', '2026-02-03 08:00:00', '2026-02-03 18:30:00'),
('12345678-9', '2026-02-04', '08:05:00', '17:00:00', '2026-02-04 08:05:00', '2026-02-04 17:00:00'),
('23456789-0', '2026-02-03', '09:00:00', '19:15:00', '2026-02-03 09:00:00', '2026-02-03 19:15:00'),
('34567890-1', '2026-02-03', '07:45:00', '17:00:00', '2026-02-03 07:45:00', '2026-02-03 17:00:00'),
('45678901-2', '2026-02-04', '08:00:00', '18:00:00', '2026-02-04 08:00:00', '2026-02-04 18:00:00'),
('56789012-3', '2026-02-05', '08:30:00', '19:00:00', '2026-02-05 08:30:00', '2026-02-05 19:00:00'),
('67890123-4', '2026-02-05', '08:00:00', '17:30:00', '2026-02-05 08:00:00', '2026-02-05 17:30:00');

-- Asignaciones de horas extra (calculadas automáticamente cuando superan 9 horas)
INSERT INTO asignaciones (rut_trabajador, tipo_asignacion, fecha, cantidad, monto, descripcion) VALUES
('12345678-9', 'horas_extra', '2026-02-03', 1.5, 15000, 'Horas extra por jornada extendida'),
('23456789-0', 'horas_extra', '2026-02-03', 1.25, 12500, 'Horas extra por jornada extendida'),
('56789012-3', 'horas_extra', '2026-02-05', 1.5, 15000, 'Horas extra por jornada extendida'),
('23456789-0', 'bono_puntualidad', '2026-02-03', 1, 5000, 'Bono por puntualidad mensual'),
('34567890-1', 'bono_produccion', '2026-02-03', 1, 10000, 'Bono por cumplimiento de metas');

-- Mermas registradas
INSERT INTO mermas (rut_trabajador, producto, unidades, peso_volumen, unidad_medida, fecha_registro, observaciones) VALUES
('12345678-9', 'Pan Hallulla', 15, 3.5, 'kg', '2026-02-03 14:30:00', 'Pan dañado por humedad'),
('12345678-9', 'Pan Marraqueta', 20, 4.0, 'kg', '2026-02-04 16:45:00', 'Pan del día anterior'),
('23456789-0', 'Jamón de Pavo', 3, 1.2, 'kg', '2026-02-03 12:15:00', 'Producto abandonado en bolsa'),
('23456789-0', 'Queso Mantecoso', 2, 0.8, 'kg', '2026-02-05 15:20:00', 'Producto vencido'),
('89012345-6', 'Salame', 1, 0.5, 'kg', '2026-02-04 11:00:00', 'Producto consumido sin pago'),
('12345678-9', 'Pan Integral', 10, 2.0, 'kg', '2026-02-06 17:00:00', 'Pan no vendido del día');

-- Vistas útiles para reportes
CREATE VIEW vista_asistencia_completa AS
SELECT 
    t.rut,
    t.primer_nombre,
    t.segundo_nombre,
    t.primer_apellido,
    t.segundo_apellido,
    t.area,
    r.fecha,
    r.hora_entrada,
    r.hora_salida,
    TIMESTAMPDIFF(HOUR, r.fecha_hora_entrada, r.fecha_hora_salida) as horas_trabajadas
FROM trabajadores t
LEFT JOIN registros_asistencia r ON t.rut = r.rut_trabajador
ORDER BY r.fecha DESC, t.rut;

CREATE VIEW vista_mermas_por_trabajador AS
SELECT 
    t.rut,
    CONCAT(t.primer_nombre, ' ', t.primer_apellido) as nombre_completo,
    t.area,
    m.producto,
    m.unidades,
    m.peso_volumen,
    m.unidad_medida,
    m.fecha_registro,
    m.observaciones
FROM trabajadores t
INNER JOIN mermas m ON t.rut = m.rut_trabajador
ORDER BY m.fecha_registro DESC;

CREATE VIEW vista_asignaciones_trabajador AS
SELECT 
    t.rut,
    CONCAT(t.primer_nombre, ' ', t.primer_apellido) as nombre_completo,
    t.area,
    a.tipo_asignacion,
    a.fecha,
    a.cantidad,
    a.monto,
    a.descripcion
FROM trabajadores t
INNER JOIN asignaciones a ON t.rut = a.rut_trabajador
ORDER BY a.fecha DESC;

ENLACE AL SISTEMA: https://oliveradrianrubiorauldtap.infinityfreeapp.com

# supermercadoCARDAL

Repositorio que alberga todo lo relacionado al desarrollo del sistema de gestión empresarial basado en empresa ficticia "Supermercado CARDAL".


## 📋 Descripción del Proyecto

Sistema web de gestión empresarial desarrollado para el Supermercado CARDAL, que permite a los trabajadores registrar su asistencia (entrada/salida), mermas de productos, mientras que los supervisores pueden consultar reportes detallados.

**Proyecto Académico** - Técnico en Programación y Análisis de Sistemas

---

## 🎯 Características Principales

### Para Trabajadores:
- ✅ Registro de entrada y salida con fecha y hora exactas
- ⏰ Cálculo automático de horas extra (jornadas > 9 horas)
- 📦 Registro de mermas de productos con detalles completos
- 🔐 Autenticación segura mediante credenciales

### Para Supervisores:
- 📊 Reportes completos por trabajador (asistencia, asignaciones, mermas)
- 🏢 Reportes agrupados por área de trabajo
- 📈 Reportes de mermas totales y detalladas
- 🔍 Búsqueda por RUT o selección desde lista

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - HTML5
  - CSS3 (Responsive Design)
  - JavaScript (Vanilla)

- **Backend:**
  - PHP 7.4+
  - APIs REST

- **Base de Datos:**
  - MySQL 5.7+
  - PHPMyAdmin

- **Hosting:**
  - InfinityFree (www.infinityfree.com)

---

## 📂 Estructura del Proyecto

```
cardal_system/
├── index.html                      # Página de inicio de sesión
├── dashboardtrabajador.html        # Dashboard para trabajadores
├── dashboardsupervisor.html        # Dashboard para supervisores
├── css/
│   └── styles.css                  # Estilos del sistema
├── js/
│   ├── login.js                    # Lógica de autenticación
│   ├── trabajador.js               # Lógica dashboard trabajador
│   └── supervisor.js               # Lógica dashboard supervisor
├── api/
│   ├── config.php                  # Configuración de BD
│   ├── auth.php                    # API de autenticación
│   ├── asistencia.php              # API de registro asistencia
│   ├── mermas.php                  # API de registro mermas
│   └── reportes.php                # API de consulta reportes
├── sql/
│   └── cardal_database.sql         # Script de creación de BD
├── docs/
│   ├── 01_Metodologia_y_Planificacion.docx
│   ├── 02_Casos_de_Uso.docx
│   ├─define('DB_HOST', 'tu_host');
   define('DB_NAME', 'cardal_db');
   define('DB_USER', 'tu_usuario');
   define('DB_PASS', 'tu_contraseña');
   ```


## 👥 Usuarios de Prueba

El sistema incluye 30 trabajadores ficticios pre-cargados con datos de prueba:

- **RUTs de ejemplo:** 12345678-9, 23456789-0, 34567890-1, etc.
- **Áreas:** Panadería, Fiambrería, Caja, Prevención de Pérdidas, Reposición, Jefatura
- **Datos incluidos:** Registros de asistencia, horas extra, mermas

---

## 📖 Documentación

### Documentos Word Incluidos:
1. **Metodología y Planificación** - Metodología SCRUM, sprints, carta Gantt
2. **Casos de Uso** - Descripción detallada de 7 casos de uso
3. **Análisis de Requerimientos** - Requerimientos funcionales y no funcionales
4. **Manual de Usuario** - Guía completa para trabajadores y supervisores
5. **Documentación Técnica** - Arquitectura, APIs, instalación, mantenimiento

### Diagramas Incluidos:
- 📊 Diagrama de Flujo (Proceso de asistencia)
- 🗂️ Diagrama Entidad-Relación (Modelo de datos)
- 👤 Diagrama de Casos de Uso UML
- 🔄 Diagrama BPMN (Procesos de negocio)
- 🏗️ Diagrama de Clases UML

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de RUT chileno
- ✅ Prepared statements (prevención SQL injection)
- ✅ Headers CORS configurados
- ✅ Validación de datos en backend

---

## 🧪 Testing

### Pruebas Funcionales
- Login con credenciales válidas/inválidas
- Registro de entrada/salida
- Cálculo de horas extra
- Registro de mermas
- Generación de reportes

### Pruebas de Usabilidad
- Responsive design en mobile/tablet/desktop
- Validación de formularios
- Mensajes de error claros

---

## 📱 Metodología Ágil

### Metodología: SCRUM

**4 Sprints de 2 semanas:**
1. **Sprint 1:** Diseño de BD y arquitectura
2. **Sprint 2:** Desarrollo backend (APIs)
3. **Sprint 3:** Desarrollo frontend (dashboards)
4. **Sprint 4:** Testing y despliegue

**Ceremonias:**
- Sprint Planning (4h)
- Daily Stand-up (15min)
- Sprint Review (2h)
- Sprint Retrospective (1.5h)

---

## 🤝 Contribuciones

Este es un proyecto académico. Para sugerencias o mejoras:
1. Fork del repositorio
2. Crear rama feature
3. Commit de cambios
4. Push a la rama
5. Abrir Pull Request

---

## 📄 Licencia

Trabajo de Aplicación Práctica (TAP) - Técnico en Programación y Análisis de Sistemas AIEP
Supermercado CARDAL © 2026

---

## 👨‍💻 Autor

**Proyecto Académico**  
Óliver Adrián Rubio Rauld - Técnico en Programación y Análisis de Sistemas

---


## 🎓 Notas Académicas

### Requerimientos Cumplidos:
- ✅ Metodología ágil SCRUM implementada
- ✅ Planificación con carta Gantt
- ✅ Diagramas BPMN, Flujo, UML, ER, Casos de Uso
- ✅ Sistema funcional con PHP, HTML, CSS, JS, MySQL
- ✅ Alojamiento en InfinityFree configurado
- ✅ 30 trabajadores ficticios generados
- ✅ Documentación completa generada
- ✅ Cálculo automático de horas extra
- ✅ Registro de mermas implementado
- ✅ Reportes por trabajador, área y mermas

---

**¡Gracias por utilizar el Sistema de Gestión CARDAL!** 🛒

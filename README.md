# Banco de Hojas de Vida

## Descripción

Aplicación fullstack para gestionar candidatos y vacantes de talento, con matching automático basado en experiencia, certificaciones, ubicación y disponibilidad.

El proyecto incluye:
- Frontend en React + Vite
- Backend en Express con MySQL
- Gestión de candidatos, vacantes y matching
- Extracción automática de datos de CV en PDF
- Interfaz de administración tipo dashboard

---

## Funcionalidades

### Gestión de candidatos
- Registrar, editar y eliminar candidatos
- Subir CV en PDF para cada candidato
- Analizar CVs y extraer nombre, cargo, experiencia, ciudad, certificaciones y resumen
- Ver lista de candidatos con filtros por ciudad y cargo

### Vacantes y matching
- Crear, editar y eliminar vacantes
- Definir requisitos: cargo, ciudad, experiencia mínima/máxima, certificaciones, disponibilidad, jornada, estado y salario
- Calcular matching automático entre vacantes y candidatos
- Ver puntaje de compatibilidad y desglose por criterios

### Dashboard
- Sección de resumen con métricas clave
- Navegación clara entre talento, registro, vacantes y matching
- Acciones rápidas para crear candidatos o vacantes

---

## Arquitectura del proyecto

### Frontend
- `src/pages/BancoHojasVidaMVP.jsx` - página principal del dashboard
- `src/hooks/useCandidatesDashboard.js` - lógica de candidatos, formulario y análisis de CV
- `src/hooks/useVacantesManager.js` - lógica de vacantes y matching
- `src/components/banco-hojas-vida/` - componentes UI principales
  - `CandidateCard.jsx`
  - `CandidateForm.jsx`
  - `DashboardHeader.jsx`
  - `DashboardSidebar.jsx`
  - `MetricsCards.jsx`
  - `PageHeader.jsx`
  - `TalentFilters.jsx`
  - `TalentTab.jsx`
  - `VacanteForm.jsx`
  - `VacanteMatchingPanel.jsx`
  - `VacantesList.jsx`

### Backend
- `src/backend/index.js` - servidor Express principal
- `src/backend/db.js` - conexión MySQL
- `src/backend/routes/` - rutas de API
  - `candidatos.js`
  - `vacantes.js`
- `src/backend/controllers/` - controladores de negocio
- `src/backend/services/` - acceso a BD y lógica de matching
- `src/backend/utils/` - utilidades de análisis de CV, lectura PDF, errores y métricas
- `src/backend/runSchema.js` - script para generar el esquema de base de datos

---

## Requisitos

- Node.js 18+ / 20+
- MySQL
- `pdftotext` instalado en el sistema para extraer texto de PDFs
- Variables de entorno para backend:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `PORT` (opcional, por defecto 4000)

---

## Instalación y ejecución

### Frontend

```powershell
cd c:\banco-hojas-vida\banco-hojas-vida
npm install
npm run dev
```

El frontend quedará disponible en `http://localhost:5175/` o el puerto que indique Vite.

### Backend

```powershell
cd c:\banco-hojas-vida\banco-hojas-vida\src\backend
npm install
npm run start
```

O durante el desarrollo:

```powershell
npm run dev
```

### Base de datos

1. Configura el archivo `.env` en `src/backend` con tus credenciales MySQL.
2. Ejecuta el script de esquema:

```powershell
cd c:\banco-hojas-vida\banco-hojas-vida\src\backend
node runSchema.js
```

---

## Endpoints de la API

### Candidatos
- `GET /api/candidatos` - lista todos los candidatos
- `POST /api/candidatos` - crea un candidato
- `PUT /api/candidatos/:id` - actualiza un candidato
- `DELETE /api/candidatos/:id` - elimina un candidato
- `POST /api/candidatos/:id/cv` - sube el CV en PDF
- `POST /api/candidatos/:id/analyze-cv` - analiza el CV y extrae datos

### Vacantes
- `GET /api/vacantes` - lista todas las vacantes
- `GET /api/vacantes/:id` - obtiene una vacante por ID
- `POST /api/vacantes` - crea una vacante
- `PUT /api/vacantes/:id` - actualiza una vacante
- `DELETE /api/vacantes/:id` - elimina una vacante
- `GET /api/vacantes/:id/candidatos` - obtiene candidatos sugeridos para una vacante
- `POST /api/vacantes/:id/matching/recalcular` - recalcula matching para una vacante

---

## Modelo de datos principal

### Tabla `candidatos`
- `id`
- `nombre`
- `ciudad`
- `cargo`
- `experiencia`
- `certificaciones`
- `disponibilidad`
- `jornada`
- `aspiracion`
- `estado`
- `observaciones`
- `cv_path`

### Tabla `vacantes`
- `id`
- `titulo`
- `descripcion`
- `cargo`
- `ciudad`
- `experiencia_minima`
- `experiencia_maxima`
- `certificaciones_requeridas`
- `disponibilidad`
- `jornada`
- `salario_minimo`
- `salario_maximo`
- `estado`

### Tabla `vacante_candidato_score`
- `vacante_id`
- `candidato_id`
- `score_total`
- `score_experiencia`
- `score_certificaciones`
- `score_ubicacion`
- `score_disponibilidad`
- `estado_aplicacion`

---

## Lógica de matching

El matching se calcula con:
- Experiencia: 35%
- Certificaciones: 35%
- Ubicación: 15%
- Disponibilidad: 15%

El resultado se guarda en `vacante_candidato_score` y se usa para ordenar los candidatos sugeridos.

---

## Notas importantes

- El análisis de CV usa un parser regex propio en `src/backend/utils/cvAnalyzer.js`.
- El backend extrae texto de PDF con `pdftotext`.
- Las vacantes se crean y el matching se recalcula automáticamente cada vez que se crea o actualiza una vacante.

---

## Posibles mejoras

- Agregar autenticación y roles
- Permitir subir CVs desde el dashboard directamente con previsualización
- Mejorar el algoritmo de matching con NLP o ML
- Añadir tests completos para frontend y backend

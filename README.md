# Banco de Hojas de Vida

Aplicación fullstack para gestión de talento humano con matching automático entre candidatos y vacantes, dashboard de métricas reales, portal de candidatos, análisis de CV con IA (Gemini), y notificaciones por correo electrónico.

---

## Funcionalidades

### Portal Reclutador (`/empresa`)
- Dashboard con métricas reales: total candidatos, vacantes activas, match >= 70%, embudo de aplicaciones, desglose de scores, top ciudades
- Base de talento con filtros por ciudad y cargo, scores de match, cambio de estado (Aplicó → Entrevista → Aprobado)
- Registro manual de candidatos con carga de CV y análisis con IA
- Gestión de vacantes con generación de perfil por IA (Gemini) y preguntas por vacante
- Matching automático entre candidatos y vacantes (experiencia 35%, certificaciones 35%, ubicación 15%, disponibilidad 15%)
- Enlace de prueba técnica configurable por vacante, enviado por correo al pasar a "Entrevista"

### Portal Candidato (`/candidato`)
- Búsqueda y aplicación a vacantes activas
- Edición de perfil, carga de CV y análisis con Gemini
- KPIs personales: aplicaciones activas/cerradas, mejor match, perfil completo, vacantes recomendadas
- Protección de datos personales con consentimiento (Ley 1581 de 2012)

### Autenticación y Seguridad
- Registro e inicio de sesión con JWT (candidato y empresa)
- Recuperación de contraseña por correo
- Roles: candidato, empresa, admin
- Usuarios con doble rol (empresa + candidato) con el mismo email
- Consentimiento de tratamiento de datos personales

---

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend      │────▶│   Backend       │────▶│   MySQL      │
│   React + Vite  │     │   Express       │     │   Database   │
│   Tailwind      │     │   JWT Auth      │     │              │
│   puerto :5173  │     │   puerto :4000  │     │  puerto :3306│
└─────────────────┘     └─────────────────┘     └──────────────┘
                               │
                        ┌──────┴──────┐
                        │             │
                   ┌─────────┐  ┌──────────┐
                   │ Gemini  │  │  SMTP    │
                   │   AI    │  │  Mailer  │
                   └─────────┘  └──────────┘
```

### Frontend (`src/`)
- `pages/` - páginas principales
  - `BancoHojasVidaMVP.jsx` - dashboard reclutador (5 tabs)
  - `CandidatoDashboard.jsx` - portal candidato (4 tabs)
  - `LoginCandidatoPage.jsx`, `LoginEmpresaPage.jsx` - login/registro
  - `PoliticaDatosPage.jsx` - política de tratamiento de datos
  - `AccesoPage.jsx` - selección de tipo de acceso
  - `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx` - recuperación
- `components/banco-hojas-vida/` - componentes del dashboard reclutador
  - `DashboardHeader.jsx`, `DashboardSidebar.jsx` - layout
  - `DashboardMetrics.jsx` - métricas detalladas
  - `CandidateCard.jsx` - tarjeta de candidato con score
  - `CandidateForm.jsx` - formulario de candidato
  - `TalentTab.jsx`, `TalentFilters.jsx` - base de talento
  - `VacanteForm.jsx`, `VacantesList.jsx` - gestión de vacantes
  - `VacanteMatchingPanel.jsx` - panel de matching
- `components/candidato/` - componentes del portal candidato
  - `CandidatoMetrics.jsx` - KPIs del candidato
- `hooks/` - lógica de estado
  - `useCandidatesDashboard.js` - candidatos, dashboard, matching
  - `useVacantesManager.js` - vacantes, preguntas
  - `usePortalVacantes.js` - portal candidato
- `services/` - llamadas API
  - `authApi.js`, `candidatosApi.js`, `vacantesApi.js`, `dashboardApi.js`, `preguntasApi.js`
- `context/AuthContext.jsx` - contexto de autenticación

### Backend (`src/backend/`)
- `index.js` - servidor Express
- `routes/` - rutas API
  - `auth.js` - autenticación, perfil, CV
  - `candidatos.js` - CRUD candidatos, prueba técnica
  - `vacantes.js` - CRUD vacantes, matching, perfil IA
  - `dashboard.js` - estadísticas del dashboard
  - `preguntas.js` - preguntas por vacante
- `controllers/` - controladores
  - `authController.js` - registro, login, perfil, CV
  - `candidatosController.js` - CRUD, análisis CV, prueba técnica
  - `vacantesController.js` - CRUD, matching, perfil IA
  - `dashboardController.js` - estadísticas
- `services/` - lógica de negocio
  - `authService.js` - registro, login, recuperación
  - `candidatosService.js` - CRUD candidatos
  - `vacantesService.js` - CRUD vacantes, matching, prueba técnica
  - `matchingService.ts` - algoritmo de matching
  - `dashboardService.js` - consultas de métricas
  - `candidatoStatsService.js` - KPIs del candidato
- `utils/` - utilidades
  - `mailer.js` - correos electrónicos (prueba técnica, vacante, reset)
  - `cvGemini.js` - análisis de CV con Gemini
  - `cvAnalyzer.js` - análisis de CV con Ollama (legacy)
  - `readCvPdf.js`, `readCvFile.js` - extracción de texto de PDF
  - `logger.js`, `httpError.js`, `cache.js`, `mysqlDate.js`
- `middlewares/` - middleware
  - `requireAuth.js` - verificación JWT
  - `uploadCV.js` - carga de archivos
  - `validateCandidate.js` - validación de datos
- `database/init.sql` - esquema completo de base de datos

---

## Requisitos

### Producción (Docker)
- Docker y Docker Compose
- Gemini API Key (opcional, para análisis de CV)
- Configuración SMTP (opcional, para correos)

### Desarrollo local
- Node.js 18+
- MySQL 8.0
- `pdftotext` para extracción de PDF (opcional, para análisis local)

---

## Instalación y Ejecución

### Con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/jamarin1982/banco-hojas-vida.git
cd banco-hojas-vida

# 2. Configurar variables de entorno (opcional)
# Crear archivo .env en la raíz con:
#   GEMINI_API_KEY=tu_api_key
#   SMTP_HOST=smtp.tu-servidor.com
#   SMTP_PORT=587
#   SMTP_USER=tu_usuario
#   SMTP_PASS=tu_contraseña
#   JWT_SECRET=tu_secreto

# 3. Iniciar todos los servicios
docker compose up -d

# La aplicación queda disponible en:
# - Frontend: http://localhost:80
# - Backend API: http://localhost:4000
```

### Sin Docker (desarrollo)

```bash
# Frontend
cd banco-hojas-vida
npm install
npm run dev        # http://localhost:5173

# Backend (otra terminal)
cd src/backend
npm install
npm run dev        # http://localhost:4000

# Base de datos
# Configurar .env en src/backend/ con credenciales MySQL
cd src/backend
node runSchema.js  # Crear tablas
```

---

## Variables de Entorno

### Backend (`src/backend/.env`)
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=banco_hojas_vida

# Servidor
PORT=4000
JWT_SECRET=tu_secreto
JWT_EXPIRES_IN=7d

# Gemini AI (para análisis de CV)
GEMINI_API_KEY=tu_api_key
GEMINI_MODEL=gemini-2.5-flash

# Ollama (legacy, alternativa local a Gemini)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# SMTP (para envío de correos)
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASS=tu_contraseña
FRONTEND_URL=http://localhost:80

# Test Platform URL (fallback para enlaces de prueba técnica)
TEST_PLATFORM_URL=https://forms.gle/default-test
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario (candidato o empresa) |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |
| POST | `/api/auth/forgot-password` | Solicitar restablecimiento |
| POST | `/api/auth/reset-password` | Restablecer contraseña |
| GET | `/api/auth/mi-perfil` | Obtener perfil candidato |
| PUT | `/api/auth/mi-perfil` | Actualizar perfil candidato |
| GET | `/api/auth/mis-aplicaciones` | Aplicaciones del candidato |
| POST | `/api/auth/mi-perfil/cv` | Subir CV desde portal |
| POST | `/api/auth/mi-perfil/analizar-cv` | Analizar CV (local) |
| POST | `/api/auth/mi-perfil/analizar-cv-gemini` | Analizar CV (Gemini) |

### Candidatos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/candidatos` | Listar candidatos |
| POST | `/api/candidatos` | Crear candidato |
| PUT | `/api/candidatos/:id` | Actualizar candidato |
| DELETE | `/api/candidatos/:id` | Eliminar candidato |
| POST | `/api/candidatos/:id/cv` | Subir CV |
| POST | `/api/candidatos/:id/analyze-cv` | Analizar CV |
| POST | `/api/candidatos/:id/enviar-prueba` | Enviar prueba técnica |

### Vacantes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/vacantes` | Listar vacantes |
| GET | `/api/vacantes/:id` | Obtener vacante |
| POST | `/api/vacantes` | Crear vacante |
| PUT | `/api/vacantes/:id` | Actualizar vacante |
| DELETE | `/api/vacantes/:id` | Eliminar vacante |
| POST | `/api/vacantes/generar-perfil` | Generar perfil con IA |
| GET | `/api/vacantes/:id/candidatos` | Candidatos sugeridos |
| POST | `/api/vacantes/:id/matching/recalcular` | Recalcular matching |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Estadísticas del dashboard |
| GET | `/api/dashboard/candidate-matches` | Matches de candidatos |

### Preguntas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/preguntas/:vacanteId` | Obtener preguntas |
| POST | `/api/preguntas/:vacanteId/generar` | Generar con IA |
| POST | `/api/preguntas` | Crear pregunta |
| PUT | `/api/preguntas/:id` | Actualizar pregunta |
| DELETE | `/api/preguntas/:id` | Eliminar pregunta |

---

## Modelo de Datos

### `usuarios`
Cuentas de autenticación con rol (candidato/empresa), JWT, y enlace opcional a candidato.

### `candidatos`
Datos del candidato: nombre, ciudad, cargo, experiencia, certificaciones, disponibilidad, jornada, aspiracion salarial, estado (Aplicó → Preseleccionado → Entrevista → Aprobado → Contratado), CV, observaciones.

### `vacantes`
Datos de la vacante: título, descripción, cargo, ciudad, experiencia min/max, certificaciones requeridas, disponibilidad, jornada, salario min/max, test_link (enlace de prueba técnica), estado.

### `vacante_candidato_score`
Puntaje de matching entre vacante y candidato: score_total, score_experiencia (35%), score_certificaciones (35%), score_ubicacion (15%), score_disponibilidad (15%), estado_aplicacion (Sugerido/Aplicó/Entrevista/Aprobado/Contratado).

### `vacante_preguntas`
Preguntas asociadas a una vacante (informativas, calificatorias, excluyentes).

### `candidato_respuestas_preguntas`
Respuestas del candidato a las preguntas de una vacante.

### `consentimientos`
Registro de consentimiento de tratamiento de datos personales (Ley 1581 de 2012).

### `password_reset_tokens`
Tokens para restablecimiento de contraseña.

---

## Lógica de Matching

El matching se calcula automáticamente al crear/actualizar un candidato o vacante:

| Componente | Peso | Descripción |
|-----------|------|-------------|
| Experiencia | 35% | Puntaje basado en rango de experiencia vs años del candidato |
| Certificaciones | 35% | Coincidencia exacta por palabra (word-boundary regex) |
| Ubicación | 15% | Coincidencia de ciudad |
| Disponibilidad | 15% | Coincidencia de disponibilidad laboral |

Umbral mínimo para notificaciones y visualización: **70%**.

---

## Notas Importantes

- **CV Analysis**: El backend usa Gemini por defecto (requiere `GEMINI_API_KEY`). Si no está configurada, usa análisis local con regex.
- **Correos**: Sin configuración SMTP, los correos se muestran en la consola del backend (modo desarrollo).
- **Docker**: Después de cambios en el código, ejecutar `docker compose build` y `docker compose up -d` para actualizar.
- **Matching threshold**: Solo se muestran candidatos con score >= 70% en la vista de matching y en las notificaciones.

---

## Licencia

ISC

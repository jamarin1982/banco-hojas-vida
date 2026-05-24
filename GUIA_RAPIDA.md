# Guía Rápida de Inicio

## 1. Con Docker (recomendado)

```bash
git clone https://github.com/jamarin1982/banco-hojas-vida.git
cd banco-hojas-vida
docker compose up -d
```

La aplicación queda disponible en:
- **Frontend (recrutador y candidato):** http://localhost:80
- **Backend API:** http://localhost:4000

Para actualizar después de cambios:
```bash
docker compose build
docker compose up -d
```

---

## 2. Sin Docker (desarrollo)

### Frontend
```bash
cd banco-hojas-vida
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd src/backend
npm install
npm run dev          # http://localhost:4000
```

### Base de datos
Configurar `.env` en `src/backend/` y ejecutar:
```bash
cd src/backend
node runSchema.js
```

---

## 3. Funcionalidades principales

### Portal Reclutador — http://localhost/empresa

| Pestaña | Qué hace |
|---------|----------|
| **Dashboard** | Métricas generales: vacantes activas, score por vacante, más populares |
| **Analíticas** | (en el menú lateral, según configuración) |
| **Base de Talento** | Lista de candidatos con filtros, scores de match, cambio de estado |
| **Registrar Candidato** | Formulario para agregar candidatos manualmente + subir CV |
| **Gestionar Vacantes** | Crear/editar vacantes con perfil generado por IA |
| **Matching Automático** | Ver candidatos sugeridos por vacante con puntaje de compatibilidad |

**Flujo típico:**
1. Crear una vacante → el sistema calcula matching automáticamente
2. Ir a "Matching Automático", seleccionar la vacante
3. Ver candidatos con score >= 70%
4. Mover candidatos por el proceso: Sugerido → Entrevista → Aprobado
5. Al pasar a "Entrevista", se envía correo con enlace de prueba técnica
6. El enlace de prueba se configura en cada vacante (campo "Enlace de prueba técnica")

### Portal Candidato — http://localhost/candidato

| Pestaña | Qué hace |
|---------|----------|
| **Buscar Vacantes** | Explorar y aplicar a vacantes activas |
| **Mi Perfil** | Editar datos personales, subir CV, analizar con IA |
| **Mis Aplicaciones** | Historial de vacantes aplicadas |
| **Mis Métricas** | KPIs personales: aplicaciones activas/cerradas, mejor match, perfil completo |

**Flujo típico:**
1. Registrarse con email, contraseña y hoja de vida
2. Aceptar la política de tratamiento de datos personales
3. El CV se analiza automáticamente con Gemini para completar el perfil
4. Buscar vacantes y aplicar
5. Revisar las métricas personales en "Mis Métricas"

---

## 4. Configuración opcional

### Análisis de CV con Gemini
Agregar en el `.env` de la raíz (para Docker) o en `src/backend/.env`:
```env
GEMINI_API_KEY=tu_api_key_de_google
```

### Correos electrónicos
```env
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASS=tu_contraseña
```
Sin SMTP configurado, los correos se muestran en la consola del backend.

---

## 5. API - Ejemplos rápidos

### Obtener estadísticas del dashboard
```bash
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/dashboard/stats
```

### Enviar prueba técnica a candidato
```bash
curl -X POST http://localhost:4000/api/candidatos/1/enviar-prueba \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vacanteId": 1}'
```

### Registrar candidato
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@email.com","password":"12345678","rol":"candidato","consentimiento":true}'
```

---

## 6. Troubleshooting

### Docker: puerto 80 en uso
Editar `docker-compose.yml` y cambiar `"80:80"` a otro puerto como `"8080:80"`.

### Backend no conecta a MySQL
```bash
docker logs bhv-backend
```
Verificar que MySQL esté saludable: `docker ps | Select-String mysql`

### Los cambios no se ven después de modificar código
```bash
docker compose build
docker compose up -d
```

### Error "Debes aceptar la política de tratamiento de datos"
Al registrarse como candidato, marcar el checkbox de consentimiento.

---

## 7. Variables de entorno principales

| Variable | Descripción | Defecto |
|----------|-------------|---------|
| `GEMINI_API_KEY` | API key de Google Gemini | - |
| `SMTP_HOST` | Servidor SMTP | - |
| `JWT_SECRET` | Secreto para tokens JWT | `supersecretkey` |
| `TEST_PLATFORM_URL` | URL por defecto para pruebas técnicas | `https://forms.gle/default-test` |

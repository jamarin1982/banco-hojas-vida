## Guía Rápida de Inicio

### 1. Instalar dependencias

**Frontend:**
```bash
cd c:\banco-hojas-vida\banco-hojas-vida
npm install
```

**Backend:**
```bash
cd c:\banco-hojas-vida\banco-hojas-vida\src\backend
npm install
```

---

### 2. Configurar variables de entorno

En `c:\banco-hojas-vida\banco-hojas-vida\src\backend\.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=banco_hojas_vida
PORT=4000
```

---

### 3. Crear esquema de base de datos

```bash
cd c:\banco-hojas-vida\banco-hojas-vida\src\backend
node runSchema.js
```

---

### 4. Ejecutar aplicación

**Terminal 1 - Frontend:**
```bash
cd c:\banco-hojas-vida\banco-hojas-vida
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd c:\banco-hojas-vida\banco-hojas-vida\src\backend
npm run start
```

La aplicación estará disponible en:
- Frontend: http://localhost:5175
- Backend API: http://localhost:4000

---

## Funcionalidades principales

### Registrar un candidato
1. Ir a tab "➕ Registrar Candidato"
2. Llenar formulario con datos básicos
3. Click en "Guardar Candidato"

### Subir CV y analizar
1. En la lista de candidatos, hacer click en el icono 📄
2. Subir archivo PDF
3. El sistema extrae automáticamente: nombre, cargo, experiencia, ciudad, certificaciones

### Crear una vacante
1. Ir a tab "💼 Gestionar Vacantes"
2. Click en "Nueva Vacante"
3. Llenar requisitos (cargo, ciudad, experiencia, certificaciones, disponibilidad)
4. Save - Se calcula matching automáticamente

### Ver matching
1. Ir a tab "🎯 Matching Automático"
2. Seleccionar una vacante
3. Ver candidatos sugeridos con puntaje de compatibilidad

---

## Estructura de respuestas API

### GET /api/candidatos
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "ciudad": "Barranquilla",
    "cargo": "DESARROLLADOR",
    "experiencia": 5,
    "certificaciones": "JavaScript,React",
    "disponibilidad": "Inmediata",
    "jornada": "Completa",
    "aspiration": 4000000,
    "estado": "Aplicó",
    "observaciones": "...",
    "cv_path": "/uploads/cv/1.pdf"
  }
]
```

### POST /api/vacantes
```json
{
  "titulo": "Senior Developer",
  "cargo": "DESARROLLADOR",
  "ciudad": "Barranquilla",
  "experiencia_minima": 3,
  "experiencia_maxima": 10,
  "certificaciones_requeridas": ["JavaScript", "React", "Node.js"],
  "disponibilidad": "Inmediata",
  "jornada": "Completa",
  "salario_minimo": 3000000,
  "salario_maximo": 5000000,
  "estado": "Activa"
}
```

### GET /api/vacantes/:id/candidatos
```json
[
  {
    "candidato_id": 1,
    "nombre": "Juan Pérez",
    "cargo": "DESARROLLADOR",
    "ciudad": "Barranquilla",
    "experiencia": 5,
    "score_total": 85.5,
    "score_experiencia": 90,
    "score_certificaciones": 80,
    "score_ubicacion": 100,
    "score_disponibilidad": 100
  }
]
```

---

## Troubleshooting

### Error "Cannot connect to MySQL"
- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env`
- Verificar host y puerto

### Error "pdftotext not found"
- Instalar `pdftotext` desde xpdf-tools
- Windows: descargar desde http://www.xpdfreader.com/download.html
- Agregar a PATH del sistema

### Puerto ya está en uso
- Para cambiar puerto del frontend: `npm run dev -- --port 5200`
- Para cambiar puerto del backend: cambiar `PORT` en `.env`

---

## Desarrolladores

Para contribuir:
1. Hacer fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## Licencia

Este proyecto está bajo licencia ISC.

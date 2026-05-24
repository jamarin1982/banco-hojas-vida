# Guía de Análisis de CV con IA

El sistema soporta dos motores de análisis de CV:

1. **Gemini (Google AI)** — recomendado, requiere API key
2. **Ollama (local)** — legacy, funciona sin conexión

---

## Gemini (Recomendado)

### Configuración
```env
GEMINI_API_KEY=tu_api_key_de_google
GEMINI_MODEL=gemini-2.5-flash
```

### Dónde se usa
- **Portal candidato**: al registrarse, el CV se analiza automáticamente con Gemini para llenar el perfil
- **Portal candidato**: botón "IA" en la pestaña "Mi Perfil" para re-analizar
- **Dashboard reclutador**: botón "Analizar con IA" en candidatos sin usuario registrado

### Obtener API Key
1. Ir a https://aistudio.google.com/apikey
2. Crear una API key (gratuita con cuota)
3. Pegarla en `GEMINI_API_KEY`

### Modelos disponibles
| Modelo | Velocidad | Precisión |
|--------|-----------|-----------|
| `gemini-2.5-flash` | Rápido | Buena |
| `gemini-2.0-flash` | Muy rápido | Aceptable |

---

## Ollama (Legacy)

Alternativa local para cuando no hay conexión a internet o no se quiere usar Gemini.

### Instalación
```bash
# Descargar Ollama: https://ollama.ai/download/windows
# Luego descargar el modelo:
ollama pull mistral
```

### Configuración
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
OLLAMA_TIMEOUT_MS=30000
```

### Iniciar
```bash
ollama serve
```

---

## ¿Qué datos extrae la IA?

| Campo | Descripción |
|-------|-------------|
| nombre | Nombre completo del candidato |
| cargo | Cargo o posición objetivo |
| ciudad | Ciudad de residencia |
| experiencia | Años de experiencia (número) |
| certificaciones | Lista de certificaciones técnicas |
| resumen | Resumen profesional |

---

## Troubleshooting

### Gemini: "API key not valid"
Verificar que la API key sea correcta y esté activa en Google AI Studio.

### Gemini: "Quota exceeded"
La cuota gratuita se agotó. Esperar o actualizar a una cuenta de pago.

### Ollama: "Connection refused"
Ollama no está corriendo. Ejecutar `ollama serve`.

### Ambos: "No se pudo analizar"
El PDF puede estar protegido, ser una imagen escaneada sin OCR, o tener un formato no soportado.

-- Tabla de preguntas para vacantes
CREATE TABLE IF NOT EXISTS vacante_preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vacante_id INT NOT NULL,
  tipo ENUM('informativa', 'calificatoria', 'excluyente') NOT NULL,
  pregunta TEXT NOT NULL,
  orden INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vacante (vacante_id),
  INDEX idx_vacante_tipo (vacante_id, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de respuestas del candidato a las preguntas
CREATE TABLE IF NOT EXISTS candidato_respuestas_preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vacante_id INT NOT NULL,
  candidato_id INT NOT NULL,
  pregunta_id INT NOT NULL,
  respuesta TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_candidato (candidato_id),
  INDEX idx_pregunta (pregunta_id),
  UNIQUE KEY uk_candidato_pregunta (candidato_id, pregunta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

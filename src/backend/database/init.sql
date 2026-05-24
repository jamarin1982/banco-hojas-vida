-- ============================================
-- Banco de Hojas de Vida - Schema Completo
-- ============================================

-- Tabla de Usuarios (autenticación)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'local',
  provider_id VARCHAR(255),
  avatar_url VARCHAR(500),
  rol VARCHAR(50) DEFAULT 'candidato',
  candidato_id INT DEFAULT NULL,
  nombre_empresa VARCHAR(255) DEFAULT NULL,
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_provider (provider, provider_id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Candidatos
CREATE TABLE IF NOT EXISTS candidatos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  experiencia INT DEFAULT 0,
  certificaciones TEXT,
  disponibilidad VARCHAR(50),
  jornada VARCHAR(50),
  aspiracion DECIMAL(10, 2) DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'Aplicó',
  observaciones TEXT,
  cv_path VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado),
  INDEX idx_ciudad (ciudad),
  INDEX idx_cargo (cargo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Vacantes
CREATE TABLE IF NOT EXISTS vacantes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion LONGTEXT,
  resumen TEXT,
  responsabilidades JSON,
  requisitos JSON,
  ofrecemos JSON,
  cargo VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  experiencia_minima INT DEFAULT 0,
  experiencia_maxima INT DEFAULT 50,
  certificaciones_requeridas TEXT,
  disponibilidad VARCHAR(50),
  jornada VARCHAR(50),
  salario_minimo DECIMAL(10, 2),
  salario_maximo DECIMAL(10, 2),
  test_link VARCHAR(255) DEFAULT NULL,
  estado VARCHAR(20) DEFAULT 'Activa',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado),
  INDEX idx_ciudad (ciudad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Aplicaciones/Matching
CREATE TABLE IF NOT EXISTS vacante_candidato_score (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vacante_id INT NOT NULL,
  candidato_id INT NOT NULL,
  score_total DECIMAL(5, 2),
  score_experiencia DECIMAL(5, 2),
  score_certificaciones DECIMAL(5, 2),
  score_ubicacion DECIMAL(5, 2),
  score_disponibilidad DECIMAL(5, 2),
  estado_aplicacion VARCHAR(20) DEFAULT 'Sugerido',
  fecha_score TIMESTAMP NULL,
  UNIQUE KEY unique_vacante_candidato (vacante_id, candidato_id),
  KEY idx_vacante (vacante_id),
  KEY idx_candidato (candidato_id),
  KEY idx_score (score_total DESC),
  CONSTRAINT fk_vcs_vacante FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_vcs_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tokens de restablecimiento de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_en TIMESTAMP NOT NULL,
  usado TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prt_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de preguntas para vacantes
CREATE TABLE IF NOT EXISTS vacante_preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vacante_id INT NOT NULL,
  tipo ENUM('informativa', 'calificatoria', 'excluyente') NOT NULL,
  pregunta TEXT NOT NULL,
  orden INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vp_vacante FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE,
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
  CONSTRAINT fk_crp_vacante FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_crp_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
  CONSTRAINT fk_crp_pregunta FOREIGN KEY (pregunta_id) REFERENCES vacante_preguntas(id) ON DELETE CASCADE,
  INDEX idx_candidato (candidato_id),
  INDEX idx_pregunta (pregunta_id),
  UNIQUE KEY uk_candidato_pregunta (candidato_id, pregunta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

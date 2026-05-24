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
  fecha_creacion VARCHAR(50),
  fecha_actualizacion VARCHAR(50),
  INDEX idx_estado (estado),
  INDEX idx_ciudad (ciudad),
  INDEX idx_cargo (cargo)
);

-- Tabla de Vacantes
CREATE TABLE IF NOT EXISTS vacantes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion LONGTEXT,
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
  fecha_creacion VARCHAR(50),
  fecha_actualizacion VARCHAR(50),
  INDEX idx_estado (estado),
  INDEX idx_ciudad (ciudad)
);

-- Tabla de Aplicaciones/Matching
-- Tabla de consentimientos (protección de datos - Ley 1581 de 2012)
CREATE TABLE IF NOT EXISTS consentimientos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT DEFAULT NULL,
  candidato_id INT DEFAULT NULL,
  tipo VARCHAR(50) DEFAULT 'registro',
  ip_address VARCHAR(45) DEFAULT NULL,
  version_politica VARCHAR(20) DEFAULT '1.0',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario_id),
  INDEX idx_candidato (candidato_id)
);

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
  fecha_score VARCHAR(50),
  UNIQUE KEY unique_vacante_candidato (vacante_id, candidato_id),
  KEY idx_vacante (vacante_id),
  KEY idx_candidato (candidato_id),
  KEY idx_score (score_total DESC)
);

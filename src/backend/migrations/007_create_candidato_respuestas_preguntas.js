export async function up(knex) {
  return knex.schema.createTable("candidato_respuestas_preguntas", (table) => {
    table.increments("id").primary();
    table.integer("vacante_id").unsigned().notNullable();
    table.integer("candidato_id").unsigned().notNullable();
    table.integer("pregunta_id").unsigned().notNullable();
    table.text("respuesta").nullable();
    table.timestamp("fecha_creacion").defaultTo(knex.fn.now());

    table.index("candidato_id", "idx_candidato");
    table.index("pregunta_id", "idx_pregunta");
    table.unique(["candidato_id", "pregunta_id"], "uk_candidato_pregunta");

    table.foreign("vacante_id").references("id").inTable("vacantes").onDelete("CASCADE");
    table.foreign("candidato_id").references("id").inTable("candidatos").onDelete("CASCADE");
    table.foreign("pregunta_id").references("id").inTable("vacante_preguntas").onDelete("CASCADE");
  }).raw("ALTER TABLE candidato_respuestas_preguntas ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("candidato_respuestas_preguntas");
}

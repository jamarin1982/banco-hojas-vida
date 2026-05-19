export async function up(knex) {
  return knex.schema.createTable("vacante_preguntas", (table) => {
    table.increments("id").primary();
    table.integer("vacante_id").unsigned().notNullable();
    table.enum("tipo", ["informativa", "calificatoria", "excluyente"]).notNullable();
    table.text("pregunta").notNullable();
    table.integer("orden").defaultTo(0);
    table.timestamp("fecha_creacion").defaultTo(knex.fn.now());

    table.index("vacante_id", "idx_vacante");
    table.index(["vacante_id", "tipo"], "idx_vacante_tipo");

    table.foreign("vacante_id").references("id").inTable("vacantes").onDelete("CASCADE");
  }).raw("ALTER TABLE vacante_preguntas ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("vacante_preguntas");
}

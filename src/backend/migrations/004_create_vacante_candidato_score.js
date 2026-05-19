export async function up(knex) {
  return knex.schema.createTable("vacante_candidato_score", (table) => {
    table.increments("id").primary();
    table.integer("vacante_id").unsigned().notNullable();
    table.integer("candidato_id").unsigned().notNullable();
    table.decimal("score_total", 5, 2).nullable();
    table.decimal("score_experiencia", 5, 2).nullable();
    table.decimal("score_certificaciones", 5, 2).nullable();
    table.decimal("score_ubicacion", 5, 2).nullable();
    table.decimal("score_disponibilidad", 5, 2).nullable();
    table.string("estado_aplicacion", 20).defaultTo("Sugerido");
    table.timestamp("fecha_score").nullable();

    table.unique(["vacante_id", "candidato_id"], "unique_vacante_candidato");
    table.index("vacante_id", "idx_vacante");
    table.index("candidato_id", "idx_candidato");
    table.index("score_total", "idx_score");

    table.foreign("vacante_id").references("id").inTable("vacantes").onDelete("CASCADE");
    table.foreign("candidato_id").references("id").inTable("candidatos").onDelete("CASCADE");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("vacante_candidato_score");
}

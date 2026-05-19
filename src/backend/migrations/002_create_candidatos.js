export async function up(knex) {
  return knex.schema.createTable("candidatos", (table) => {
    table.increments("id").primary();
    table.string("nombre", 255).notNullable();
    table.string("ciudad", 100).notNullable();
    table.string("cargo", 100).notNullable();
    table.integer("experiencia").defaultTo(0);
    table.text("certificaciones").nullable();
    table.string("disponibilidad", 50).nullable();
    table.string("jornada", 50).nullable();
    table.decimal("aspiracion", 10, 2).defaultTo(0);
    table.string("estado", 50).defaultTo("Aplicó");
    table.text("observaciones").nullable();
    table.string("cv_path", 255).nullable();
    table.timestamp("fecha_creacion").defaultTo(knex.fn.now());
    table.timestamp("fecha_actualizacion").defaultTo(knex.fn.now());

    table.index("estado", "idx_estado");
    table.index("ciudad", "idx_ciudad");
    table.index("cargo", "idx_cargo");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("candidatos");
}

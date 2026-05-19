export async function up(knex) {
  return knex.schema.createTable("vacantes", (table) => {
    table.increments("id").primary();
    table.string("titulo", 255).notNullable();
    table.longText("descripcion").nullable();
    table.text("resumen").nullable();
    table.json("responsabilidades").nullable();
    table.json("requisitos").nullable();
    table.json("ofrecemos").nullable();
    table.string("cargo", 100).notNullable();
    table.string("ciudad", 100).notNullable();
    table.integer("experiencia_minima").defaultTo(0);
    table.integer("experiencia_maxima").defaultTo(50);
    table.text("certificaciones_requeridas").nullable();
    table.string("disponibilidad", 50).nullable();
    table.string("jornada", 50).nullable();
    table.decimal("salario_minimo", 10, 2).nullable();
    table.decimal("salario_maximo", 10, 2).nullable();
    table.string("estado", 20).defaultTo("Activa");
    table.timestamp("fecha_creacion").defaultTo(knex.fn.now());
    table.timestamp("fecha_actualizacion").defaultTo(knex.fn.now());

    table.index("estado", "idx_estado");
    table.index("ciudad", "idx_ciudad");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("vacantes");
}

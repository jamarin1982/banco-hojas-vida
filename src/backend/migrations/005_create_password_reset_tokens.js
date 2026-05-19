export async function up(knex) {
  return knex.schema.createTable("password_reset_tokens", (table) => {
    table.increments("id").primary();
    table.integer("usuario_id").unsigned().notNullable();
    table.string("token", 255).notNullable().unique();
    table.timestamp("expira_en").notNullable();
    table.boolean("usado").defaultTo(false);
    table.timestamp("fecha_creacion").defaultTo(knex.fn.now());

    table.index("token", "idx_token");

    table.foreign("usuario_id").references("id").inTable("usuarios").onDelete("CASCADE");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("password_reset_tokens");
}

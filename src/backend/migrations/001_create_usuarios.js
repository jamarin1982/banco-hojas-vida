export async function up(knex) {
  return knex.schema.createTable("usuarios", (table) => {
    table.increments("id").primary();
    table.string("nombre", 255).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).nullable().comment("NULL si usa OAuth");
    table.string("provider", 50).defaultTo("local").comment("local | google | microsoft");
    table.string("provider_id", 255).nullable();
    table.string("avatar_url", 500).nullable();
    table.string("rol", 50).defaultTo("candidato");
    table.integer("candidato_id").nullable();
    table.string("nombre_empresa", 255).nullable();
    table.boolean("activo").defaultTo(true);
    table.timestamp("fecha_creacion").defaultTo(knex.fn.now());
    table.timestamp("fecha_actualizacion").defaultTo(knex.fn.now());

    table.unique(["provider", "provider_id"], "unique_provider");
    table.index("email", "idx_email");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("usuarios");
}

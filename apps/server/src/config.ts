export type ServerConfig = {
  host: string;
  port: number;
  databasePath: string;
};

export function loadConfig(): ServerConfig {
  const parsedPort = Number.parseInt(process.env.PORT ?? "3000", 10);

  return {
    host: process.env.HOST ?? "0.0.0.0",
    port: Number.isFinite(parsedPort) ? parsedPort : 3000,
    databasePath: process.env.DATABASE_PATH ?? "data/laplante.sqlite"
  };
}

import Fastify, { type FastifyInstance } from "fastify";

import { registerHealthRoute } from "./routes/health.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true
  });

  void app.register(registerHealthRoute);

  return app;
}

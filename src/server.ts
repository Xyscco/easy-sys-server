import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { produtoRoutes } from "./routes/produto";
import { clienteRoutes } from "./routes/cliente";
import { pedidoRoutes } from "./routes/pedido";

async function bootstrap() {
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {
        origin: true,
    })

    // http://localhost:3333/pools/count

    // Em produção isso precisa ser uma variável de ambiente
    await fastify.register(jwt, {
        secret: 'algoqualquer',
    })

    await fastify.register(produtoRoutes); 
    await fastify.register(clienteRoutes); 
    await fastify.register(pedidoRoutes); 

    

    await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap();
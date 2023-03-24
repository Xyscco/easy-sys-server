import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"

import { z } from 'zod';
import ShortUniqueId from 'short-unique-id';
import { authenticate } from "../plugins/authenticate";

export async function pedidoRoutes(fastify: FastifyInstance) {

    fastify.get('/pedido', async (request, reply) => {

        try {
            const pedidos = await prisma.pedido.findMany({
                // include: {
                //     produtosPedido: true,
                //     entregas: true
                // }
            });
            return pedidos;
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao buscar pedidos" });
        }

    })

    fastify.get('/pedido/:id', {
        // onRequest: [authenticate]
    }, async (request, reply) => {
        const getProdutosParams = z.object({
            id: z.string()
        })

        const { id } = getProdutosParams.parse(request.params);

        try {
            const pedido = await prisma.pedido.findUnique({
                where: { id },
                include: {
                    produtosPedido: {
                        select: {
                            id: true,
                            quantidade: true,
                            produto: {
                                select: {
                                    id: true,
                                    descricao: true,
                                    valor: true
                                }
                            }
                        }
                    },
                    entregas: {
                        select: {
                            id: true,
                            dataEntrega: true,
                            ProdutoEntrega: {
                                select: {
                                    id: true,
                                    quantidade: true,
                                    produto: {
                                        select: {
                                            id: true,
                                            descricao: true,
                                            valor: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!pedido)
                return reply.status(404).send({ "msg": "Pedido não encontrado" });
            else
                return reply.status(200).send(pedido);

        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao buscar produto" });
        }

    })

    fastify.post('/pedido', async (request, reply) => {
        const createPedidoBody = z.object({
            valorTotal: z.number(),
            status: z.number(),
            dataEntrega: z.string(),
            clienteId: z.string(),
            produtosPedido: z.array(z.object({
                produtoId: z.string(),
                quantidade: z.number()
            }))
        })

        const {
            valorTotal,
            status,
            dataEntrega,
            clienteId,
            produtosPedido } = createPedidoBody.parse(request.body)

        const generate = new ShortUniqueId({ length: 6 });
        const code = String(generate()).toUpperCase();

        try {
            // await request.jwtVerify();

            await prisma.pedido.create({
                data: {
                    codPedido: code,
                    valorTotal: valorTotal,
                    status,
                    dataEntrega,
                    clienteId,
                    produtosPedido: {
                        create: produtosPedido
                    }
                }
            })

            return reply.status(201).send({ "msg": "Pedido inserido com sucesso" })
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao inserir pedido!" })
        }
    })

    fastify.post('/pedido/:idPedido/entrega', async (request, reply) => {
        const createEntregaBody = z.object({
            dataEntrega: z.string(),
            produtosEntrega: z.array(z.object({
                produtoId: z.string(),
                quantidade: z.number()
            }))
        })

        const createEntregaParams = z.object({
            idPedido: z.string()
        })

        const {
            dataEntrega,
            produtosEntrega } = createEntregaBody.parse(request.body);

        const { idPedido } = createEntregaParams.parse(request.params);

        try {
            // await request.jwtVerify();

            await prisma.entrega.create({
                data: {
                    pedidoId: idPedido,
                    dataEntrega: dataEntrega,
                    ProdutoEntrega: {
                        create: produtosEntrega
                    }
                }
            })

            return reply.status(201).send({ "msg": "Entrega inserida com sucesso" })
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao inserir entrega!" })
        }
    })

    fastify.put('/pedido/:id',
        // {
        // onRequest: [authenticate]
        // }, 
        async (request, reply) => {
            const updatePedidoBody = z.object({
                valorTotal: z.number(),
                status: z.number(),
                dataEntrega: z.string(),
                clienteId: z.string(),
                produtosPedido: z.array(z.object({
                    id: z.string(),
                    produtoId: z.string(),
                    quantidade: z.number()
                }))
            })

            const updatePedidoParams = z.object({
                id: z.string()
            })

            const {
                valorTotal,
                status,
                dataEntrega,
                clienteId,
                produtosPedido } = updatePedidoBody.parse(request.body);

            const { id } = updatePedidoParams.parse(request.params);

            try {
                // await request.jwtVerify();

                await prisma.pedido.update({
                    where: {
                        id
                    },
                    data: {
                        valorTotal: valorTotal,
                        status,
                        dataEntrega,
                        clienteId
                    }
                })

                for (let index = 0; index < produtosPedido.length; index++) {
                    const idProdutoPedido = produtosPedido[index].id
                    await prisma.produtoPedido.upsert({
                        where: {
                            id: idProdutoPedido
                        },
                        update: {
                            quantidade: produtosPedido[index].quantidade
                        },
                        create: {
                            produtoId: produtosPedido[index].produtoId,
                            pedidoId: id,
                            quantidade: produtosPedido[index].quantidade
                        }
                    })

                }

                return reply.status(201).send({ "msg": "Pedido atualizado com sucesso" })
            } catch (error) {
                console.log(error);
                return reply.status(400).send({ "msg": "Erro ao atualizado pedido!" })
            }
        })

    fastify.delete('/pedido/produto/:idPedidoProduto', {
        // onRequest: [authenticate]
    }, async (request, reply) => {
        const deletePedidoParams = z.object({
            idPedidoProduto: z.string()
        })

        const { idPedidoProduto } = deletePedidoParams.parse(request.params);

        try {

            const produtoPedido = await prisma.produtoPedido.findUnique({
                where: { id: idPedidoProduto }
            })

            if (!produtoPedido)
                return reply.status(404).send({ "msg": "Produto não encontrado no pedido" });
            else {
                await prisma.produtoPedido.delete({ where: { id: idPedidoProduto } });
                return reply.status(200).send({ "msg": "Produto removido do pedido com sucesso!" });
            }

        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao remover produto do pedido" });
        }

    })

    fastify.delete('/pedido/:id', {
        // onRequest: [authenticate]
    }, async (request, reply) => {
        const deletePedidoParams = z.object({
            id: z.string()
        })

        const { id } = deletePedidoParams.parse(request.params);

        try {

            const pedido = await prisma.pedido.findUnique({
                where: { id },
                include: {
                    produtosPedido: true
                }
            })

            if (!pedido)
                return reply.status(404).send({ "msg": "Pedido não encontrado" });
            else {

                const countEntregas = await prisma.entrega.count({ where: { pedidoId: id } });

                if (countEntregas > 0)
                    return reply.status(404).send({ "msg": "Não é possível excluir pedido com entrega vinculada!" });
                else {
                    const deleteProdutosPedidos = prisma.produtoPedido.deleteMany({
                        where: {
                            pedidoId: id,
                        },
                    })

                    const deletePedido = prisma.pedido.delete({
                        where: {
                            id
                        },
                    })

                    const transaction = await prisma.$transaction([deleteProdutosPedidos, deletePedido])

                    return reply.status(200).send({ "msg": "Pedido excluído com sucesso!" });
                }
            }

        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao excluir pedido" });
        }

    })

    fastify.delete('/pedido/entrega/:idEntrega', {
        // onRequest: [authenticate]
    }, async (request, reply) => {
        const deleteEntregaParams = z.object({
            idEntrega: z.string()
        })

        const { idEntrega } = deleteEntregaParams.parse(request.params);

        try {

            const entrega = await prisma.entrega.findUnique({
                where: { id: idEntrega }
            })

            if (!entrega)
                return reply.status(404).send({ "msg": "Entrega não encontrada" });
            else {
                const deleteProdutosEntrega = prisma.produtoEntrega.deleteMany({
                    where: {
                        entregaId: idEntrega,
                    },
                })

                const deleteEntrega = prisma.pedido.delete({
                    where: {
                        id: idEntrega
                    },
                })

                const transaction = await prisma.$transaction([deleteProdutosEntrega, deleteEntrega])

                return reply.status(200).send({ "msg": "Entrega excluída com sucesso!" });
            }

        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao excluir entrega" });
        }

    })

}


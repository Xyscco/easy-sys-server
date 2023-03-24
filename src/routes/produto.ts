import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"

import { z } from 'zod';
// import ShortUniqueId from 'short-unique-id';
import { authenticate } from "../plugins/authenticate";

export async function produtoRoutes(fastify: FastifyInstance) {
    fastify.get('/produto', async (request, reply) => {

        try {
            const produtos = await prisma.produto.findMany();
            return produtos; 
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao buscar produtos"});
        }
        
    })

    fastify.post('/produto', async (request, reply) => {
        const createProdutoBody = z.object({
            descricao: z.string(),
            valor: z.number(),
            estoque: z.number(),
        })

        const { descricao, valor, estoque } = createProdutoBody.parse(request.body)

        // const generate = new ShortUniqueId({ length: 6 });
        // const code = String(generate()).toUpperCase();

        try {
            // await request.jwtVerify();

            let objInclusao: any = {
                descricao,
                valor,
                estoque
            }

            await prisma.produto.create({
                data: objInclusao
            })

            return reply.status(201).send({ "msg": "Produto inserido com sucesso" })
        } catch(error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao inserir produto!" })
        }

        
    })

    fastify.put('/produto/:id', 
        // {
        // onRequest: [authenticate]
    // }, 
        async (request, reply) => {
            const updateProdutoBody = z.object({
                descricao: z.string(),
                valor: z.number(),
                estoque: z.number(),
            })
            
            const updateProdutoParams = z.object({
                id: z.string()
            })
    
            const { descricao, valor, estoque } = updateProdutoBody.parse(request.body)
            const { id } = updateProdutoParams.parse(request.params);
    
            // const generate = new ShortUniqueId({ length: 6 });
            // const code = String(generate()).toUpperCase();
    
            try {
                // await request.jwtVerify();

                const produto = await prisma.produto.findUnique({ where: {id}});

                if (!produto)
                    return reply.status(404).send({ "msg": "Produto não encontrado"});
                else {
                    let objAlteracao: any = {
                        descricao,
                        valor,
                        estoque
                    }
        
                    await prisma.produto.update({
                        data: objAlteracao,
                        where: { id }
                    })
        
                    return reply.status(201).send({ "msg": "Produto alterado com sucesso" })
                }
            } catch(error) {
                console.log(error);
                return reply.status(400).send({ "msg": "Erro ao alterar produto!" })
            }
    })

    fastify.delete('/produto/:id', {
        // onRequest: [authenticate]
    },async (request, reply) => {
        const getProdutoParams = z.object({
            id: z.string()
        })

        const { id } = getProdutoParams.parse(request.params);

        try {

            const produto = await prisma.produto.findUnique({ where: {id}}) 

            if (!produto)
                return reply.status(404).send({ "msg": "Produto não encontrado"});
            else {
                await prisma.produto.delete({ where: { id, } });
                return reply.status(200).send({ "msg": "Produto excluído com sucesso!"});
            }
                     
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao excluir produto"});
        }

        
    })

    fastify.get('/produto/:id', {
        // onRequest: [authenticate]
    },async (request, reply) => {
        const getProdutosParams = z.object({
            id: z.string()
        })

        const { id } = getProdutosParams.parse(request.params);

        try {
            const produto = await prisma.produto.findUnique({ where: {id}}) 

            if (!produto) 
                return reply.status(404).send({ "msg": "Produto não encontrado"});
            else 
                return reply.status(200).send(produto);
                     
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao buscar produto"});
        }
        
    })

}


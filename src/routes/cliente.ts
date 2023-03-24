import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"

import { z } from 'zod';
// import ShortUniqueId from 'short-unique-id';
import { authenticate } from "../plugins/authenticate";

export async function clienteRoutes(fastify: FastifyInstance) {
    fastify.get('/cliente', async (request, reply) => {

        try {
            const clientes = await prisma.cliente.findMany({
                include: {
                    enderecos: true, 
                    telefones: true
                }
            });
            return clientes; 
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao buscar clientes"});
        }
        
    })

    fastify.get('/cliente/:id', {
        // onRequest: [authenticate]
    },async (request, reply) => {
        const getClienteParams = z.object({
            id: z.string()
        })

        const { id } = getClienteParams.parse(request.params);

        try {
            const cliente = await prisma.cliente.findUnique(
                { 
                    where: {
                        id
                    }, include: {
                            enderecos: {
                                where: {
                                    clienteId: id
                                }
                            }, telefones: {
                                where: {
                                    clienteId: id
                                }
                            }
                        }
                }
            ); 

            if (!cliente) 
                return reply.status(404).send({ "msg": "Cliente não encontrado"});
            else 
                return reply.status(200).send(cliente);
                     
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao buscar cliente"});
        }
        
    })

    fastify.post('/cliente', async (request, reply) => {
        const createClienteBody = z.object({
            nomeRazao: z.string(),
            fantasiaApelido: z.string(),
            cpfCnpj: z.string(),          
            rg: z.string(),               
            inscricaoEstadual: z.string(),
            dataNascimento: z.string(),   
            sexo: z.string(),             
            email: z.string().email(),            
            enderecos: z.array(z.object({
                logradouro: z.string(),
                numero: z.string(),
                complemento: z.string(),
                bairro: z.string(),
                cidade: z.string(),
                estado: z.string(),
                cep: z.string(),
            })),
            telefones: z.array(z.object({
                numero: z.string(),
                tipo: z.string(),
            }))
        })

        const { 
            nomeRazao,
            fantasiaApelido,
            cpfCnpj,          
            rg,               
            inscricaoEstadual,
            dataNascimento,   
            sexo,             
            email,    
            enderecos,        
            telefones
        } = createClienteBody.parse(request.body)

        // const generate = new ShortUniqueId({ length: 6 });
        // const code =: z.string(),(generate()).toUpperCase();

        try {
            // await request.jwtVerify();

            await prisma.cliente.create({
                data: {
                        nomeRazao,
                        fantasiaApelido,
                        cpfCnpj,          
                        rg,               
                        inscricaoEstadual,
                        dataNascimento,   
                        sexo,             
                        email,
    
                        enderecos: {
                            create: enderecos
                        },

                        telefones: {
                            create: telefones
                        }
                    }
            })

            return reply.status(201).send({ "msg": "Cliente inserido com sucesso" })
        } catch(error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao inserir cliente!" })
        }
    })

    fastify.put('/cliente/:id', 
        // {
        // onRequest: [authenticate]
    // }, 
        async (request, reply) => {
            const updateClienteBody = z.object({
                nomeRazao: z.string(),
                fantasiaApelido: z.string(),
                cpfCnpj: z.string(),          
                rg: z.string(),               
                inscricaoEstadual: z.string(),
                dataNascimento: z.string(),   
                sexo: z.string(),             
                email: z.string().email(),
            })
            
            const updateClienteParams = z.object({
                id: z.string()
            })
    
            const { 
                nomeRazao,
                fantasiaApelido,
                cpfCnpj,          
                rg,               
                inscricaoEstadual,
                dataNascimento,   
                sexo,             
                email
            } = updateClienteBody.parse(request.body);
            const { id } = updateClienteParams.parse(request.params);
    
            // const generate = new ShortUniqueId({ length: 6 });
            // const code =: z.string(),(generate()).toUpperCase();
    
            try {
                // await request.jwtVerify();

                const cliente = await prisma.cliente.findUnique({ where: {id}});

                if (!cliente)
                    return reply.status(404).send({ "msg": "Cliente não encontrado"});
                else {
        
                    await prisma.cliente.update({
                        data: {
                            nomeRazao,
                            fantasiaApelido,
                            cpfCnpj,          
                            rg,               
                            inscricaoEstadual,
                            dataNascimento,   
                            sexo,             
                            email
                        },
                        where: { id }
                    })
        
                    return reply.status(201).send({ "msg": "Cliente alterado com sucesso" })
                }
            } catch(error) {
                console.log(error);
                return reply.status(400).send({ "msg": "Erro ao alterar cliente!" })
            }
    })

    fastify.delete('/cliente/:id', {
        // onRequest: [authenticate]
    },async (request, reply) => {
        const getClienteParams = z.object({
            id: z.string()
        })

        const { id } = getClienteParams.parse(request.params);

        try {

            const cliente = await prisma.cliente.findUnique({ where: {id}}) 

            if (!cliente)
                return reply.status(404).send({ "msg": "Cliente não encontrado"});
            else {
                await prisma.endereco.deleteMany({ where: {clienteId: id}});
                await prisma.telefone.deleteMany({ where: {clienteId: id}});

                await prisma.cliente.delete({ where: { id } });
                return reply.status(200).send({ "msg": "Cliente excluído com sucesso!"});
            }
                     
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao excluir cliente"});
        }

    })

    fastify.post('/cliente/endereco', 
    // {
    // onRequest: [authenticate]
    // }, 
    async (request, reply) => {
        const createEnderecoBody = z.object({
            clienteId: z.string(),
            logradouro: z.string(),
            numero: z.string(),
            complemento: z.string(),
            bairro: z.string(),
            cidade: z.string(),
            estado: z.string(),
            cep: z.string(),
        })

        const { 
            clienteId,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            cep
        } = createEnderecoBody.parse(request.body);

        try {
            // await request.jwtVerify();

            const cliente = await prisma.cliente.findUnique({ where: {id: clienteId}});

            if (!cliente)
                return reply.status(404).send({ "msg": "Cliente não encontrado"});
            else {
    
                await prisma.endereco.create({
                    data: {
                        clienteId,
                        logradouro,
                        numero,
                        complemento,
                        bairro,
                        cidade,
                        estado,
                        cep
                    }
                })
    
                return reply.status(201).send({ "msg": "Endereço incluido com sucesso" })
            }
        } catch(error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao incluir endereço!" })
        }   
    })

    fastify.put('/cliente/endereco/:id', 
        // {
        // onRequest: [authenticate]
    // }, 
        async (request, reply) => {
            const updateEnderecoBody = z.object({
                logradouro: z.string(),
                numero: z.string(),
                complemento: z.string(),
                bairro: z.string(),
                cidade: z.string(),
                estado: z.string(),
                cep: z.string(),
            })
            
            const updateClienteParams = z.object({
                id: z.string()
            })
    
            const { 
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                cep
            } = updateEnderecoBody.parse(request.body);
            const { id } = updateClienteParams.parse(request.params);
    
            // const generate = new ShortUniqueId({ length: 6 });
            // const code =: z.string(),(generate()).toUpperCase();
    
            try {
                // await request.jwtVerify();

                const endereco = await prisma.endereco.findUnique({ where: {id}});

                if (!endereco)
                    return reply.status(404).send({ "msg": "Endereço não encontrado"});
                else {
        
                    await prisma.endereco.update({
                        data: {
                            logradouro,
                            numero,
                            complemento,
                            bairro,
                            cidade,
                            estado,
                            cep
                        },
                        where: { id }
                    })
        
                    return reply.status(201).send({ "msg": "Endereço alterado com sucesso" })
                }
            } catch(error) {
                console.log(error);
                return reply.status(400).send({ "msg": "Erro ao alterar endereço!" })
            }
    })

    fastify.delete('/cliente/endereco/:id', {
        // onRequest: [authenticate]
    },async (request, reply) => {
        const getEderecoParams = z.object({
            id: z.string()
        })

        const { id } = getEderecoParams.parse(request.params);

        try {

            const endereco = await prisma.endereco.findUnique({ where: {id}}) 

            if (!endereco)
                return reply.status(404).send({ "msg": "Endereço não encontrado"});
            else {
                await prisma.endereco.deleteMany({ where: { id }});

                return reply.status(200).send({ "msg": "Endereço excluído com sucesso!"});
            }
                     
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao excluir endereço"});
        }

    })

    fastify.post('/cliente/telefone', 
        // {
        // onRequest: [authenticate]
    // }, 
        async (request, reply) => {
            const createTelefoneBody = z.object({
                clienteId: z.string(),
                numero: z.string(),
                tipo: z.string(),
            });
    
            const { clienteId, numero, tipo } = createTelefoneBody.parse(request.body);
    
            // const generate = new ShortUniqueId({ length: 6 });
            // const code =: z.string(),(generate()).toUpperCase();
    
            try {
                // await request.jwtVerify();

                const cliente = await prisma.cliente.findUnique({ where: { id: clienteId }});

                if (!cliente)
                    return reply.status(404).send({ "msg": "Cliente não encontrado"});
                else {
        
                    await prisma.telefone.create({
                        data: {
                            clienteId,
                            numero,
                            tipo
                        }
                    })
        
                    return reply.status(201).send({ "msg": "Telefone incluído com sucesso" })
                }
            } catch(error) {
                console.log(error);
                return reply.status(400).send({ "msg": "Erro ao incluir telefone!" })
            }
    })

    fastify.put('/cliente/telefone/:id', 
        // {
        // onRequest: [authenticate]
    // }, 
        async (request, reply) => {
            const updateTelefoneBody = z.object({
                numero: z.string(),
                tipo: z.string(),
            });
            
            const updateTelefoneParams = z.object({
                id: z.string()
            })
    
            const { 
                numero,
                tipo
            } = updateTelefoneBody.parse(request.body);
            const { id } = updateTelefoneParams.parse(request.params);
    
            // const generate = new ShortUniqueId({ length: 6 });
            // const code =: z.string(),(generate()).toUpperCase();
    
            try {
                // await request.jwtVerify();

                const telefone = await prisma.telefone.findUnique({ where: {id}});

                if (!telefone)
                    return reply.status(404).send({ "msg": "Telefone não encontrado"});
                else {
        
                    await prisma.telefone.update({
                        data: {
                            numero,
                            tipo
                        },
                        where: { id }
                    })
        
                    return reply.status(201).send({ "msg": "Telefone alterado com sucesso" })
                }
            } catch(error) {
                console.log(error);
                return reply.status(400).send({ "msg": "Erro ao alterar telefone!" })
            }
    })

    fastify.delete('/cliente/telefone/:id', {
        // onRequest: [authenticate]
    },async (request, reply) => {
        const getTelefoneParams = z.object({
            id: z.string()
        })

        const { id } = getTelefoneParams.parse(request.params);

        try {

            const telefone = await prisma.telefone.findUnique({ where: {id}}) 

            if (!telefone)
                return reply.status(404).send({ "msg": "Telefone não encontrado"});
            else {
                await prisma.telefone.deleteMany({ where: { id }});

                return reply.status(200).send({ "msg": "Telefone excluído com sucesso!"});
            }
                     
        } catch (error) {
            console.log(error);
            return reply.status(400).send({ "msg": "Erro ao excluir telefone"});
        }

    })

}


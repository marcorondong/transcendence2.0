import { items } from '../data/data';
import { itemInterface, Params, AddItemBody } from '../interfaces/interfaces';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export const getItems = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await reply.send(items);  // Ensuring async consistency
    } catch (error) {
        reply.code(500).send({ message: "Internal Server Error" });
    }
};

export const getItem = async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    try {
        const id = parseInt(request.params.id);
        const item = items.find((item: itemInterface) => item.id === id);

        if (!item) {
            return reply.code(404).send({ message: "Item not found" });
        }

        await reply.send(item);
    } catch (error) {
        reply.code(500).send({ message: "Internal Server Error" });
    }
};

export const addItem = async (request: FastifyRequest<{ Body: AddItemBody }>, reply: FastifyReply) => {
    try {
        const { name } = request.body;
        const item = { id: items.length + 1, name };
        items.push(item);

        await reply.code(201).send(item);
    } catch (error) {
        reply.code(500).send({ message: "Internal Server Error" });
    }
};

export const deleteItem = async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    try {
        const id = parseInt(request.params.id);
        const itemIndex = items.findIndex((item: itemInterface) => item.id === id);

        if (itemIndex === -1) {
            return reply.code(404).send({ message: "Item not found" });
        }

        items.splice(itemIndex, 1);
        await reply.send({ message: `Item ${id} has been deleted` });
    } catch (error) {
        reply.code(500).send({ message: "Internal Server Error" });
    }
};

export const updateItem = async (request: FastifyRequest<{ Params: Params, Body: AddItemBody }>, reply: FastifyReply) => {
    try {
        const id = parseInt(request.params.id);
        const { name } = request.body;
        const itemIndex = items.findIndex((item: itemInterface) => item.id === id);

        if (itemIndex === -1) {
            return reply.code(404).send({ message: "Item not found" });
        }

        items[itemIndex] = { id, name };
        await reply.send({ message: `Item ${id} has been updated` });
    } catch (error) {
        reply.code(500).send({ message: "Internal Server Error" });
    }
};

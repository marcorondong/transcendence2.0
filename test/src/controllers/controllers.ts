import { items, itemInterface, Params, AddItemBody } from '../items/items';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';



export const getItems = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send(items);
}

export const getItem = async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    const id = request.params.id;
    const item = items.find((item: itemInterface) => item.id === parseInt(id));
    reply.send(item);
}

export const addItem = async (request: FastifyRequest<{ Body: AddItemBody }>, reply: FastifyReply) => {
    const { name } = request.body;
    const item = { id: items.length + 1, name };
    items.push(item);
    reply.code(201).send(item);
}

export const deleteItem = async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    const id = request.params.id;
    const itemIndex = items.findIndex((item: itemInterface) => item.id === parseInt(id));
    items.splice(itemIndex, 1);
    reply.send({ message: `Item ${id} has been deleted` });
}

export const updateItem = async (request: FastifyRequest<{ Params: Params, Body: AddItemBody }>, reply: FastifyReply) => {
    const id = request.params.id;
    const { name } = request.body;
    const itemIndex = items.findIndex((item: itemInterface) => item.id === parseInt(id));
    items[itemIndex] = { id: parseInt(id), name };
    reply.send({ message: `Item ${id} has been updated` });
}

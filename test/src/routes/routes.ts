import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getItemsOpts, getItemOpts, postItemOpts, deleteItemOpts, updateItemOpts } from '../opts/opts';

export function itemRoutes(fastifyItems: FastifyInstance, options: any, done: any) {
    // Get all items
    fastifyItems.get('/items', getItemsOpts);
    // Get a single item
    fastifyItems.get('/items/:id', getItemOpts);
    // Add a new item
    fastifyItems.post('/items', postItemOpts);
    // Delete
    fastifyItems.delete('/items/:id', deleteItemOpts);
    // Update
    fastifyItems.put('/items/:id', updateItemOpts);

    done();
}
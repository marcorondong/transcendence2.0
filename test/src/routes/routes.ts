import { getItems, getItem, addItem, deleteItem, updateItem } from '../controllers/controllers';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const Item = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        name: { type: 'string' }
    }
};

const getItemsOpts = {
    schema: {
        response: {
            200: {
                type: 'array',
                items: Item
            }
        }
    },
    handler: getItems
};

const getItemOpts = {
    schema: {
        response: {
            200: Item
        }
    },
    handler: getItem
};

const postItemOpts = {
    schema: {
        body: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string' }
            }
        },
        response: {
            201: Item
        }
    },
    handler: addItem
};

const deleteItemOpts = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    handler: deleteItem
};

const updateItemOpts = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    handler: updateItem
};

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
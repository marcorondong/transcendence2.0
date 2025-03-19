

const Item = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        name: { type: 'string' }
    }
};


export const ItemsSchema = {
    response: {
        200: {
            type: 'array',
            items: Item
        }
    }
};

export const ItemSchema = {
    response: {
        200: Item
    }
};

export const AddItemSchema = {
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
};

export const DeleteItemSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
};

export const UpdateItemSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
};
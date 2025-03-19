
import { getItems, getItem, addItem, deleteItem, updateItem } from '../controllers/controllers';
import { ItemsSchema, ItemSchema, AddItemSchema, DeleteItemSchema, UpdateItemSchema } from '../schemas/schemas';

export const getItemsOpts = (fastifyItems: any) => ({
    schema: ItemsSchema,
    preHandler: [fastifyItems.authenticate],
    handler: getItems
});

export const getItemOpts = {
    schema: ItemSchema,
    handler: getItem
};

export const postItemOpts = {
    schema: AddItemSchema,
    handler: addItem
};

export const deleteItemOpts = {
    schema: DeleteItemSchema,
    handler: deleteItem
};

export const updateItemOpts = {
    schema: UpdateItemSchema,
    handler: updateItem
};
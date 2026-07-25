const controller = require('../controller/inventoryController');

function setInventoryRoutes(app) {
    app.get('/items', controller.getAllItems);
    app.get('/items/:id', controller.getItemById);
    app.post('/items', controller.createItem);
    app.patch('/items/:id', controller.updateItem);
    app.delete('/items/:id', controller.deleteItem);
}

module.exports = setInventoryRoutes;
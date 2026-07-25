const customFramework = require('./custom-framework');
const setInventoryRoutes = require('./routes/inventoryRoutes');

const app = customFramework();
const PORT = 3000;

// Middleware registration
app.use(customFramework.json());

// Root route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Welcome to the Modular Inventory API' });
});

// Register feature routes
setInventoryRoutes(app);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
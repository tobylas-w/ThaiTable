"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const menu_1 = __importDefault(require("./menu"));
const order_1 = __importDefault(require("./order"));
const restaurant_1 = __importDefault(require("./restaurant"));
const categories_1 = __importDefault(require("./categories"));
const tables_1 = __importDefault(require("./tables"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
router.use('/auth', auth_1.default);
router.use('/menu', menu_1.default);
router.use('/categories', categories_1.default);
router.use('/order', order_1.default);
router.use('/restaurant', restaurant_1.default);
router.use('/tables', tables_1.default);
exports.default = router;

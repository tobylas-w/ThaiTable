"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load .env file into process.env
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config();
}
exports.env = {
    PORT: process.env.PORT || '3000',
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'changeme',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};

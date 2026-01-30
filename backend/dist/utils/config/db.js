"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(env_1.config.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('✅ MongoDB disconnected');
    }
    catch (error) {
        console.error('❌ MongoDB disconnection failed:', error);
        throw error;
    }
};
exports.disconnectDB = disconnectDB;

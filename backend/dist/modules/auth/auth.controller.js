"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        const result = await (0, auth_service_1.registerService)(name, email, password);
        const statusCode = result.success ? 201 : 400;
        res.status(statusCode).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        const result = await (0, auth_service_1.loginService)(email, password);
        const statusCode = result.success ? 200 : 401;
        res.status(statusCode).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.login = login;

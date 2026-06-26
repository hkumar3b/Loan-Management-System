"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginService = exports.registerService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../user/user.model"));
const ApiResponse_1 = require("../../utils/ApiResponse");
const registerService = async (name, email, password) => {
    // Check if email already exists
    const existingUser = await user_model_1.default.findOne({ email });
    if (existingUser) {
        return new ApiResponse_1.ApiResponse(false, 'Email already registered');
    }
    // Hash password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    // Create user — role defaults to 'borrower'
    const user = await user_model_1.default.create({
        name,
        email,
        password: hashedPassword,
    });
    const token = generateToken(user);
    return new ApiResponse_1.ApiResponse(true, 'Registration successful', {
        token,
        user: sanitizeUser(user),
    });
};
exports.registerService = registerService;
const loginService = async (email, password) => {
    // Find user
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        return new ApiResponse_1.ApiResponse(false, 'Invalid email or password');
    }
    // Compare password
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return new ApiResponse_1.ApiResponse(false, 'Invalid email or password');
    }
    const token = generateToken(user);
    return new ApiResponse_1.ApiResponse(true, 'Login successful', {
        token,
        user: sanitizeUser(user),
    });
};
exports.loginService = loginService;
// ── Helpers ──────────────────────────────────────────────
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
};
const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
});

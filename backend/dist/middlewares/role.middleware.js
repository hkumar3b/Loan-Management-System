"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json(new ApiResponse_1.ApiResponse(false, 'Not authenticated'));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res
                .status(403)
                .json(new ApiResponse_1.ApiResponse(false, 'Access denied. You do not have permission.'));
            return;
        }
        next();
    };
};
exports.authorize = authorize;

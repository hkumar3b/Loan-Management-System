"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotalRepayment = void 0;
const calculateTotalRepayment = (principal, tenureDays, ratePerAnnum = 12) => {
    const si = (principal * ratePerAnnum * tenureDays) / (365 * 100);
    const total = principal + si;
    return Math.round(total * 100) / 100;
};
exports.calculateTotalRepayment = calculateTotalRepayment;

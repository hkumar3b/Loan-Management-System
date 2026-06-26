export const calculateTotalRepayment = (
  principal: number,
  tenureDays: number,
  ratePerAnnum: number = 12
): number => {
  const si = (principal * ratePerAnnum * tenureDays) / (365 * 100);
  const total = principal + si;
  return Math.round(total * 100) / 100;
};
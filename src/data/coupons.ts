export interface Coupon {
  code: string;
  discount: number;
  description: string;
}

export const COUPONS: Coupon[] = [
  { code: 'GALVAN10', discount: 0.10, description: '10% de descuento en toda tu compra' },
  { code: 'SURTE15', discount: 0.15, description: '15% de descuento en toda tu compra' },
];

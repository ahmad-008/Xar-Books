export const discountPercent = (price: number, finalPrice: number) =>
    price > finalPrice && price > 0 ? Math.round(((price - finalPrice) / price) * 100) : 0;

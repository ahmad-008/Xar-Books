import { describe, expect, it } from "vitest";
import { discountPercent } from "@/lib/discount";

describe("discountPercent", () => {
    it("rounds to a whole percent", () => {
        expect(discountPercent(30, 20)).toBe(33);
        expect(discountPercent(100, 54)).toBe(46);
    });

    it("is 0 when there is no discount", () => {
        expect(discountPercent(20, 20)).toBe(0);
        expect(discountPercent(20, 25)).toBe(0);
        expect(discountPercent(0, 0)).toBe(0);
    });
});

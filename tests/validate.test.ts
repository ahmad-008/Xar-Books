import { describe, expect, it } from "vitest";
import { checkEmail, checkName, checkPassword, checkPrices } from "@/server/utils/validate";

describe("checkName", () => {
    it("trims and accepts a normal name", () => {
        expect(checkName("  Ada Lovelace ")).toBe("Ada Lovelace");
    });

    it("rejects names that are too short or too long", () => {
        expect(() => checkName(" a ")).toThrow("Name must be 2 to 50 characters");
        expect(() => checkName("x".repeat(51))).toThrow("Name must be 2 to 50 characters");
    });
});

describe("checkEmail", () => {
    it("trims and lowercases", () => {
        expect(checkEmail("  Ada@Example.COM ")).toBe("ada@example.com");
    });

    it.each(["ada", "ada@", "ada@example", "ada@@example.com", "a b@example.com"])("rejects %s", (email) => {
        expect(() => checkEmail(email)).toThrow("Enter a valid email");
    });
});

describe("checkPassword", () => {
    it("accepts a password with a letter and a number", () => {
        expect(() => checkPassword("bookworm42")).not.toThrow();
    });

    it("rejects the wrong length", () => {
        expect(() => checkPassword("ab1")).toThrow("8 to 72 characters");
        expect(() => checkPassword("a1".repeat(37))).toThrow("8 to 72 characters");
    });

    it("needs a letter and a non-letter", () => {
        expect(() => checkPassword("onlyletters")).toThrow("a letter and a number or symbol");
        expect(() => checkPassword("1234567890123")).toThrow("a letter and a number or symbol");
    });

    it("rejects common passwords in any case", () => {
        expect(() => checkPassword("Password123")).toThrow("too common");
    });
});

describe("checkPrices", () => {
    it("accepts valid prices", () => {
        expect(() => checkPrices(20, 15, 5)).not.toThrow();
        expect(() => checkPrices(10, 10, 0)).not.toThrow();
    });

    it("rejects prices outside $0.50 to $10,000", () => {
        expect(() => checkPrices(0.4, 0.4, 0)).toThrow("between $0.50 and $10,000");
        expect(() => checkPrices(20000, 15, 0)).toThrow("between $0.50 and $10,000");
    });

    it("rejects shipping outside $0 to $100", () => {
        expect(() => checkPrices(20, 15, -1)).toThrow("Shipping");
        expect(() => checkPrices(20, 15, 101)).toThrow("Shipping");
    });

    it("rejects a selling price above the original", () => {
        expect(() => checkPrices(10, 12, 0)).toThrow("can't be higher");
    });
});
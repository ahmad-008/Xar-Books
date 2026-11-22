import { AppError } from "./AppError";

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const COMMON_PASSWORDS = new Set([
    "12345678", "123456789", "1234567890", "87654321", "12341234", "11111111", "00000000",
    "password", "password1", "password12", "password123", "passw0rd", "p@ssw0rd",
    "qwerty12", "qwerty123", "qwertyuiop", "1q2w3e4r", "1qaz2wsx", "abc12345", "abcd1234",
    "iloveyou", "iloveyou1", "sunshine1", "princess1", "football1", "welcome1", "welcome123",
    "admin123", "letmein1", "monkey123", "dragon123", "trustno1", "xarbooks", "xarbooks1",
]);

export const checkName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50 ){
        throw new AppError("Name must be 2 to 50 characters", 400);
    }
    return trimmed;
};

export const checkEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if(trimmed.length > 254 || !EMAIL_PATTERN.test(trimmed)){
        throw new AppError("Enter a valid email", 400);
    }
    return trimmed;
};

export const checkPassword = (password: string) => {
    if(password.length < 8 || password.length > 72){
        throw new AppError("Password must be 8 to 72 characters", 400);
    }

    if (!/[A-Za-z]/.test(password) || !/[^A-Za-z]/.test(password)) {
        throw new AppError("Password must include a letter and a number or symbol", 400);
    }

    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
        throw new AppError("This password is too common, please choose another one", 400);
    }

};    

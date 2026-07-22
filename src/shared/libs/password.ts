import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashing_password = async (plain: string): Promise<string> => {
    return bcrypt.hash(plain, SALT_ROUNDS);
};

export const compare_password = async (plain: string, hashed: string): Promise<boolean> => {
    return bcrypt.compare(plain, hashed);
};

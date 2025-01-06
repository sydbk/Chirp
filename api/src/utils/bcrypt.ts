import bcrypt from "bcryptjs";

export const hashValue = async (value: string) => {
  return bcrypt.hash(value, 10);
};

export const compareValue = async (value: string, hashedValue: string) => {
  return bcrypt.compare(value, hashedValue).catch(() => false);
};

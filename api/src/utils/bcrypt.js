import bcrypt from "bcrypt";

export const hashValue = async (value, saltRounds) => {
  return bcrypt.hash(value, saltRounds || 10);
};

export const compareValue = async (value, hashedValue) => {
  return bcrypt.compare(value, hashedValue).catch(() => false);
};

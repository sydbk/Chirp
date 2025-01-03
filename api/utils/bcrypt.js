import bcrypt from "bcrypt";

export const hashValue = async (value) => {
  return bcrypt.hash(value, 10);
};

export const compareValue = async (value, hashedValue) => {
  return bcrypt.compare(value, hashedValue).catch(() => false);
};

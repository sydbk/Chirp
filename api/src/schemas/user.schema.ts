import { z } from "zod";

const restrictedUsernames = [
  "login",
  "signup",
  "search",
  "notifications",
  "messages",
  "bookmarks",
  "settings",
];

const nameSchema = z
  .string()
  .min(2)
  .max(50)
  .trim()
  .transform((name) => name.replace(/\s+/g, " "));

export const usernameSchema = z
  .string()
  .min(3)
  .max(15)
  .regex(/^[a-zA-Z0-9_]+$/)
  .refine((username) => !restrictedUsernames.includes(username.toLowerCase()), {
    message: "This username is unavailable",
  });

const passwordSchema = z.string().min(6).max(64);

const userAgentSchema = z.string().optional();

const stringSchema = z.string().max(255);

export const signupSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
});

export const loginSchema = z.object({
  username: stringSchema,
  password: stringSchema,
  userAgent: userAgentSchema,
});

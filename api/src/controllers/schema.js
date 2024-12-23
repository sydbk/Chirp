import { z } from "zod";
import { restrictedUsernames } from "../utils/restricted.js";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "What's your name?" })
    .max(50, { message: "Your name must be shorter than 50 characters" })
    .transform((value) =>
      value
        .replace(/\s+/g, " ")
        .replace(/^\s+|\s+$/g, "")
        .replace(/\n+/g, " ")
    ),
  username: z
    .string()
    .trim()
    .min(4, "Your username must be longer than 4 characters")
    .max(15, "Your username must be shorter than 15 characters")
    .refine((username) => /^[a-zA-Z0-9_]+$/.test(username), {
      message: "Your username can only contain letters, numbers and '_'",
    })
    .refine(
      (username) => !restrictedUsernames.includes(username.toLowerCase()),
      { message: "This username is unavailable. Please try another" }
    ),
  password: z
    .string()
    .trim()
    .min(6, { message: "Your password must be at least 6 characters long" })
    .max(255, {
      message: "Your password must be shorter than 255 characters",
    }),
  userAgent: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().max(255, {
    message: "Your username must be shorter than 255 characters.",
  }),
  password: z.string().trim().max(255, {
    message: "Your password must be shorter than 255 characters.",
  }),
  userAgent: z.string().optional(),
});

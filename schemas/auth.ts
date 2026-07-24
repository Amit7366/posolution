import { z } from "zod";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function createLoginSchema(t: TFn) {
  return z.object({
    email: z.string().email(t("auth.validation.invalidEmail")),
    password: z.string().min(6, t("auth.validation.minPassword6")),
  });
}

export function createRegisterSchema(t: TFn) {
  return z
    .object({
      name: z.string().min(2, t("auth.validation.nameMin2")),
      userName: z.string().min(3, t("auth.validation.usernameMin3")),
      email: z.string().email(t("auth.validation.invalidEmail")),
      password: z.string().min(6, t("auth.validation.minPassword6")),
      confirmPassword: z.string().min(6, t("auth.validation.minPassword6")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("auth.validation.passwordsMismatch"),
    });
}

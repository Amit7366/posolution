import { z } from "zod";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

export type LoginIdentifierType = "email" | "phone" | "username";

export function createLoginSchema(t: TFn, identifierType: LoginIdentifierType) {
  const password = z.string().min(6, t("auth.validation.minPassword6"));

  if (identifierType === "email") {
    return z.object({
      identifier: z.string().email(t("auth.validation.invalidEmail")),
      password,
    });
  }

  if (identifierType === "phone") {
    return z.object({
      identifier: z
        .string()
        .min(1, t("auth.validation.phoneRequired"))
        .refine((v) => isValidBdPhone(v), t("auth.validation.invalidPhone")),
      password,
    });
  }

  return z.object({
    identifier: z.string().min(3, t("auth.validation.usernameMin3")),
    password,
  });
}

export function createRegisterSchema(t: TFn) {
  return z
    .object({
      name: z.string().min(2, t("auth.validation.nameMin2")),
      userName: z.string().min(3, t("auth.validation.usernameMin3")),
      email: z.string().email(t("auth.validation.invalidEmail")),
      contactNo: z
        .string()
        .min(1, t("auth.validation.phoneRequired"))
        .refine((v) => isValidBdPhone(v), t("auth.validation.invalidPhone")),
      password: z.string().min(6, t("auth.validation.minPassword6")),
      confirmPassword: z.string().min(6, t("auth.validation.minPassword6")),
      acceptTerms: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("auth.validation.passwordsMismatch"),
    })
    .refine((data) => data.acceptTerms === true, {
      path: ["acceptTerms"],
      message: t("auth.validation.termsRequired"),
    })
    .transform((data) => ({
      ...data,
      contactNo: normalizeBdPhone(data.contactNo),
    }));
}

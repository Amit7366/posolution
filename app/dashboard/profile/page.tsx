"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import PhoneInput from "@/components/auth/PhoneInput";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { uploadImageToCloudinary } from "@/lib/upload-image";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone";
import { cn } from "@/app/lib/cn";
import {
  useCreateStoreMutation,
  useGetMyProfileQuery,
  useGetStoresQuery,
  useUpdateMyProfileMutation,
  useUpdateStoreMutation,
} from "@/redux/api/baseApi";

type TabKey = "personal" | "business";

type PersonalForm = {
  name: string;
  email: string;
  contactNo: string;
  gender: "male" | "female" | "other" | "";
  dateOfBirth?: string;
  presentAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  profileImg?: string;
};

type BusinessForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function formatDob(value?: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>("personal");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profileRes, isLoading: profileLoading, isError } =
    useGetMyProfileQuery();
  const profile = profileRes?.data;

  const { data: storesRes } = useGetStoresQuery({ page: 1, limit: 20 });
  const stores = useMemo(() => {
    const raw = storesRes?.data;
    return (Array.isArray(raw) ? raw : []) as Array<{
      _id: string;
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      slug?: string;
    }>;
  }, [storesRes]);
  const primaryStore = stores[0];

  const [updateProfile, { isLoading: savingPersonal }] =
    useUpdateMyProfileMutation();
  const [createStore, { isLoading: creatingStore }] = useCreateStoreMutation();
  const [updateStore, { isLoading: updatingStore }] = useUpdateStoreMutation();

  const personalSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("auth.validation.nameMin2")),
        email: z.string().email(),
        contactNo: z
          .string()
          .min(1, t("auth.validation.phoneRequired"))
          .refine((v) => isValidBdPhone(v), t("auth.validation.invalidPhone")),
        gender: z.enum(["male", "female", "other", ""]),
        dateOfBirth: z.string().optional(),
        presentAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        profileImg: z.string().optional(),
      }),
    [t]
  );

  const businessSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2),
        phone: z.string(),
        email: z.union([
          z.literal(""),
          z.string().email(t("auth.validation.invalidEmail")),
        ]),
        address: z.string(),
      }),
    [t]
  );

  const personalForm = useForm<PersonalForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(personalSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      contactNo: "",
      gender: "",
      dateOfBirth: "",
      presentAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Bangladesh",
      profileImg: "",
    },
  });

  const businessForm = useForm<BusinessForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(businessSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    personalForm.reset({
      name: profile.name || "",
      email: profile.email || "",
      contactNo: profile.contactNo || "",
      gender: profile.gender || "",
      dateOfBirth: formatDob(profile.dateOfBirth),
      presentAddress: profile.presentAddress || "",
      city: profile.city || "",
      state: profile.state || "",
      postalCode: profile.postalCode || "",
      country: profile.country || "Bangladesh",
      profileImg: profile.profileImg || "",
    });
  }, [profile, personalForm]);

  useEffect(() => {
    businessForm.reset({
      name: primaryStore?.name || "",
      phone: primaryStore?.phone || "",
      email: primaryStore?.email || "",
      address: primaryStore?.address || "",
    });
  }, [primaryStore, businessForm]);

  const userObjectId =
    typeof profile?.user === "string"
      ? profile.user
      : profile?.user?._id || profile?.user?.id;

  const onUploadPhoto = async (file: File) => {
    if (!userObjectId) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      personalForm.setValue("profileImg", url, { shouldDirty: true });
      await updateProfile({
        userId: userObjectId,
        normalUser: { profileImg: url },
      }).unwrap();
      toast.success(t("dash.profile.photoUploaded"));
    } catch {
      toast.error(t("dash.profile.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const onSavePersonal = personalForm.handleSubmit(async (values) => {
    if (!userObjectId) return;
    try {
      await updateProfile({
        userId: userObjectId,
        normalUser: {
          name: values.name,
          contactNo: normalizeBdPhone(values.contactNo),
          gender: values.gender || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          presentAddress: values.presentAddress || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          postalCode: values.postalCode || undefined,
          country: values.country || undefined,
          profileImg: values.profileImg || undefined,
        },
      }).unwrap();
      toast.success(t("dash.profile.personalSaved"));
    } catch (e: unknown) {
      const msg =
        (e as { data?: { message?: string } })?.data?.message ||
        t("dash.profile.saveFailed");
      toast.error(msg);
    }
  });

  const onSaveBusiness = businessForm.handleSubmit(async (values) => {
    try {
      const payload = {
        name: values.name,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        slug: slugify(values.name) || `store-${Date.now()}`,
        status: "active" as const,
      };

      if (primaryStore?._id) {
        await updateStore({
          id: primaryStore._id,
          body: {
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            address: payload.address,
            slug: payload.slug,
          },
        }).unwrap();
      } else {
        await createStore(payload).unwrap();
      }
      toast.success(t("dash.profile.businessSaved"));
    } catch (e: unknown) {
      const msg =
        (e as { data?: { message?: string } })?.data?.message ||
        t("dash.profile.saveFailed");
      toast.error(msg);
    }
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "personal", label: t("dash.profile.tabPersonal") },
    { key: "business", label: t("dash.profile.tabBusiness") },
  ];

  const watchedImg = personalForm.watch("profileImg");
  const watchedName = personalForm.watch("name");
  const watchedEmail = personalForm.watch("email");

  if (profileLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("dash.common.loading")}
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
        {t("dash.profile.loadFailed")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("dash.profile.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("dash.profile.subtitle")}
        </p>
      </div>

      <div className="relative flex gap-8 border-b border-gray-200 dark:border-gray-800">
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "relative pb-3 text-sm font-semibold transition",
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
              )}
            >
              {label}
              {active && (
                <motion.span
                  layoutId="profileTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === "personal" ? (
          <motion.form
            key="personal"
            onSubmit={onSavePersonal}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.22 }}
            className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-6"
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <UserAvatar
                  name={watchedName}
                  email={watchedEmail}
                  src={watchedImg || null}
                  size={80}
                  rounded="full"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-blue-600 text-white shadow dark:border-gray-900"
                  aria-label={t("dash.profile.changePhoto")}
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onUploadPhoto(file);
                    e.target.value = "";
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("dash.profile.photo")}
                </p>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="mt-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {uploading
                    ? t("dash.profile.uploading")
                    : t("dash.profile.changePhoto")}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("dash.profile.name")} error={personalForm.formState.errors.name?.message}>
                <input {...personalForm.register("name")} className={inputClass} />
              </Field>
              <Field
                label={t("dash.profile.email")}
                hint={t("dash.profile.emailReadonly")}
              >
                <input
                  {...personalForm.register("email")}
                  readOnly
                  className={cn(inputClass, "cursor-not-allowed bg-gray-50 dark:bg-gray-900/60")}
                />
              </Field>
              <Field
                label={t("dash.profile.phone")}
                error={personalForm.formState.errors.contactNo?.message}
              >
                <Controller
                  name="contactNo"
                  control={personalForm.control}
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      error={!!personalForm.formState.errors.contactNo}
                      className="!mt-1.5"
                    />
                  )}
                />
              </Field>
              <Field label={t("dash.profile.gender")}>
                <select {...personalForm.register("gender")} className={inputClass}>
                  <option value="">—</option>
                  <option value="male">{t("dash.profile.genderMale")}</option>
                  <option value="female">{t("dash.profile.genderFemale")}</option>
                  <option value="other">{t("dash.profile.genderOther")}</option>
                </select>
              </Field>
              <Field label={t("dash.profile.dateOfBirth")}>
                <input
                  type="date"
                  {...personalForm.register("dateOfBirth")}
                  className={inputClass}
                />
              </Field>
              <Field label={t("dash.profile.country")}>
                <input {...personalForm.register("country")} className={inputClass} />
              </Field>
              <Field label={t("dash.profile.city")}>
                <input {...personalForm.register("city")} className={inputClass} />
              </Field>
              <Field label={t("dash.profile.state")}>
                <input {...personalForm.register("state")} className={inputClass} />
              </Field>
              <Field label={t("dash.profile.postalCode")}>
                <input {...personalForm.register("postalCode")} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t("dash.profile.presentAddress")}>
                  <textarea
                    rows={3}
                    {...personalForm.register("presentAddress")}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPersonal}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
            >
              {savingPersonal
                ? t("dash.common.saving")
                : t("dash.profile.savePersonal")}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="business"
            onSubmit={onSaveBusiness}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-6"
          >
            {!primaryStore && (
              <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                {t("dash.profile.noStoreHint")}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("dash.profile.shopName")}
                error={businessForm.formState.errors.name?.message}
              >
                <input {...businessForm.register("name")} className={inputClass} />
              </Field>
              <Field label={t("dash.profile.shopPhone")}>
                <input {...businessForm.register("phone")} className={inputClass} />
              </Field>
              <Field
                label={t("dash.profile.shopEmail")}
                error={businessForm.formState.errors.email?.message}
              >
                <input
                  type="email"
                  {...businessForm.register("email")}
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t("dash.profile.shopAddress")}>
                  <textarea
                    rows={3}
                    {...businessForm.register("address")}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingStore || updatingStore}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
            >
              {creatingStore || updatingStore
                ? t("dash.common.saving")
                : t("dash.profile.saveBusiness")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

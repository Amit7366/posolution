"use client";

import { useState, type ReactElement, cloneElement, isValidElement } from "react";
import { toast } from "sonner";
import { useCreateCustomerMutation } from "@/redux/api/baseApi";
import { usePosCart } from "./PosCartContext";
import Modal from "@/app/components/ui/Modal";

type Props = {
  trigger: ReactElement;
};

export default function PosQuickCustomerModal({ trigger }: Props) {
  const { setCustomer } = usePosCart();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  function reset() {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const res = await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        status: "active",
      }).unwrap();
      const doc = res?.data ?? res;
      setCustomer({
        id: doc?._id ?? null,
        name: doc?.name ?? name.trim(),
        phone: doc?.phone,
        email: doc?.email,
        address: doc?.address,
      });
      toast.success("Customer added");
      reset();
      setOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to add customer";
      toast.error(msg);
    }
  }

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<{ onClick?: () => void }>, {
        onClick: () => setOpen(true),
      })
    : trigger;

  return (
    <>
      {triggerEl}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        title="Add Customer"
        widthClassName="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 p-1">
          <Field label="Name *" value={name} onChange={setName} required />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Address" value={address} onChange={setAddress} />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {isLoading ? "Saving…" : "Save Customer"}
          </button>
        </form>
      </Modal>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-orange-500"
      />
    </label>
  );
}

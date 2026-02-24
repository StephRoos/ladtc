"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse e-mail invalide"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  newsletter: z.boolean().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type SubmitStatus = "idle" | "loading" | "success" | "error";

/**
 * Contact form with client-side validation using React Hook Form + Zod
 * Submits to /api/contact
 */
export function ContactForm(): React.ReactNode {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      newsletter: false,
    },
  });

  const onSubmit = async (data: ContactFormValues): Promise<void> => {
    setStatus("loading");
    setServerMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as { success: boolean; message: string };

      if (json.success) {
        setStatus("success");
        setServerMessage(json.message);
        reset();
      } else {
        setStatus("error");
        setServerMessage(json.message ?? "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setServerMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Nom complet <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="Jean Dupont"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Adresse e-mail <span className="text-destructive">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="jean@exemple.be"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
          Sujet <span className="text-destructive">*</span>
        </label>
        <input
          id="subject"
          type="text"
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="Je souhaite rejoindre le club"
          {...register("subject")}
        />
        {errors.subject && (
          <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          placeholder="Votre message..."
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      {/* Newsletter */}
      <div className="flex items-center gap-2">
        <input
          id="newsletter"
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
          {...register("newsletter")}
        />
        <label htmlFor="newsletter" className="text-sm text-muted-foreground">
          Je souhaite recevoir la newsletter du club
        </label>
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div className="rounded-md border border-green-500/20 bg-green-500/10 p-3">
          <p className="text-sm text-green-400">{serverMessage}</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{serverMessage}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
      </Button>
    </form>
  );
}

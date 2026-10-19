import { useState } from "react";
import { supabase } from "../lib/supabase";
import { track } from "../lib/analytics";
type Status = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};
export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Capture the form synchronously: React's currentTarget is only valid during the event.
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    setStatus({ kind: "loading", message: "Sending your message…" });
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      company: String(form.get("company") || "").trim(),
      service: String(form.get("service") || ""),
      message: String(form.get("message") || "").trim(),
    };
    if (
      !payload.name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
      payload.message.length < 10 ||
      !form.get("consent")
    ) {
      setStatus({
        kind: "error",
        message:
          "Please check your name, valid email, consent, and message (at least 10 characters).",
      });
      return;
    }
    if (!supabase) {
      setStatus({
        kind: "error",
        message:
          "Form service is not configured yet. Please add Supabase environment variables or contact us via WhatsApp.",
      });
      return;
    }
    try {
      console.log("Submitting contact form:", payload);
      const { error } = await supabase
        .from("contact_submissions")
        .insert({ ...payload, consent: true, source: window.location.href });
      if (error) {
        console.error("Contact submission failed:", error.message);
        setStatus({
          kind: "error",
          message:
            "We could not send your message. Please try again or use WhatsApp.",
        });
        return;
      }
      else {
        console.log("Contact submission successful:", payload);
      }
      track("generate_lead", { form_name: "contact" });
      formElement.reset();
      setStatus({
        kind: "success",
        message:
          "Thanks, your message has been received. We’ll be in touch soon.",
      });
    } catch (error) {
      console.error("Unexpected contact submission error:", error);
      setStatus({
        kind: "error",
        message:
          "A connection problem stopped your message from sending. Please try again or use WhatsApp.",
      });
    }
  }
  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="Alex Morgan"
          />
        </label>
        <label>
          Work email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="alex@company.com"
          />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Company (optional)
          <input
            name="company"
            autoComplete="organization"
            maxLength={160}
            placeholder="Your business"
          />
        </label>
        <label>
          What do you need?
          <select name="service" defaultValue="Business website">
            <option>Business website</option>
            <option>Brand and strategy</option>
            <option>SEO and analytics</option>
            <option>3D / interactive experience</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <label>
        Tell us a little about the project
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          placeholder="Your goals, timeline, and what success looks like…"
        />
      </label>
      <label className="consent">
        <input name="consent" type="checkbox" required /> I agree that my
        details may be used to respond to this enquiry. Read our{" "}
        <a href="/privacy">privacy policy</a>.
      </label>
      <button
        className="button button-dark"
        type="submit"
        disabled={status.kind === "loading"}
      >
        {status.kind === "loading" ? "Sending…" : "Send enquiry ↗"}
      </button>
      {status.message && (
        <p
          role="status"
          aria-live="polite"
          className={`form-status ${status.kind}`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}

'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { FormField, GoogleFormMetadata } from '@/lib/googleForm';

function getInputType(field: FormField) {
  switch (field.type) {
    case 'email':
      return 'email';
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
}

export default function HomePage() {
  const [formUrl, setFormUrl] = useState('');
  const [formState, setFormState] = useState<GoogleFormMetadata | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasForm = useMemo(() => Boolean(formState?.fields.length), [formState]);

  const handleDiscover = async (event: FormEvent) => {
    event.preventDefault();
    if (!formUrl) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/fetch-form', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ url: formUrl }),
      });

      const payload: GoogleFormMetadata & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || 'Unable to fetch form.');
      }

      setFormState(payload);
      setValues(
        Object.fromEntries(
          (payload.fields as FormField[]).map((field) => [field.id, ''])
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
      setFormState(null);
      setValues({});
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formState) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          action: formState.action,
          hiddenFields: formState.hiddenFields,
          values,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || 'Submission failed.');
      }

      setSuccess('Response submitted to Google Forms.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValueChange = (field: FormField, value: string) => {
    setValues((current) => ({ ...current, [field.id]: value }));
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
        <h1 className="text-3xl font-semibold tracking-tight">Google Form Filler</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Discover fields from a public Google Form, fill them in one place, and send
          the submission directly without copying and pasting between tabs.
        </p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleDiscover}>
          <label className="text-sm font-medium text-slate-200" htmlFor="form-url">
            Google Form URL
          </label>
          <input
            id="form-url"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            value={formUrl}
            onChange={(event) => setFormUrl(event.target.value)}
            placeholder="https://docs.google.com/forms/..."
            type="url"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
          >
            {loading ? 'Loading form…' : 'Load form fields'}
          </button>
        </form>
      </section>

      {(error || success) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            error
              ? 'border-rose-500/50 bg-rose-500/10 text-rose-200'
              : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          {error || success}
        </div>
      )}

      {hasForm && formState && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/30">
          <header className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-slate-50">{formState.title}</h2>
            {formState.description && (
              <p className="text-sm text-slate-300">{formState.description}</p>
            )}
            <a
              href={formUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-emerald-300 underline"
            >
              Open original form
            </a>
          </header>

          <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
            {formState.fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-2">
                <label htmlFor={field.id} className="text-sm font-medium text-slate-200">
                  {field.label}
                  {field.required ? <span className="ml-1 text-rose-300">*</span> : null}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    required={field.required}
                    className="min-h-[120px] w-full rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                    value={values[field.id] ?? ''}
                    onChange={(event) => handleValueChange(field, event.target.value)}
                  />
                ) : (
                  <input
                    id={field.id}
                    required={field.required}
                    type={getInputType(field)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                    value={values[field.id] ?? ''}
                    onChange={(event) => handleValueChange(field, event.target.value)}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
            >
              {submitting ? 'Submitting…' : 'Submit to Google Forms'}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

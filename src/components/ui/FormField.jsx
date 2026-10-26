import { useId } from 'react';
import ErrorMessage from './ErrorMessage';

// Campo con su label asociado. `errors` acepta lo que devuelve toFormErrors para ese campo.
export default function FormField({ id, label, hint, errors, required, ...inputProps }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const hasErrors = [].concat(errors ?? []).length > 0;
  const describedBy = [hint && hintId, hasErrors && errorId].filter(Boolean).join(' ');

  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        required={required}
        aria-invalid={hasErrors || undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="form-field__hint">
          {hint}
        </p>
      )}
      <ErrorMessage id={errorId} messages={errors} />
    </div>
  );
}

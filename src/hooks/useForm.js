import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError, toFormErrors } from '../api/client';

// Reparte el error de un envío entre los campos del formulario y el aviso general. Los mensajes de
// la API se muestran tal cual; si no trae ninguno (500, cuerpo inesperado), va el genérico.
function splitSubmitError(error, fieldNames, apiFields, t) {
  if (error?.isNetworkError) {
    return { fieldErrors: {}, formErrors: [t('errors.network')], isNetworkError: true };
  }
  if (!(error instanceof ApiError)) console.error(error);

  const { fieldErrors: apiFieldErrors, baseErrors } = toFormErrors(error);
  const fieldErrors = {};
  const formErrors = baseErrors.filter(Boolean);

  for (const [apiField, messages] of Object.entries(apiFieldErrors)) {
    const field = apiFields[apiField] ?? apiField;
    const list = messages.filter(Boolean);
    // Un campo que este formulario no muestra va al aviso general para que no se pierda.
    if (fieldNames.includes(field)) fieldErrors[field] = list;
    else formErrors.push(...list);
  }

  if (formErrors.length === 0 && Object.keys(fieldErrors).length === 0) {
    formErrors.push(t('errors.generic'));
  }
  return { fieldErrors, formErrors, isNetworkError: false };
}

// Maneja un formulario que se envía a la API: valores, validación previa, envío, errores y foco.
// - validate(values) devuelve { campo: [mensajes] } con lo que se puede chequear sin el servidor.
// - onSubmit(values) hace el pedido.
// - apiFields traduce nombres de campo de la API a los del formulario.
// - resetOnSuccess vuelve los valores a initialValues después de un envío exitoso.
// - successFocusRef es a dónde va el foco después de un envío exitoso; por ejemplo, el primer
//   campo, para cargar otro. La confirmación la muestra quien llama.
// Después de un error, el foco va al aviso general (alertRef) o al primer campo con problema.
export function useForm({
  initialValues,
  validate,
  onSubmit,
  apiFields = {},
  resetOnSuccess = false,
  successFocusRef,
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [successfulSubmits, setSuccessfulSubmits] = useState(0);
  const submittingRef = useRef(false);
  const formRef = useRef(null);
  const alertRef = useRef(null);

  useEffect(() => {
    if (failedAttempts === 0) return;
    const target = alertRef.current ?? formRef.current?.querySelector('[aria-invalid="true"]');
    target?.focus();
  }, [failedAttempts]);

  useEffect(() => {
    if (successfulSubmits > 0) successFocusRef?.current?.focus();
  }, [successfulSubmits, successFocusRef]);

  function showErrors(errors) {
    setFieldErrors(errors.fieldErrors);
    setFormErrors(errors.formErrors);
    setIsNetworkError(errors.isNetworkError);
    setFailedAttempts((count) => count + 1);
  }

  function handleChange(event) {
    const { name, type, checked } = event.target;
    const value = type === 'checkbox' ? checked : event.target.value;
    setValues((current) => ({ ...current, [name]: value }));
    // Al corregir un campo, su error deja de mostrarse.
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function submit() {
    if (submittingRef.current) return;

    const clientErrors = validate?.(values) ?? {};
    if (Object.keys(clientErrors).length > 0) {
      showErrors({ fieldErrors: clientErrors, formErrors: [], isNetworkError: false });
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setFieldErrors({});
    setFormErrors([]);
    setIsNetworkError(false);
    try {
      await onSubmit(values);
      if (resetOnSuccess) setValues(initialValues);
      setSuccessfulSubmits((count) => count + 1);
    } catch (error) {
      showErrors(splitSubmitError(error, Object.keys(initialValues), apiFields, t));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }

  return {
    values,
    fieldErrors,
    formErrors,
    isNetworkError,
    isSubmitting,
    handleChange,
    handleSubmit,
    retry: submit,
    formRef,
    alertRef,
  };
}

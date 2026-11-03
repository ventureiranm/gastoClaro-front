import { useTranslation } from 'react-i18next';
import { AMOUNT_MAX_DECIMALS } from '../../config/constants';
import { useForm } from '../../hooks/useForm';
import { todayISO } from '../../utils/dates';
import { toNewIncome, validateIncome } from '../../validation/incomes';
import Button from '../ui/Button';
import FormAlert from '../ui/FormAlert';
import FormField from '../ui/FormField';
import LoadingIndicator from '../ui/LoadingIndicator';

// Alta de un ingreso. onSubmit(newIncome) recibe el ingreso con amount como número.
// `firstFieldRef` permite llevar el foco al formulario desde afuera; después de guardar, el foco
// vuelve ahí para cargar otro. La confirmación la muestra quien llama; los errores generales de la
// API (field "base") se avisan en `toast` (lo que devuelve useToast), si se pasa.
export default function IncomeForm({ onSubmit, firstFieldRef, toast }) {
  const { t } = useTranslation();
  const {
    values,
    fieldErrors,
    formErrors,
    isNetworkError,
    isSubmitting,
    handleChange,
    handleSubmit,
    retry,
    formRef,
    alertRef,
  } = useForm({
    initialValues: { date: todayISO(), amount: '' },
    validate: (formValues) => validateIncome(formValues, t),
    onSubmit: (formValues) => onSubmit(toNewIncome(formValues)),
    resetOnSuccess: true,
    successFocusRef: firstFieldRef,
    toast,
  });

  return (
    <form ref={formRef} className="form" onSubmit={handleSubmit} noValidate>
      <FormAlert
        ref={alertRef}
        messages={formErrors}
        onRetry={isNetworkError ? retry : undefined}
      />
      <FormField
        ref={firstFieldRef}
        label={t('incomes.fields.date')}
        name="date"
        type="date"
        value={values.date}
        onChange={handleChange}
        errors={fieldErrors.date}
        required
      />
      <FormField
        label={t('incomes.fields.amount')}
        name="amount"
        className="mono"
        inputMode="decimal"
        autoComplete="off"
        hint={t('incomes.form.amountHint', { count: AMOUNT_MAX_DECIMALS })}
        value={values.amount}
        onChange={handleChange}
        errors={fieldErrors.amount}
        required
      />
      <Button type="submit" isLoading={isSubmitting}>
        {t('incomes.form.submit')}
      </Button>
      {isSubmitting && <LoadingIndicator label={t('incomes.form.submitting')} />}
    </form>
  );
}

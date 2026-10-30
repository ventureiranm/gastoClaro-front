import { useTranslation } from 'react-i18next';
import { AMOUNT_MAX_DECIMALS, PURCHASE_CHANNELS } from '../../config/constants';
import { useForm } from '../../hooks/useForm';
import { todayISO } from '../../utils/dates';
import { formatPurchaseChannel } from '../../utils/format';
import { toNewExpense, validateExpense } from '../../validation/expenses';
import Button from '../ui/Button';
import FormAlert from '../ui/FormAlert';
import FormField from '../ui/FormField';
import LoadingIndicator from '../ui/LoadingIndicator';

// Nombres de campo de la API que no coinciden con los del formulario.
const API_FIELDS = {
  category_id: 'categoryId',
  is_fixed: 'isFixed',
  purchase_channel: 'purchaseChannel',
};

// Alta de un gasto. onSubmit(newExpense) recibe el gasto con amount y categoryId como números.
// Sin categorías no se puede guardar: el campo lo explica y el botón queda deshabilitado.
// `firstFieldRef` permite llevar el foco al formulario desde afuera; después de guardar, el foco
// vuelve ahí para cargar otro. La confirmación la muestra quien llama; los errores generales de la
// API (field "base") se avisan en `toast` (lo que devuelve useToast), si se pasa.
export default function ExpenseForm({ categories, onSubmit, firstFieldRef, toast }) {
  const { t } = useTranslation();
  const hasCategories = categories.length > 0;
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
    initialValues: {
      date: todayISO(),
      categoryId: '',
      amount: '',
      description: '',
      isFixed: false,
      purchaseChannel: '',
    },
    validate: (formValues) => validateExpense(formValues, t),
    onSubmit: (formValues) => onSubmit(toNewExpense(formValues)),
    apiFields: API_FIELDS,
    resetOnSuccess: true,
    successFocusRef: firstFieldRef,
    toast,
  });

  function handleFormSubmit(event) {
    if (hasCategories) handleSubmit(event);
    else event.preventDefault();
  }

  return (
    <form ref={formRef} className="form" onSubmit={handleFormSubmit} noValidate>
      <FormAlert
        ref={alertRef}
        messages={formErrors}
        onRetry={isNetworkError ? retry : undefined}
      />
      <FormField
        ref={firstFieldRef}
        label={t('expenses.fields.date')}
        name="date"
        type="date"
        max={todayISO()}
        value={values.date}
        onChange={handleChange}
        errors={fieldErrors.date}
        required
      />
      <FormField
        as="select"
        label={t('expenses.fields.category')}
        name="categoryId"
        hint={hasCategories ? undefined : t('expenses.form.noCategories')}
        value={values.categoryId}
        onChange={handleChange}
        errors={fieldErrors.categoryId}
        required
      >
        <option value="">
          {hasCategories
            ? t('expenses.form.categoryPlaceholder')
            : t('expenses.form.noCategoriesOption')}
        </option>
        {categories.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </FormField>
      <FormField
        label={t('expenses.fields.amount')}
        name="amount"
        className="mono"
        inputMode="decimal"
        autoComplete="off"
        hint={t('expenses.form.amountHint', { count: AMOUNT_MAX_DECIMALS })}
        value={values.amount}
        onChange={handleChange}
        errors={fieldErrors.amount}
        required
      />
      <FormField
        label={t('expenses.fields.description')}
        name="description"
        autoComplete="off"
        value={values.description}
        onChange={handleChange}
        errors={fieldErrors.description}
      />
      <FormField
        label={t('expenses.fields.isFixed')}
        name="isFixed"
        type="checkbox"
        hint={t('expenses.form.isFixedHint')}
        checked={values.isFixed}
        onChange={handleChange}
        errors={fieldErrors.isFixed}
      />
      <FormField
        as="select"
        label={t('expenses.fields.purchaseChannel')}
        name="purchaseChannel"
        value={values.purchaseChannel}
        onChange={handleChange}
        errors={fieldErrors.purchaseChannel}
      >
        <option value="">{t('expenses.form.channelNone')}</option>
        {PURCHASE_CHANNELS.map((code) => (
          <option key={code} value={code}>
            {formatPurchaseChannel(code, t)}
          </option>
        ))}
      </FormField>
      <Button type="submit" isLoading={isSubmitting} disabled={!hasCategories}>
        {t('expenses.form.submit')}
      </Button>
      {isSubmitting && <LoadingIndicator label={t('expenses.form.submitting')} />}
    </form>
  );
}

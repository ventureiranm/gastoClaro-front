import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PASSWORD_MIN_LENGTH, ROUTES } from '../config/constants';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';

export default function RegisterPage() {
  const { t } = useTranslation();

  // El envío real contra la API llega en la tarjeta de registro.
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <section className="page page--narrow">
      <h1>{t('register.title')}</h1>
      <form className="form" onSubmit={handleSubmit}>
        <FormField label={t('auth.user')} name="user" autoComplete="username" required />
        <FormField
          label={t('auth.email')}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FormField
          label={t('auth.password')}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          hint={t('auth.passwordHint', { count: PASSWORD_MIN_LENGTH })}
          required
        />
        <FormField
          label={t('auth.passwordConfirmation')}
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
        />
        <Button type="submit">{t('register.submit')}</Button>
      </form>
      <p>
        {t('register.hasAccount')} <Link to={ROUTES.LOGIN}>{t('register.goToLogin')}</Link>
      </p>
    </section>
  );
}

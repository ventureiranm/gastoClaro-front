import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../config/constants';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';

export default function LoginPage() {
  const { t } = useTranslation();

  // El envío real contra la API llega en la tarjeta de login.
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <section className="page page--narrow">
      <h1>{t('login.title')}</h1>
      <form className="form" onSubmit={handleSubmit}>
        <FormField label={t('auth.user')} name="user" autoComplete="username" required />
        <FormField
          label={t('auth.password')}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Button type="submit">{t('login.submit')}</Button>
      </form>
      <p>
        {t('login.noAccount')} <Link to={ROUTES.REGISTER}>{t('login.goToRegister')}</Link>
      </p>
    </section>
  );
}

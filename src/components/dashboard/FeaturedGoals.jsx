import { useId } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../config/constants';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { formatAmount } from '../../utils/format';
import { goalScene } from '../../utils/goals';
import GoalArt from '../ui/GoalArt';

const FEATURED_COUNT = 3;

// Las metas más recientes, con su ilustración y su avance. Es un adorno del Inicio: si las metas no
// cargan, no se muestra nada (en Metas de ahorro está el aviso de error completo).
export default function FeaturedGoals() {
  const { t } = useTranslation();
  const titleId = useId();
  const { goals, isLoading, error } = useSavingsGoals();

  if (isLoading || error || !goals || goals.length === 0) return null;

  return (
    <section aria-labelledby={titleId} className="featured-goals">
      <div className="featured-goals__header">
        <h2 id={titleId}>{t('dashboard.goals.title')}</h2>
        <Link to={ROUTES.SAVINGS_GOALS}>{t('dashboard.goals.seeAll')}</Link>
      </div>
      <ul className="goal-cards">
        {goals.slice(0, FEATURED_COUNT).map((goal) => {
          const missing = Math.max(goal.targetAmount - goal.savedAmount, 0);
          return (
            <li key={goal.id} className="goal-card">
              <GoalArt scene={goalScene(goal)} />
              <div className="goal-card__body">
                <h3>{goal.name}</h3>
                <p className="goal-card__percentage">
                  {t('dashboard.goals.progress', { percentage: `${goal.progressPercentage} %` })}
                </p>
                <div className="goal-card__track" aria-hidden="true">
                  <div
                    className="goal-card__fill"
                    style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                  />
                </div>
                <p className="goal-card__amounts">
                  <span>
                    {t('dashboard.goals.saved')}: <strong>{formatAmount(goal.savedAmount)}</strong>
                  </span>
                  <span className="muted">
                    {t('dashboard.goals.target')}: {formatAmount(goal.targetAmount)}
                  </span>
                </p>
                <p className="muted goal-card__missing">
                  {missing > 0
                    ? t('dashboard.goals.missing', { amount: formatAmount(missing) })
                    : t('dashboard.goals.completed')}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

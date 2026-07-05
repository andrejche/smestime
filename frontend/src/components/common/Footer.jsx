import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.png';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SmestiMe" className="h-8 w-auto" />
            <span className="font-bold text-ink">smestime</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/properties" className="hover:text-ink transition-colors">{t('footer.listings')}</Link>
            <Link to="/list-property" className="hover:text-ink transition-colors">{t('footer.addListing')}</Link>
            <Link to="/privacy" className="hover:text-ink transition-colors">{t('footer.privacy')}</Link>
          </div>

          <p className="text-sm text-gray-400">© {new Date().getFullYear()} SmestiMe</p>
        </div>
      </div>
    </footer>
  );
}

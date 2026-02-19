import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { Building2, Phone, Mail, MapPin, Heart } from 'lucide-react';
import LoginButton from './LoginButton';
import { useIsCallerAdmin } from '../hooks/useIsCallerAdmin';

export default function Layout() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/assets/generated/ease-loan-logo.dim_200x80.png" 
                alt="Ease Loan" 
                className="h-10 w-auto"
              />
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                to="/apply" 
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Apply Now
              </Link>
              {!isAdminLoading && isAdmin && (
                <Link 
                  to="/admin/dashboard" 
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Dashboard
                </Link>
              )}
              <LoginButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <h3 className="font-display font-semibold text-lg">Ease Loan</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Your trusted partner for quick and easy loan solutions. We're here to help you achieve your financial goals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <a href="tel:9327552378" className="hover:text-primary transition-colors">
                    9327552378
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <a href="mailto:easeloan45@gmail.com" className="hover:text-primary transition-colors">
                    easeloan45@gmail.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Clg More, Jora Mandir, Burdwan, 713101
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <button 
                  onClick={() => navigate({ to: '/' })}
                  className="block hover:text-primary transition-colors text-left"
                >
                  Home
                </button>
                <button 
                  onClick={() => navigate({ to: '/apply' })}
                  className="block hover:text-primary transition-colors text-left"
                >
                  Apply for Loan
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1.5">
              © {new Date().getFullYear()} Ease Loan. Built with{' '}
              <Heart className="h-4 w-4 text-destructive fill-destructive" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'ease-loan'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


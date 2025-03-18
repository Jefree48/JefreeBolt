import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Instagram, Linkedin, LogOut, Menu, X, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo jefree.png" 
                alt="Jefree" 
                className="h-7 mr-2"
              />
              <span className="text-xl font-light tracking-wider text-white">Jefree</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.user_metadata?.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center text-white hover:text-purple-200 text-sm px-3 py-1.5 
                             rounded-lg hover:bg-purple-800/50 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-1.5" />
                    Admin
                  </Link>
                )}
                <span className="text-sm text-purple-200">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-white hover:text-purple-200 text-sm px-3 py-1.5 
                           rounded-lg hover:bg-purple-800/50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Salir
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-8">
                  <button
                    onClick={() => scrollToSection('features')}
                    className="text-sm text-white hover:text-purple-200 font-medium tracking-wide"
                  >
                    Características
                  </button>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="text-sm text-white hover:text-purple-200 font-medium tracking-wide"
                  >
                    Planes
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="text-sm text-white hover:text-purple-200 font-medium tracking-wide"
                  >
                    Contacto
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 border-l border-purple-700/50 ml-8 pl-8">
                  <a 
                    href="https://www.linkedin.com/company/jefree" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://www.instagram.com/jefreeapp/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 hover:bg-purple-800/50 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-purple-700/30">
              {user ? (
                <>
                  {user.user_metadata?.is_admin && (
                    <Link
                      to="/admin"
                      className="flex items-center w-full text-white hover:text-purple-200 text-sm px-3 py-2 
                               rounded-lg hover:bg-purple-800/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-1.5" />
                      Panel de Admin
                    </Link>
                  )}
                  <div className="px-3 py-2 text-sm text-purple-200">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-white hover:text-purple-200 text-sm px-3 py-2 
                             rounded-lg hover:bg-purple-800/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="block w-full text-left text-white hover:text-purple-200 text-sm px-3 py-2 
                             rounded-lg hover:bg-purple-800/50 transition-colors"
                  >
                    Características
                  </button>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="block w-full text-left text-white hover:text-purple-200 text-sm px-3 py-2 
                             rounded-lg hover:bg-purple-800/50 transition-colors"
                  >
                    Planes
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="block w-full text-left text-white hover:text-purple-200 text-sm px-3 py-2 
                             rounded-lg hover:bg-purple-800/50 transition-colors"
                  >
                    Contacto
                  </button>
                  <div className="flex items-center space-x-4 px-3 py-2 border-t border-purple-700/30 mt-2">
                    <a 
                      href="https://www.linkedin.com/company/jefree" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a 
                      href="https://www.instagram.com/jefreeapp/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
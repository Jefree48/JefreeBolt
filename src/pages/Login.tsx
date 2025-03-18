import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clear any existing session first
      await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('El correo electrónico o la contraseña son incorrectos.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirma tu correo electrónico antes de iniciar sesión.');
        } else {
          setError('Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo.');
        }
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu cuenta para gestionar tus menús y listas de compra
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg 
                     shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿No tienes una cuenta? </span>
            <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
              Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
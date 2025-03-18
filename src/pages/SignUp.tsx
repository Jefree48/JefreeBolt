import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!acceptedTerms) {
      setError('Debes aceptar la política de privacidad y términos de uso para continuar.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // First check if user exists
      const { data: { user: existingUser }, error: checkError } = await supabase.auth.getUser();
      
      if (existingUser) {
        setError('Ya has iniciado sesión. Redirigiendo al dashboard...');
        navigate('/dashboard');
        return;
      }

      // Try to sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            accepted_terms: true,
            accepted_terms_at: new Date().toISOString()
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('Este correo electrónico ya está registrado. Por favor, inicia sesión.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        throw signUpError;
      }

      if (data?.user) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message?.includes('User already registered')) {
        setError('Este correo electrónico ya está registrado. Por favor, inicia sesión.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Únete a Jefree y empieza a planificar tus menús de forma inteligente
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSignUp}>
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
            <p className="mt-1 text-sm text-gray-500">
              Mínimo 6 caracteres
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">
                Acepto la{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  className="text-purple-600 hover:text-purple-500"
                >
                  política de privacidad
                </a>
                {' '}y los{' '}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-purple-600 hover:text-purple-500"
                >
                  términos de uso
                </a>
              </label>
              <p className="text-gray-500">
                Al crear una cuenta, aceptas recibir actualizaciones por correo electrónico.
              </p>
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
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿Ya tienes una cuenta? </span>
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
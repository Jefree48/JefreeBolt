import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Calendar, Brain, Sparkles, Crown, Star, Quote, Send, Instagram, Linkedin } from 'lucide-react';
import { sendContactEmail } from '../lib/email';

const LandingPage = () => {
  const location = useLocation();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null
  });

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status
    setFormStatus({
      loading: true,
      success: false,
      error: null
    });

    // Basic validation
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setFormStatus({
        loading: false,
        success: false,
        error: 'Por favor, completa todos los campos.'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setFormStatus({
        loading: false,
        success: false,
        error: 'Por favor, introduce un email válido.'
      });
      return;
    }

    try {
      const response = await sendContactEmail(
        contactForm.name.trim(),
        contactForm.email.trim(),
        contactForm.message.trim()
      );

      if (response.success) {
        setFormStatus({
          loading: false,
          success: true,
          error: null
        });
        // Reset form
        setContactForm({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error(response.error || 'Error al enviar el mensaje');
      }
    } catch (error: any) {
      console.error('Error sending contact email:', error);
      setFormStatus({
        loading: false,
        success: false,
        error: 'No se pudo enviar el mensaje. Por favor, inténtalo de nuevo más tarde.'
      });
    }
  };

  return (
    <div className="pt-14">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('/images/Banner J.png')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-screen text-center py-20">
            <div className="mb-12">
              <img 
                src="/images/logo jefree.png" 
                alt="Jefree Logo" 
                className="h-40 mx-auto"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 font-sans">
              Tu Asistente Personal de<br />Compras y Menús
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto mb-12 leading-relaxed">
              ¡Imagínate tener a tu asistente personal siempre a mano! Con Jefree, 
              lleva la organización de la lista de la compra y la planificación de 
              los menús familiares al siguiente nivel.
            </p>
            <Link
              to="/signup"
              className="bg-white text-purple-900 px-10 py-4 rounded-full text-xl font-semibold 
                       hover:bg-purple-100 transition duration-300 inline-block transform hover:scale-105
                       shadow-lg hover:shadow-xl"
            >
              ¡Empezar Ahora!
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-purple-900">
            Características
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<ShoppingCart className="h-10 w-10 text-purple-600" />}
              title="Lista de Compras Inteligente"
              description="Genera listas de compras personalizadas basadas en tus menús y preferencias."
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-purple-600" />}
              title="Planificación de Menús"
              description="Planifica tus menús semanales con recetas saludables y variadas."
            />
            <FeatureCard
              icon={<Brain className="h-10 w-10 text-purple-600" />}
              title="Asistente IA"
              description="Recibe recomendaciones personalizadas basadas en tus preferencias y necesidades."
            />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-24 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-purple-900">
              ¡La revolución ha llegado a las redes!
            </h2>
            <p className="text-xl text-purple-600 text-center mb-16">
              Nuestra super app está causando sensación y los comentarios no paran de llegar
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <ReviewCard
                name="María García"
                role="Madre de 2 niños"
                content="¡Increíble! Desde que uso Jefree, la organización de las comidas es mucho más fácil. Los menús son variados y mis hijos están encantados."
                rating={5}
                image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
              />
              <ReviewCard
                name="Carlos Rodríguez"
                role="Chef amateur"
                content="La IA entiende perfectamente mis preferencias y me sugiere recetas que realmente se ajustan a mi estilo. ¡Es como tener un asistente personal!"
                rating={5}
                image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
              />
              <ReviewCard
                name="Laura Martínez"
                role="Nutricionista"
                content="Como profesional de la nutrición, aprecio la atención al detalle en la planificación de menús equilibrados. Mis clientes están encantados."
                rating={5}
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-purple-900">
            Planes y Precios
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PriceCard
              title="Gratuito"
              price="0€"
              features={[
                "Menús de hasta 3 días",
                "1 lista de compra por menú",
                "Asistente virtual básico",
                "Incluye anuncios"
              ]}
            />
            <PriceCard
              title="Premium"
              price="0,99€/mes"
              features={[
                "Menús de hasta 14 días",
                "Listas de compra ilimitadas",
                "Asistente virtual avanzado",
                "Sin anuncios",
                "Soporte prioritario"
              ]}
              highlighted={true}
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-24 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-purple-900">
              Contacto
            </h2>
            <p className="text-center text-purple-600 mb-12">
              ¿Tienes alguna pregunta? ¡Estaremos encantados de ayudarte!
            </p>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-purple-900 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full rounded-lg border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full rounded-lg border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-purple-900 mb-1">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full rounded-lg border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="¿En qué podemos ayudarte?"
                  required
                />
              </div>

              {formStatus.error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                  {formStatus.error}
                </div>
              )}

              {formStatus.success && (
                <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                  ¡Mensaje enviado correctamente! Te responderemos lo antes posible.
                </div>
              )}

              <button
                type="submit"
                disabled={formStatus.loading}
                className="w-full flex items-center justify-center px-8 py-4 border border-transparent 
                       text-lg font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                       transform hover:scale-105 transition duration-300 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus.loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-indigo-900 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4 items-center">
              {/* Logo and description */}
              <div className="md:col-span-1 flex flex-col items-center md:items-start">
                <img 
                  src="/images/logo jefree.png" 
                  alt="Jefree Logo" 
                  className="h-8 mb-1"
                />
                <p className="text-purple-200 text-xs text-center md:text-left">
                  Tu asistente personal de menús
                </p>
              </div>

              {/* Quick links */}
              <div className="md:col-span-1">
                <ul className="flex flex-col items-center md:items-start space-y-1">
                  <li>
                    <button 
                      onClick={() => scrollToSection('features')} 
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      Características
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('pricing')} 
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      Planes
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('contact')} 
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      Contacto
                    </button>
                  </li>
                </ul>
              </div>

              {/* Legal links */}
              <div className="md:col-span-1">
                <ul className="flex flex-col items-center md:items-start space-y-1">
                  <li>
                    <Link 
                      to="/aviso-legal" 
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      Aviso Legal
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/privacidad" 
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/cookies" 
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social links */}
              <div className="md:col-span-1">
                <div className="flex justify-center md:justify-end space-x-4">
                  <a 
                    href="https://www.linkedin.com/company/jefree" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://www.instagram.com/jefreeapp/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="mt-4 pt-3 border-t border-purple-700/30 text-center">
              <p className="text-purple-200 text-xs">
                © {new Date().getFullYear()} Jefree. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
    <div className="flex justify-center mb-6">{icon}</div>
    <h3 className="text-2xl font-semibold mb-4 text-purple-900 text-center">{title}</h3>
    <p className="text-purple-600 text-center">{description}</p>
  </div>
);

const ReviewCard = ({ name, role, content, rating, image }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
    <div className="flex items-center mb-6">
      <img
        src={image}
        alt={name}
        className="w-16 h-16 rounded-full object-cover mr-4"
      />
      <div>
        <h4 className="font-semibold text-purple-900">{name}</h4>
        <p className="text-purple-600 text-sm">{role}</p>
      </div>
    </div>
    <div className="mb-6">
      <Quote className="h-8 w-8 text-purple-300 mb-4" />
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
    <div className="flex items-center">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
      ))}
    </div>
  </div>
);

const PriceCard = ({ title, price, features, highlighted = false }) => (
  <div 
    className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1
                ${highlighted ? 'ring-4 ring-purple-400' : ''}`}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-purple-900">{title}</h3>
      {highlighted && <Crown className="h-8 w-8 text-yellow-400" />}
    </div>
    <p className="text-5xl font-bold mb-8 text-purple-900">{price}</p>
    <ul className="space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
          <span className="text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      to="/signup"
      className={`mt-8 w-full text-center py-4 rounded-lg font-semibold block transition duration-300
                  ${highlighted 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                  } transform hover:scale-105 shadow-md hover:shadow-lg`}
    >
      Empezar
    </Link>
  </div>
);

export default LandingPage;
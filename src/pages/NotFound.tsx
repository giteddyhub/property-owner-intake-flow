
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold mb-4 text-form-400">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          <Link to="/" className="text-form-500 hover:text-form-600 underline">
            Return to Home
          </Link>
          <p className="mt-8 text-sm text-gray-500">
            ItalianTaxes.com — Filing taxes in Italy made easy.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

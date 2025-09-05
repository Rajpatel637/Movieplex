import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame to ensure the scroll happens after rendering
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    
    // Only scroll if we're not already at the top
    if (window.scrollY > 0) {
      requestAnimationFrame(scrollToTop);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 py-12 relative overflow-hidden">
      {/* Subtle blob */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-primary/3 blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl eco-gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-sm">🌱</span>
            </div>
            <span className="font-display text-sm font-bold text-foreground">PlantWise</span>
          </motion.div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {[
              { to: '/', label: 'Home', emoji: '🏡' },
              { to: '/dashboard', label: 'Dashboard', emoji: '📊' },
              { to: '/community', label: 'Community', emoji: '🤝' },
            ].map(link => (
              <motion.div key={link.to} whileHover={{ y: -2 }}>
                <Link to={link.to} className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span className="text-xs">{link.emoji}</span>
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © 2026 PlantWise. Made with
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >💚</motion.span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

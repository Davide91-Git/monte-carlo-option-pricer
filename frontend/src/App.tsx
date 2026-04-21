/* ============================================================
   App.tsx — Root component
   Responsibility: mount context providers in the correct order
   and render the top-level layout shell.
   No business logic lives here.
   ============================================================ */

import { ThemeProvider }    from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppShell             from './components/layout/AppShell';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </ThemeProvider>
  );
}

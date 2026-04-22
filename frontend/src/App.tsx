/* ============================================================
   App.tsx — Root component
   Responsibility: mount context providers in the correct order
   and render the top-level layout shell.
   No business logic lives here.
   ============================================================ */

import { ThemeProvider }    from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppShell             from './components/layout/AppShell';
import DisclaimerModal      from './components/layout/DisclaimerModal';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DisclaimerModal />
        <AppShell />
      </LanguageProvider>
    </ThemeProvider>
  );
}

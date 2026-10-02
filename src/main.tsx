import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { MainRoutes } from './routes/MainRoutes';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@repo/ui/theme';
import './styles/theme.css'

import '@repo/map-core/styles.css';

import esMessages from "devextreme/localization/messages/es.json";
import { locale, loadMessages } from "devextreme/localization";

loadMessages(esMessages);
locale("es");

const MAP_THEMES = [
  { id: 'map-dark', dx: '/dx.map-dark.css', label: 'Map Dark', type: 'dark' as const },
  { id: 'base-light', dx: '/dx.base-light.css', label: 'Base Light', type: 'light' as const },
  { id: 'test', dx: '/dx.test.css', label: 'ERP Dark', type: 'dark' as const },
];

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider defaultTheme="map-dark" themes={MAP_THEMES} storageKey="maps-theme">
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
)

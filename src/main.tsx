import '@fontsource-variable/inter';import '@fontsource-variable/inter/wght-italic.css';import '@fontsource/poppins/600.css';import '@fontsource/poppins/700.css';import '@fontsource/poppins/800.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css'; // first, so the per-feature stylesheets (home.css, rider.css, rider-extras.css) layer on top of it
import {App} from './App';
import {LegalPage,LEGAL_PATHS} from './LegalPage';
createRoot(document.getElementById('root')!).render(<React.StrictMode>{LEGAL_PATHS.includes(location.pathname.replace(/\/$/,''))?<LegalPage path={location.pathname.replace(/\/$/,'')}/>:<App/>}</React.StrictMode>);

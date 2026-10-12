import '@fontsource-variable/inter';import '@fontsource-variable/inter/wght-italic.css';import '@fontsource/poppins/600.css';import '@fontsource/poppins/700.css';import '@fontsource/poppins/800.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

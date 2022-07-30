import React from 'react';
import { createRoot } from 'react-dom/client';
// import './scss/styles.scss';

import AppDemo from './tsx/AppDemo';
import './scss/styles_main.scss';

const container = document.getElementById("app-root")!;
const root = createRoot(container);
root.render(<AppDemo />);
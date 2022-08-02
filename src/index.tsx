import React from 'react';
import { createRoot } from 'react-dom/client';

import './scss/styles_main.scss';
// import * as bootstrap from 'bootstrap'

import MainDashboard from './tsx/MainDashboard';

const container = document.getElementById("app-root")!;
const root = createRoot(container);
root.render(<MainDashboard />);
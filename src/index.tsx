import React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from "react-redux";
import { store } from "./redux/store";
 
import './styles/styles_main.scss';
// import * as bootstrap from 'bootstrap'

import Main from './components/Main';

// import { fetchNotes } from "./redux/noteListSlice";

const container = document.getElementById("app-root")!;
const root = createRoot(container);

// store.dispatch(fetchNotes);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Main />
        </Provider>
    </React.StrictMode>
);

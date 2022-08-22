import React, { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal';

import { store } from "../redux/store";
import { fetchNotes } from "../redux/noteListSlice";
import { fetchCategories } from "../redux/categorySlice";

// import { fetchNotes } from "../redux/noteListSlice";

import NoteList from "./notes/NoteList";
import CategoryList from "./categories/CategoryList";

import Navigation from "./Navigation";

function MainDashboard()
{
    const [currentView, setCurrentView] = useState(0);

    useEffect(() =>
    {
        store.dispatch(fetchCategories);
        store.dispatch(fetchNotes);
    }, []);

    function getCurrentView()
    {
        if (currentView === 0 || currentView > 1)
            return <NoteList />
        else if (currentView === 1)
            return <CategoryList />
    }

    function handleNavigationItemClick(menuItemIndex: number)
    {
        setCurrentView(menuItemIndex);
    }
    
    return (
        // main-dashboard-container
        <div className="container-fluid main-dashboard-container">
            <div className="row">
                <nav className="left-menu col-md-3 col-lg-2 d-md-block bg-light collapse">
                    <Navigation
                        onNavigationItemClick={handleNavigationItemClick} />
                </nav>
                <main className="col-md-6 ms-sm-auto col-lg-8 px-md-4">
                    { getCurrentView() }
                </main>
                <nav className="col-md-3 col-lg-2 d-md-block bg-light collapse">
                    column 3
                </nav>
            </div>

        </div> // end: main-dashboard-container
    );
}

export default MainDashboard;
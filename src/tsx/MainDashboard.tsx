import React, { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal';

import { store } from "../redux/store";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchNotes } from "../redux/noteListSlice";
import { fetchCategories } from "../redux/categorySlice";
import { fetchTags } from "../redux/tagSlice";
import { selectUser, set as setUserAuth } from "../redux/authSlice";

// import { fetchNotes } from "../redux/noteListSlice";

import NoteList from "./notes/NoteList";
import CategoryList from "./categories/CategoryList";
import TagList from "./tags/TagList";

import Navigation from "./Navigation";
import UserLoginForm from "./users/UserLoginForm";




interface User
{
    id: number;
    username: string;
};

function MainDashboard()
{
    const dispatch = useAppDispatch();
    const loggedInUser = useAppSelector(selectUser);
    const [currentView, setCurrentView] = useState(0);
    // const [user, setUser] = useState<User | null>();

    useEffect(() =>
    {
        const userStr = localStorage.getItem("user");
        // console.log(userStr)
        const user = JSON.parse(userStr!) ;
        // setUser(user);
        dispatch(setUserAuth(user));
        if (user)
        {
            store.dispatch(fetchCategories);
            store.dispatch(fetchTags);
            store.dispatch(fetchNotes);
        }
    }, []);

    function getCurrentView()
    {
        if (currentView === 0 || currentView > 2)
            return <NoteList />
        else if (currentView === 1)
            return <CategoryList />
        else if (currentView === 2)
            return <TagList />
    }

    function handleNavigationItemClick(menuItemIndex: number)
    {
        setCurrentView(menuItemIndex);
    }
    
    return (
        loggedInUser ? (
                <div className="container-fluid main-dashboard-container">
                    <button
                     onClick={()=>{console.log(loggedInUser)}}
                    >{"console.log user"}</button>
                <div className="row">
                    <nav className="left-menu col-md-3 col-lg-2 d-md-block bg-light collapse">
                        <Navigation
                            onNavigationItemClick={handleNavigationItemClick} />
                    </nav>
                    <main id="main-section" className="col-md-6 ms-sm-auto col-lg-8 px-md-4">
                        { getCurrentView() }
                    </main>
                    <nav className="col-md-3 col-lg-2 d-md-block bg-light collapse">
                        
                    </nav>
                </div>

            </div> // end: main-dashboard-container
            ) : (
                <Fragment>
                    <button
                     onClick={()=>{console.log(loggedInUser)}}
                    >{"console.log user"}</button>
                    <UserLoginForm onUserLoggedIn={() => {console.log("onUserLoggedIn")}} />
                </Fragment>
            )
    );
}

export default MainDashboard;
import React, { useState, useEffect, Fragment } from 'react';

// Redux imports
import { store } from "../redux/store";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchNotes } from "../redux/noteListSlice";
import { fetchCategories } from "../redux/categorySlice";
import { fetchTags } from "../redux/tagSlice";
import { 
    selectUser,
    set as setUserAuth,
    selectWasUserLoggedOut
} from "../redux/authSlice";
import { fetchMaxDateRange } from "../redux/filterSlice";

// Helper functions
import {
    createDefaultUserDataInStorage,
    getUserDataFromStorage,
    setUserInStorage,
    setWasUserLoggedOutInStorage
} from "../localStorageUtils";

// App component imports
import NoteList from "./notes/NoteList";
import CategoryList from "./categories/CategoryList";
import TagList from "./tags/TagList";
import Navigation from "./Navigation";
import UserLoginForm from "./users/UserLoginForm";
import UserRegisterForm from "./users/UserRegisterForm";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal';

function MainDashboard()
{
    const dispatch = useAppDispatch();
    const loggedInUser = useAppSelector(selectUser);
    const wasUserLoggedOut = useAppSelector(selectWasUserLoggedOut);
    const [currentView, setCurrentView] = useState(0);
    // false = register form, true = login form
    const [shouldShowLoginForm, setShouldShowLoginForm] = useState<boolean>(false);

    useEffect(() =>
    {
        let userData, sessionExpirationDate;
        try
        {
            userData = getUserDataFromStorage();
        }
        catch (error)
        {
            userData = createDefaultUserDataInStorage();
        }
        finally
        {
            setShouldShowLoginForm(userData.wasUserLoggedOut);

            sessionExpirationDate = new Date(`${userData.sessionExpirationDate}`);
            if ((new Date()) >= sessionExpirationDate)
            {
                dispatch(setUserAuth(null));
            }
            else
            {
                dispatch(setUserAuth(userData.user));
                if (userData.user)
                {
                    (async () =>
                    {
                        await dispatch(fetchMaxDateRange);
                        await dispatch(fetchCategories);
                        await dispatch(fetchTags);
                        await dispatch(fetchNotes);
                    })();
                }
            }
        }
    }, [wasUserLoggedOut]);

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

    const handleOnChangeFormTypeBtnClick = () =>
    {
        setShouldShowLoginForm(!shouldShowLoginForm);
    };
    
    return (
        loggedInUser ? (
            <div className="container-fluid main-dashboard-container min-vh-100">
                <div className="row h-100">
                    <nav className="left-menu col-md-3 col-lg-2 d-md-block bg-light collapse h-100">
                        <Navigation
                            onNavigationItemClick={handleNavigationItemClick} />
                    </nav>
                    <main id="main-section" className="col-md-6 ms-sm-auto col-lg-8 px-md-4 h-100">
                        { getCurrentView() }
                    </main>
                    <nav className="col-md-3 col-lg-2 d-md-block bg-light collapse h-100">
                        
                    </nav>
                </div>

            </div> // end: main-dashboard-container
            ) : shouldShowLoginForm ? (
                <div className="main-container-login-signup">
                    <UserLoginForm
                        isolated={true}
                        includeOptionalButton={true}
                        optionalBtnText={"create new account"}
                        handleOnOptionalBtnClick={handleOnChangeFormTypeBtnClick}
                        onUserLoggedIn={() => {console.log("onUserLoggedIn")}} />
                </div>
            ) : (
                <div className="main-container-login-signup">
                    <UserRegisterForm
                        isolated={true}
                        includeOptionalButton={true}
                        optionalBtnText={"I already have an account"}
                        handleOnOptionalBtnClick={handleOnChangeFormTypeBtnClick}
                        onUserLoggedIn={() => {console.log("onUserLoggedIn")}} />
                </div>
            )
    );
}

export default MainDashboard;
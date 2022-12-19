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

// Type imports
import { NavigationViewEnum } from "../types";

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
import UserRegistrationForm from "./users/UserRegistrationForm";
import Settings from "./Settings";

// Bootstrap imports
// [...]

function MainDashboard()
{
    const dispatch = useAppDispatch();
    const loggedInUser = useAppSelector(selectUser);
    const wasUserLoggedOut = useAppSelector(selectWasUserLoggedOut);
    const [currentView, setCurrentView] = useState<NavigationViewEnum>(
        NavigationViewEnum.NOTE_LIST
    );
    // false = register form, true = login form
    const [shouldShowLoginForm, setShouldShowLoginForm] = useState<boolean>(false);
    const [wasAddItemButtonClicked, setWasAddItemButtonClicked] = useState<boolean>(false);

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

    function renderCurrentView(currentView: NavigationViewEnum)
    {
        if (currentView === NavigationViewEnum.NOTE_LIST)
            return (
                <NoteList
                    wasAddItemButtonClicked={wasAddItemButtonClicked}
                    onAddItemFormClose={() => { setWasAddItemButtonClicked(false); }}
                />
            );
        else if (currentView === NavigationViewEnum.CATEGORY_LIST)
            return (
                <CategoryList
                    wasAddItemButtonClicked={wasAddItemButtonClicked}
                    onAddItemFormClose={() => { setWasAddItemButtonClicked(false); }}
                />
            );
        else if (currentView === NavigationViewEnum.TAG_LIST)
            return (
                <TagList
                    wasAddItemButtonClicked={wasAddItemButtonClicked}
                    onAddItemFormClose={() => { setWasAddItemButtonClicked(false); }}
                />
            );
        else if (currentView === NavigationViewEnum.SETTINGS)
            return (
                <Settings />
            );
    }

    function handleNavigationItemClick(menuItemIdentifier: NavigationViewEnum)
    {
        setCurrentView(menuItemIdentifier);
        setWasAddItemButtonClicked(false);
    }

    const handleOnChangeFormTypeBtnClick = () =>
    {
        setShouldShowLoginForm(!shouldShowLoginForm);
    };
    
    return (
        loggedInUser ? (
            <div className="app-main-container">
                <Navigation
                    onNavigationItemClick={handleNavigationItemClick}
                    onAddItemButtonClick={() => { setWasAddItemButtonClicked(true); }}
                />
                <main id="main-section" className="app-main-section">
                    { renderCurrentView(currentView) }
                </main>
                {/* <nav className="item-navigation">
                        
                </nav> */}
            </div> // end: app-main-container
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
                    <UserRegistrationForm
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
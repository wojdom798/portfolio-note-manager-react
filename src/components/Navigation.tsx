import React, { useState, useEffect } from "react";

// Redux imports
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { 
    selectUser, remove as removeUser,
    set as setUserAuth,
    selectWasUserLoggedOut,
    setWasUserLoggedOut
} from "../redux/authSlice";
import { add as addAlert } from "../redux/alertListSlice"
import { removeAll as removeNotes } from "../redux/noteListSlice";
import { removeAll as removeCategories } from "../redux/categorySlice";
import { removeAll as removeTags } from "../redux/tagSlice";
import { reset as resetPagination } from "../redux/paginationSlice";

// Type imports
import {
    AlertTypesEnum,
    NavigationViewEnum,
    IMenuItem,
    NavigationProps
} from "../types";

// Helper function imports
import {
    setUserInStorage,
    setWasUserLoggedOutInStorage
} from "../localStorageUtils";
import apiUrls from "../apiRoutes";

// 3rd party imports
import { IonIcon } from "react-ion-icon";
import { useMediaQuery } from "react-responsive";

// Component imports
import AlertList from "./alerts/AlertList";
import Alert from "./alerts/Alert";

export const menuItemsInit = [
    {
        name: "Notes",
        identifier: NavigationViewEnum.NOTE_LIST
    },
    {
        name: "Categories",
        identifier: NavigationViewEnum.CATEGORY_LIST
    },
    {
        name: "Tags",
        identifier: NavigationViewEnum.TAG_LIST
    },
    {
        name: "Settings",
        identifier: NavigationViewEnum.SETTINGS
    },
];

function Navigation({ onNavigationItemClick, onAddItemButtonClick }: NavigationProps)
{
    const dispatch = useAppDispatch();
    const loggedInUser = useAppSelector(selectUser);
    const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
    const [activeMenuItem, setActiveMenuItem] = useState<IMenuItem>(menuItemsInit[0]);
    const isMobile = useMediaQuery({ query: "(max-width: 800px)" });
    const [isMobileNavActive, setIsMobileNavActive] = useState<boolean>(false);

    useEffect(() =>
    {
        // console.log(`isMobile=${isMobile}`);
        setMenuItems(menuItemsInit);

    }, []);

    function handleMenuItemClick(item: IMenuItem)
    {
        setActiveMenuItem(item);
        onNavigationItemClick(item.identifier);
    };

    function menuItemsToElements()
    {
        const itemElements = menuItems.map((item: IMenuItem) =>
        {
            let className = "navmenu-list-item";
            if (activeMenuItem.identifier === item.identifier)
                className = "navmenu-list-item active";
            return (
                <li className={className} key={item.identifier}>
                    <button
                        className="navmenu-btn"
                        onClick={() => handleMenuItemClick(item)}
                    ><span>{item.name}</span></button>
                </li>
            );
        });
        return itemElements;
    }

    // duplicate code
    const handleLogOutBtnCLick = async () =>
    {
        let alert;

        const init = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(apiUrls.logout, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            const data = await response.json();
            dispatch(removeNotes());
            dispatch(removeCategories());
            dispatch(removeTags());
            dispatch(resetPagination());
            setUserInStorage(null);
            setWasUserLoggedOutInStorage(true);
            dispatch(setWasUserLoggedOut(true));
            dispatch(removeUser());
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    }

    return (
        <div className="app-navigation-container">
            <button
                className="mobile-navbar-toggle-btn"
                onClick={() => setIsMobileNavActive(!isMobileNavActive)}
            >
                <IonIcon name="menu-outline"></IonIcon>
            </button>

            <AlertList />

            <button
                disabled={isMobileNavActive}
                className="notes-app-add-item-btn"
                onClick={onAddItemButtonClick}
            // ><IonIcon name="add-outline"></IonIcon></button>
            ><span>&#43;</span></button>
            
            <div className={isMobileNavActive ?
                "navigation-blur-overlay active" :
                "navigation-blur-overlay"
            }></div>

            <div className={
                isMobileNavActive ?
                "navmenu-sticky-container active" :
                "navmenu-sticky-container"
            }>
                <div className="navmenu-user-container">
                    <h3 className="username-header">{loggedInUser!.username}</h3>
                    <div className="logout-button-container">
                        <button
                            className="logout-button"
                            onClick={handleLogOutBtnCLick}
                        >
                            <span>log out</span>
                            <IonIcon name="log-out-outline"></IonIcon>
                        </button>
                    </div>
                </div>
                <nav>
                    <ul className="navmenu-list">
                        { menuItemsToElements() }
                    </ul>
                </nav>
            </div> {/* end: navmenu-sticky-container */}
        </div> // end: app-navigation-container
    );
}

export default Navigation;
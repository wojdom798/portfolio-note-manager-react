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

// Helper function imports
import {
    setUserInStorage,
    setWasUserLoggedOutInStorage
} from "../localStorageUtils";

// 3rd party component imports
import { IonIcon } from "react-ion-icon";

// Component imports
import { AlertTypes } from "./alerts/alertTypes"
import Alert from "./alerts/Alert";


function Navigation(props: any)
{
    const dispatch = useAppDispatch();
    const loggedInUser = useAppSelector(selectUser);
    const [menuItems, setMenuItems] = useState<string[]>([]);
    const [activeMenuItem, setActiveMenuItem] = useState(0);

    useEffect(() =>
    {
        
        const menuItems = [
            "Notes",
            "Categories",
            "Tags",
            "Settings"
        ];

        setMenuItems(menuItems);

    }, []);

    function handleMenuItemClick(index: number)
    {
        setActiveMenuItem(index);
        props.onNavigationItemClick(index);
    };

    function menuItemsToElements()
    {
        const itemElements = menuItems.map((item: string, index: number) =>
        {
            let className = "navmenu-list-item";
            if (activeMenuItem === index)
                className = "navmenu-list-item active";
            return (
                <li className={className} key={index}>
                    <button
                        className="navmenu-btn"
                        onClick={() => handleMenuItemClick(index)}
                    >{item}</button>
                </li>
            );
        });
        return itemElements;
    }

    // duplicate code
    const handleLogOutBtnCLick = async () =>
    {
        let alert;

        const url = `api/auth/logout/`;

        const init = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            const data = await response.json();
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
                type: AlertTypes.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    }

    return (
        <div className="navmenu-main-container">
            <div className="user-logout-container">
                <h3 className="username-header">{loggedInUser!.username}</h3>
                <div className="logout-button-container">
                    <button onClick={handleLogOutBtnCLick}>
                        <IonIcon name="log-out-outline"></IonIcon>
                    </button>
                </div>
            </div>
            <nav>
                <ul id="navmenu-list">
                    {menuItemsToElements()}
                </ul>
            </nav>
        </div>
    );
}

export default Navigation;
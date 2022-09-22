import React, { useState, useEffect } from "react";

function Navigation(props: any)
{
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

    return (
        <div className="navmenu-main-container">
        <nav>
            <ul id="navmenu-list">
                {menuItemsToElements()}
            </ul>
        </nav>
        </div>
    );
}

export default Navigation;
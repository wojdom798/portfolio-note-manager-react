import React, { Fragment, useState } from "react";

// Redux imports
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchNotes } from "../../redux/noteListSlice";
import { setCurrentPage } from "../../redux/paginationSlice";
import { selectCategoryList, } from "../../redux/categorySlice";
import { selectFilters, setCategoriesFilter } from "../../redux/filterSlice";

// Type imports
import { ICategory } from "../../types";

// App component imports
import CategoryFilter from "./CategoryFilter";
import DateRangeFilter from "./DateRangeFilter";

// Bootstrap imports
import {
    OverlayTrigger,
    Button, ButtonGroup,
    Form,
} from "react-bootstrap";
import Popover from "react-bootstrap/Popover";


export default function FilterMenu(props: any)
{
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectFilters);

    function handleApplyFiltersBtnClick()
    {
        dispatch(setCurrentPage(1));
        dispatch(fetchNotes);
    }

    return (
        <div className="filters-main-container">

            <CategoryFilter />

            <button
                className="filters-menu-item filters-menu-button"
            >tags</button>

            <DateRangeFilter />
            
            <button
                className="filters-menu-item filters-menu-button filters-menu__apply-filters-button"
                onClick={handleApplyFiltersBtnClick}
                >apply filters</button>
        </div>
    );
}
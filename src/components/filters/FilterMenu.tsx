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
import DateTimeFilter from "./DateRangeFilter";

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
    const categories = useAppSelector(selectCategoryList);
    const filters = useAppSelector(selectFilters);

    function renderCategoriesAsCheckboxes()
    {
        return Object.values(categories).map((category: ICategory) =>
        {
            if (filters.categories.includes(category.id))
            {
                return (
                    <Form.Check
                        checked
                        key={category.id}
                        id={`category-chbx-${category.id}`}
                        label={category.name}
                        onChange={(event: any) => handleCategoryFilterChbxChange(event, category.id)}
                        type="checkbox" />
                );
            }
            else
            {
                return (
                    <Form.Check
                        key={category.id}
                        id={`category-chbx-${category.id}`}
                        label={category.name}
                        onChange={(event: any) => handleCategoryFilterChbxChange(event, category.id)}
                        type="checkbox" />
                );
            }
        });
    }


    let popover = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">select categories</Popover.Header>
            <Popover.Body>
                <Fragment>
                <ButtonGroup aria-label="">
                    <Button
                        disabled
                        onClick={handleFilterSelectAllCategoriesBtnClick}
                        variant="outline-secondary">all</Button>
                    <Button disabled variant="outline-secondary">none</Button>
                </ButtonGroup>
                <Form.Group className="mb-3">
                    { renderCategoriesAsCheckboxes() }
                </Form.Group>
                </Fragment>
            </Popover.Body>
        </Popover>
    );

    function handleCategoryFilterChbxChange(event: any, categoryId: number)
    {
        // if (event.target.checked)
        if (!filters.categories.includes(categoryId))
        {
            dispatch(setCategoriesFilter([...filters.categories, categoryId]));
        }
        else
        {
            dispatch(setCategoriesFilter(filters.categories.filter((c: number) => c !== categoryId)));
        }
    }

    function handleFilterSelectAllCategoriesBtnClick()
    {
        // setFilters({
        //     ...filters,
        //     ctg: Object.values(categories).map(c => c.id)
        // });
    }

    // DEBUG
    // const popover = () =>
    // {
    //     return (
    //         <Popover id="popover-basic">
    //             <Popover.Header as="h3">select categories</Popover.Header>
    //             <Popover.Body>
    //                 <Fragment>
    //                 <ButtonGroup aria-label="">
    //                     <Button
    //                         disabled
    //                         onClick={handleFilterSelectAllCategoriesBtnClick}
    //                         variant="outline-secondary">all</Button>
    //                     <Button disabled variant="outline-secondary">none</Button>
    //                 </ButtonGroup>
    //                 <Form.Group className="mb-3">
    //                     { getCategoriesAsCheckboxes() }
    //                 </Form.Group>
    //                 </Fragment>
    //             </Popover.Body>
    //         </Popover>
    //     );
    // }


    function handleApplyFiltersBtnClick()
    {
        dispatch(setCurrentPage(1));
        dispatch(fetchNotes);
    }

    return (
        <div className="filters-main-container">
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                <Button variant="primary">categories</Button>
            </OverlayTrigger>
            {/* <Button
                variant="primary"
                onClick={() => { console.log("category filter clicked") }}
            >categories</Button> */}
            <DateTimeFilter />
            <Button
                variant="outline-primary"
                onClick={handleApplyFiltersBtnClick}
                >apply filters</Button>
        </div>
    );
}
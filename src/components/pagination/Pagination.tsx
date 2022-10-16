import React, { Fragment, useState } from "react";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { fetchNotes } from "../../redux/noteListSlice";
import {
    setItemsPerPage, setCurrentPage,
    selectPagination
} from "../../redux/paginationSlice";


function Pagination(props: any)
{
    const pagination = useAppSelector(selectPagination);
    const dispatch = useAppDispatch();

    function handlePaginationInputFieldChange(event: any, fieldName: any)
    {
        if (fieldName === "IPP")
        {
            if (typeof event.target.value === "string")
            {
                // console.log(event.target.value);
                // setItemsPerPageInput(Number(event.target.value));
                dispatch(setItemsPerPage(Number(event.target.value)));
                dispatch(setCurrentPage(1));
                dispatch(fetchNotes);
            }
        }
    }

    function getPaginationButtons()
    {
        let paginationButtons: any = [];
        let numOfPages = Math.ceil(pagination.numberOfAllNotes / pagination.itemsPerPage);
        for (let i  = 0; i < numOfPages; i++)
        {
            // const tempBtn = (
            //     <ButtonGroup key={i} className="me-2" aria-label={`group #${i+1}`}>
            //         <Button
            //             onClick={(event: any) => handlePageBtnClick(event, i+1) }
            //         >{i+1}</Button>
            //     </ButtonGroup>
            // );
            const tempBtn = (
                <button
                    key={i}
                    className={i+1 === pagination.currentPage ? "pagination-button active" : "pagination-button"}
                    onClick={(event: any) => handlePageBtnClick(event, i+1) }
                >{i+1}</button>
            );
            paginationButtons.push(tempBtn);
        }
        return paginationButtons;
    }

    function handlePageBtnClick(event: any, pageNumber: number)
    {
        // console.log(`selected page: ${pageNumber}`);
        dispatch(setCurrentPage(pageNumber));
        dispatch(fetchNotes);
    }

    return (
        <Fragment>
            <div className="pagination-container-top-main">
                <h5>all notes: {pagination.numberOfAllNotes}</h5>
                <div className="items-per-page-container">
                    <label htmlFor="ipp-select">Items per page: </label>
                    <select
                        value={pagination.itemsPerPage}
                        onChange={(event: any) => { handlePaginationInputFieldChange(event, "IPP") }}
                        id="ipp-select"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                
            </div>

            {props.children}

            <div className="pagination-container-bottom-main">
                {/* <ButtonToolbar aria-label="Toolbar with button groups">
                    { getPaginationButtons() }
                </ButtonToolbar> */}
                <div className="pagination-container-bottom">
                    { getPaginationButtons() }
                </div>
            </div>
        </Fragment>
    );
}

export default Pagination;
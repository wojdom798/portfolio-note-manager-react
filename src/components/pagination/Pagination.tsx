import React, { Fragment, SyntheticEvent, useState } from "react";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { fetchNotes } from "../../redux/noteListSlice";
import {
    setItemsPerPage, setCurrentPage,
    selectPagination
} from "../../redux/paginationSlice";

// Type imports
// ...

// Third-party imports
import { IonIcon } from "react-ion-icon";


enum PaginationButtonIdentifier
{
    PAGE_NUMBER = 0,
    PREVIOUS,
    NEXT
};

function Pagination(props: any)
{
    const pagination = useAppSelector(selectPagination);
    const dispatch = useAppDispatch();
    const numberOfAllPages = Math.ceil(pagination.numberOfAllNotes / pagination.itemsPerPage);

    const handlePaginationInputFieldChange = (event: SyntheticEvent) =>
    {
        const value = Number((event.target as HTMLInputElement).value);
        if (!isNaN(value))
        {
            dispatch(setItemsPerPage(value));
            dispatch(setCurrentPage(1));
            dispatch(fetchNotes);
        }
    };

    const renderPaginationButtons = () =>
    {
        let paginationButtons: JSX.Element[] = [];

        const previousBtn = (
            <button
                key={"previous-page-button"}
                className={
                    "nts-app-pagination__button"
                }
                disabled={pagination.currentPage === 1}
                onClick={(event: SyntheticEvent) => {
                    handlePageBtnClick(
                        event,
                        PaginationButtonIdentifier.PREVIOUS
                    )
                }}
            ><IonIcon name="chevron-back-outline" /></button>
        );

        const nextBtn = (
            <button
                key={"next-page-button"}
                className={
                    "nts-app-pagination__button"
                }
                disabled={pagination.currentPage === numberOfAllPages}
                onClick={(event: SyntheticEvent) => {
                    handlePageBtnClick(
                        event,
                        PaginationButtonIdentifier.NEXT
                    )
                }}
            ><IonIcon name="chevron-forward-outline" /></button>
        );

        paginationButtons.push(previousBtn);

        for (let i  = 0; i < numberOfAllPages; i++)
        {
            const tempBtn = (
                <button
                    key={i}
                    className={i+1 === pagination.currentPage ?
                        "nts-app-pagination__button nts-app-pagination__button--active" :
                        "nts-app-pagination__button"
                    }
                    onClick={(event: SyntheticEvent) => {
                        handlePageBtnClick(
                            event,
                            PaginationButtonIdentifier.PAGE_NUMBER,
                            i+1
                        )
                    }}
                >{i+1}</button>
            );
            paginationButtons.push(tempBtn);
        }
        paginationButtons.push(nextBtn);

        return paginationButtons;
    };

    const handlePageBtnClick = (
        event: SyntheticEvent,
        pageButtonType: PaginationButtonIdentifier,
        pageNumber?: number) =>
    {
        if (pageButtonType === PaginationButtonIdentifier.PAGE_NUMBER)
        {
            if (pageNumber && pageNumber !== pagination.currentPage)
            {
                // console.log(`selected page: ${pageNumber}`);
                dispatch(setCurrentPage(pageNumber));
                dispatch(fetchNotes);
            }
        }
        else if (pageButtonType === PaginationButtonIdentifier.PREVIOUS)
        {
            if (pagination.currentPage > 1)
            {
                dispatch(setCurrentPage(pagination.currentPage - 1));
                dispatch(fetchNotes);
            }
        }
        else if (pageButtonType === PaginationButtonIdentifier.NEXT)
        {
            if (pagination.currentPage < numberOfAllPages)
            {
                dispatch(setCurrentPage(pagination.currentPage + 1));
                dispatch(fetchNotes);
            }
        }
    }

    return (
        <div className="nts-app-pagination">
            <div className="nts-app-pagination__header">
                <h5>all notes: {pagination.numberOfAllNotes}</h5>
                <div className="nts-app-pagination__items-per-page">
                    <label htmlFor="ipp-select">Items per page: </label>
                    <select
                        value={pagination.itemsPerPage}
                        onChange={handlePaginationInputFieldChange}
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

            <div className="nts-app-pagination__footer">
                <div className="nts-app-pagination__page-number-container">
                    { renderPaginationButtons() }
                </div>
            </div>
        </div>
    );
}

export default Pagination;
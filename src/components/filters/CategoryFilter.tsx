import React, { useState, Fragment } from "react";

// Redux imports
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectCategoryList } from "../../redux/categorySlice";
import { selectFilters, setCategoriesFilter } from "../../redux/filterSlice";

// Type imports
import { ICategory } from "../../types";

// Bootstrap imports
import { Modal as BooststrapModal } from "react-bootstrap";

function CategoryFilter()
{
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategoryList);
    const categoryFilters = useAppSelector(selectFilters).categories;
    const [isCategoryFilterModalOpen,
        setIsCategoryFilterModalOpen] = useState<boolean>(false);

    const handleCloseCategoryFilterModal = () =>
    {
        setIsCategoryFilterModalOpen(false);
    }

    const handleFilterSelectAllCategoriesBtnClick = () =>
    {
        dispatch(setCategoriesFilter(
            Object.values(categories).map(({id}: ICategory) => id)
        ));
    }

    const handleFilterDeselectAllCategoriesBtnClick = () =>
    {
        dispatch(setCategoriesFilter([]));
    }

    const handleCategoryFilterCheckBoxChange = (categoryId: number) =>
    {
        if (!categoryFilters.includes(categoryId))
        {
            dispatch(setCategoriesFilter([...categoryFilters, categoryId]));
        }
        else
        {
            dispatch(setCategoriesFilter(categoryFilters.filter((c: number) => c !== categoryId)));
        }
    }

    function renderCategoriesAsCheckboxes()
    {
        return Object.values(categories).map(({ id, name }: ICategory) =>
        {
            return (
                <div key={id} className="category-filter__category-checkbox-container">
                <input
                    checked={categoryFilters.includes(id)}
                    type="checkbox"
                    name="categories"
                    id={`category-checkbox-${id}`}
                    onChange={() => handleCategoryFilterCheckBoxChange(id)}
                />
                <label htmlFor={`category-checkbox-${id}`}>{name}</label>
                </div>
            );
        });
    }

    return (
        <Fragment>
        <button
            className="filters-menu-item filters-menu-button"
            onClick={() => setIsCategoryFilterModalOpen(true)}
        >categories</button>

        <BooststrapModal
            show={isCategoryFilterModalOpen}
            // onHide={handleCloseCategoryFilterModal}
            backdrop="static"
            keyboard={false}>
            <BooststrapModal.Body className="daterange-picker__bootstrap-modal-body--padding-0">
                <h2 className="category-filter__title">Filter By Categories</h2>

                <div className="category-filter__button-group-centering-container">
                    <div className="category-filter__button-group">
                        <button
                            className="category-filter__button"
                            onClick={handleFilterSelectAllCategoriesBtnClick}
                        >select all</button>
                        <button
                            className="category-filter__button"
                            onClick={handleFilterDeselectAllCategoriesBtnClick}
                        >deselect all</button>
                    </div>
                </div>
                

                <div className="category-filter__category-checkbox-list-container">
                    {renderCategoriesAsCheckboxes()}
                </div>

                <div className="category-filter__close-button-container">
                    <button
                        className="category-filter__button category-filter__close-button"
                        onClick={handleCloseCategoryFilterModal}
                    >ok</button>
                </div>
                

            </BooststrapModal.Body>
        </BooststrapModal>
        </Fragment>
    );
}

export default CategoryFilter;
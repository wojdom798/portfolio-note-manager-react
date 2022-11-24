import React, { useState, useEffect, Fragment, SyntheticEvent } from "react";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
    add as addTag,
    edit as editTag,
    remove as deleteTag,
    selectTagList
} from "../../redux/tagSlice";

// Type imports
import { ITag } from "../../types";

// App component imports
import TagForm from "./TagForm";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import BootstrapModal from 'react-bootstrap/Modal';
import Card from "react-bootstrap/Card";


function TagList()
{
    const dispatch = useAppDispatch();
    const tags = useAppSelector(selectTagList);
    const [showModal, setShowModal] = useState(false);
    const [tagToEdit, setTagToEdit] = useState<ITag | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    const handleShowModal = () =>
    {
        setTagToEdit(null);
        setShowModal(true);
    };

    const handleFormClose = () =>
    {
        setTagToEdit(null);
        setShowModal(false);
    };

    const handleToggleAllItemSelection = (event: SyntheticEvent) =>
    {
        if ((event.target as HTMLInputElement).checked)
        {
            const allIds: number[] = [];
            Object.values(tags).forEach(({id}: ITag) =>
            {
                allIds.push(id)
            });
            setSelectedTags(allIds);
        }
        else
        {
            setSelectedTags([]);
        }
    }

    const handleToggleItemSelection = (itemId: number) =>
    {
        if (selectedTags.includes(itemId))
        {
            setSelectedTags(selectedTags.filter((currentItem) =>
            {
                return currentItem !== itemId;
            }));
        }
        else
        {
            setSelectedTags([...selectedTags, itemId]);
        }
    }

    async function deleteTagsDB(tagIds: number[])
    {
        let url;
        console.log("deleting tags: ");
        console.log(tagIds);
        if (tagIds.length === 1)
            url = `api/tags/delete/${tagIds[0]}`;
        else
            url = `api/tags/delete/${JSON.stringify(tagIds)}`;
        
        const init = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            dispatch(deleteTag(tagIds));
        }
        catch (error: any)
        {
            console.log(
                "Error [TagList.tsx, handleDeleteTagButtonClick()]: ",
                error.message
            );
        }
    }

    const handleEditActionClick = () =>
    {
        if (selectedTags.length === 1)
        {
            setTagToEdit(tags[selectedTags[0]]);
            setShowModal(true);
        }
    }

    const handleDeleteActionClick = () =>
    {
        console.log("deleting tags: ");
        console.log(selectedTags);

        deleteTagsDB(selectedTags);
        setSelectedTags([]);
    }

    function renderTagsAsTableRows(tags: ITag[])
    {
        return tags.map(
            ({ id, name, date_added }: ITag, index: number) =>
        {
            return (
                <tr
                    className={
                        selectedTags.includes(id) ?
                        "table-view__row table-view__row--active" : "table-view__row"
                    }
                    key={id}
                    onClick={() => {handleToggleItemSelection(id)}}
                >
                    <td className="table-view__column">
                        <input
                            checked={selectedTags.includes(id)}
                            type="checkbox"
                            onChange={() => {handleToggleItemSelection(id)}}/>
                    </td>
                    <td className="table-view__column">{index+1}</td>
                    <td
                        className={
                            "table-view__column " +
                            "table-view__column--horizontally-scrollable"
                        }
                    >{name}</td>
                    <td className="table-view__column">{date_added}</td>
                </tr>
            );
        });
    }

    return (
    <Fragment>
        <div className="tag-list">
            <h2 className="tag-list__title">Tags</h2>
            <div className="tag-list__button-container">
                <button
                    className="notes-app-btn"
                    disabled={selectedTags.length !== 1}
                    onClick={handleEditActionClick}
                >Edit</button>
                <button
                    className="notes-app-btn notes-app-btn--danger"
                    disabled={selectedTags.length === 0}
                    onClick={handleDeleteActionClick}
                >Delete</button>
            </div>
            <div className="tag-list__table-container">
            <table className="table-view">
                <thead className="table-view__header">
                    <tr className="table-view__header-row">
                        <th className="table-view__column table-view__column--header">
                            <input
                                disabled={Object.values(tags).length === 0}
                                checked={
                                    Object.values(tags).length !== 0 &&
                                    Object.values(tags).length === 
                                    selectedTags.length
                                }
                                type="checkbox"
                                onChange={handleToggleAllItemSelection}/>
                        </th>
                        <th
                            className="table-view__column table-view__column--header"
                        >#</th>
                        <th
                            className="table-view__column table-view__column--header"
                        >Name</th>
                        <th
                            className="table-view__column table-view__column--header"
                        >Date Added</th>
                    </tr>
                </thead>
                <tbody className="table-view__body">
                    { renderTagsAsTableRows(Object.values(tags)) }
                </tbody>
            </table>
            </div>

            <Button
                onClick={handleShowModal}
                variant="primary"
                className="floating-action-btn-round"
                type="button">
            <span>&#x2B;</span>
            </Button>
        </div>

        <BootstrapModal
            show={showModal}
            backdrop="static"
            keyboard={false}>
            <BootstrapModal.Body>
                { tagToEdit ? (
                    <TagForm
                        tagToEdit={tagToEdit}
                        onFormClose={handleFormClose}
                    />
                ) : (
                    <TagForm
                        onFormClose={handleFormClose}
                    />
                )}
            </BootstrapModal.Body>
        </BootstrapModal>
    </Fragment>
    );
}

export default TagList;
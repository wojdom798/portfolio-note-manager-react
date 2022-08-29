import React, { useState } from "react";

import { Tag, selectTagList } from "../../redux/tagSlice"
import { selectNoteList, addTag, removeTag } from "../../redux/noteListSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"

import
{
    Box as MuiBox, Tabs as MuiTabs, Tab as MuiTab,
    Typography as MuiTypography,
    Stack as MuiStack, Chip as MuiChip,
} from "@mui/material";

function NoteTagManager(props: any)
{
    const dispatch = useAppDispatch();
    const tags = useAppSelector(selectTagList);
    const note = useAppSelector(selectNoteList)[props.noteId];
    const [currentTab, setCurrentTab] = useState(0);

    const handleChangeTab = (event: React.SyntheticEvent, newTabId: number) =>
    {
        setCurrentTab(newTabId);
    };

    function getTagsToRemove()
    {
        // note.tagIds !== null ?
        // note.tagIds.forEach((n: number) => { return <p key={n} >tags[n].name</p>; }) :
        // <p>no tags to remove</p>

        if (note.tagIds)
        {
            return note.tagIds.map((n: number) =>
            {
                const tagElement = (
                    <MuiChip
                        onClick={() => { removeTagFromNote(tags[n].id); }}
                        key={tags[n].id}
                        label={tags[n].name}
                        color="primary"/>
                );
                return tagElement;
            });
        }
        else
        {
            return <p>no tags to remove</p>;
        }
    }

    function getTagsToAdd()
    {

        if (Object.values(tags).length === 0)
        {
            return <p>No tags exist.</p>;
        }

        if (!note.tagIds)
        {
            return Object.values(tags)!.map((tag: Tag) =>
            {
                const tagElement = (
                    <MuiChip
                        onClick={() => { addTagToNote(tag.id); }}
                        key={tag.id}
                        label={tag.name}
                        color="primary"/>
                );
                return tagElement;
            });
        }
        else
        {
            let arrayToReturn: JSX.Element[] = [];
            Object.values(tags)!.forEach((tag: Tag) =>
            {
                if (!(note.tagIds!.includes(tag.id)))
                {
                    const tagElement = (
                        <MuiChip
                            onClick={() => { addTagToNote(tag.id); }}
                            key={tag.id}
                            label={tag.name}
                            color="primary"
                        />
                    );
                    arrayToReturn.push(tagElement);
                }
                    
            });


            // return Object.values(tags)!.filter((tag: Tag) =>
            // {
            //     if (!(note.tagIds!.includes(tag.id)))
            //         return <MuiChip key={tag.id} label={tag.name} color="primary" />;
            // });

            return arrayToReturn;
        }
    }

    async function addTagToNote(tagId: number)
    {
        // console.log(`adding tag ${tagId} to note ${note.id}`);
        let url = `/api/notes/add-tag-to-note/${note.id}/${tagId}`;
        const init = {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(url, init);
        if (!response.ok) throw new Error("Couldn't add tag to note (database)");
        const data = await response.json();
        dispatch(addTag({ note: note, tagId: tagId }));
    }

    async function removeTagFromNote(tagId: number)
    {
        // console.log(`removing tag ${tagId} from note ${note.id}`);
        let url = `/api/notes/remove-tag-from-note/${note.id}/${tagId}`;
        const init = {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(url, init);
        if (!response.ok) throw new Error("Couldn't remove tag from note (database)");
        const data = await response.json();
        dispatch(removeTag({ note: note, tagId: tagId }));
    }

    return (
        <div className="note-tag-selector-main-cointainer">
            <h5>{`select tags for note: ${props.noteId}`}</h5>
            <div className="note-tag-selector-body-container">

                <MuiBox sx={{ width: "100%" }}>
                    <MuiBox sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <MuiTabs
                            aria-label="tag manager tabs"
                            onChange={handleChangeTab}
                            value={currentTab}
                        >
                            <MuiTab label={"Add Tags"} {...a11yProps(0)} />
                            <MuiTab label={"Remove Tags"} {...a11yProps(1)} />
                        </MuiTabs>
                    </MuiBox>
                    <TabPanel value={currentTab} index={0}>
                        Add Tags
                        <div className="tag-container">
                            <MuiStack direction="row" spacing={1} alignItems="center">
                                { getTagsToAdd() }
                            </MuiStack>
                        </div>
                    </TabPanel>
                    <TabPanel  value={currentTab} index={1}>
                        Remove Tags:
                        <div>
                            { getTagsToRemove() }
                            {/* {
                                note.tagIds ?
                                note.tagIds.map((n: number) => { return <p key={n}>{tags[n].name}</p>; }) :
                                <p>no tags to remove</p>
                            } */}
                        </div>
                    </TabPanel>
                </MuiBox>

            </div>
        </div>
    );
}

function TabPanel(props: any)
{
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`my-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <MuiBox sx={{ p: 3 }}>
                    {/* <MuiTypography>{children}</MuiTypography> */}
                    {children}
                </MuiBox>
            )}
        </div>
    );
}

function a11yProps(index: number)
{
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `my-tabpanel-${index}`
    };
}

export default NoteTagManager;
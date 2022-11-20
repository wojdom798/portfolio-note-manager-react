export interface IAlert
{
    id: number;
    type: AlertTypesEnum;
    message: string;
    title?: string;
}

export interface AlertProps
{
    id: number;
    type: AlertTypesEnum;
    title: string;
};

export enum AlertTypesEnum
{
    Success = "SUCCESS",
    Warning = "WARNING",
    Error = "ERROR",
    Info = "INFO",
};

export interface ICategory
{
    id: number;
    name: string;
    date_added: string;
    user_id: number;
};

export interface IDate
{
    year: number;
    month: number;
    day: number;
};

export interface IDateRange
{
    start: string,
    end: string,
};

export interface IFilter
{
    categories: number[];
    dateRange: IDateRange | null;
    dateRangeLimit: IDateRange | null;
};

export interface MultiActionButtonProps
{
    onEditAction: () => void;
    onDeleteAction: () => void;
    onManageTagsAction: () => void;
};

export interface INote
{
    id: number;
    title: string;
    contents: string;
    date_added: string;
    category_id: number;
    user_id: number;
    tagIds: number[] | null;
};

export interface NoteProps
{
    id: number;
    title: string;
    contents: string;
    date_added: string;
    category_id: number;
    tagIds: number[] | null;
    onNoteEditButtonClick: (noteId: number) => void;
    onOpenNoteTagManagerButtonClick: (noteId: number) => void;
};

export enum NoteActionTypesEnum
{
    EDIT = "EDIT",
    DELETE = "DELETE",
    MANAGE_TAGS = "MANAGE_TAGS"
}

export interface IPagination
{
    itemsPerPage: number;
    currentPage: number;
    numberOfAllNotes: number;
};

export interface ITag
{
    id: number;
    name: string;
    date_added: string;
    user_id: number;
};

export interface IUser
{
    id: number;
    username: string;
};
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

export interface CategoryFormProps
{
    categoryToEdit?: ICategory;
    onFormSubmit: (category: ICategory) => void;
    onFormClose: () => void;
};

export enum CategoryFormInputsEnum
{
    NAME = "NAME",
    DATE_ADDED = "DATE_ADDED"
};

export interface ConfirmationDialogProps
{
    title: string;
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    onConfirmBtnClick: () => void;
    onCancelBtnClick: () => void;
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

export interface IFormInput
{
    value: string;
    state: FormInputStatesEnum;
    errorMsg: string;
};

export enum FormInputStatesEnum
{
    INITIAL = 0,
    ERROR,
    VALID,
    WARNING
}

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
    user_id?: number;
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
    onDeleteNoteButtonClick: (noteId: number) => void;
    isDeletionConfirmed: boolean;
    resetNoteIdToDelete: () => void;
};

export interface NoteFormProps
{
    noteToEdit?: INote;
    onEditNoteFormSubmit?: (editedNote: INote) => void;
    updateNoteList?: (newNote: INote) => void;
    onCloseButtonClick: () => void;
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
    user_id?: number;
};

export enum TagFormInputsEnum
{
    NAME = "NAME",
    DATE_ADDED = "DATE_ADDED"
};

export interface TagFormProps
{
    tagToEdit?: ITag;
    onFormClose: () => void;
};

export interface IUser
{
    id: number;
    username: string;
};

export enum NavigationViewEnum
{
    NOTE_LIST,
    CATEGORY_LIST,
    TAG_LIST,
    SETTINGS
};

export interface IMenuItem
{
    name: string;
    identifier: NavigationViewEnum;
};

export interface NavigationProps
{
    onNavigationItemClick: (menuItemIdentifier: NavigationViewEnum) => any;
    onAddItemButtonClick: () => any;
};
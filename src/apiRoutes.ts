export default {
    // ************************************************************************
    //                        Authentication Routes
    // ************************************************************************
    login: "/api/auth/login",
    singup: "/api/auth/sign-up",
    logout: "/api/auth/logout",


    // ************************************************************************
    //                             Note Routes
    // ************************************************************************
    getNotes: "/api/notes/get",
    addNote: "/api/notes/add",
    deleteNote: "/api/notes/delete/", // :id
    editNote: "/api/notes/edit",
    addTagToNote: "/api/notes/add-tag-to-note/", // :noteId/:tagId
    removeTagFromNote: "/api/notes/remove-tag-from-note/", // :noteId/:tagId


    // ************************************************************************
    //                           Category Routes
    // ************************************************************************
    getCategories: "/api/categories/get",
    addCategory: "/api/categories/add",
    deleteCategory: "/api/categories/delete/", // :id
    editCategory: "/api/categories/edit",


    // ************************************************************************
    //                              Tag Routes
    // ************************************************************************
    getTags: "/api/tags/get",
    addTag: "/api/tags/add",
    deleteTag: "/api/tags/delete/", // :id
    editTag: "/api/tags/edit",


    // ************************************************************************
    //                         Miscellaneous Routes
    // ************************************************************************
    getDateRange: "/get-date-range",
    isUsernameAvailable: "/is-username-available/", // :username
    isCategoryAvailable: "/is-category-available/", // :name
    isTagAvailable: "/is-tag-available/", // :name
};
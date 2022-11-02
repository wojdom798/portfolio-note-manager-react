export function createDefaultUserDataInStorage()
{
    const userData =
    {
        user: null,
        wasUserLoggedOut: false,
        sessionExpirationDate: null
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    return userData;
}

export function getUserDataFromStorage()
{
    /*
        interface IUserStorageData
        {
            user: { id: number, username: string } | null;
            wasUserLoggedOut: boolean;
            sessionExpirationDate: Date | null
        };
    */
    const userDataStr = localStorage.getItem("userData");
    let userData;
    if (!userDataStr) throw new Error("User data does not exist in local storage");
    userData = JSON.parse(userDataStr);
    return userData;
}

export function setUserInStorage(user: { id: number, username: string } | null)
{
    let userData = getUserDataFromStorage();
    userData.user = user;
    localStorage.setItem("userData", JSON.stringify(userData));
}

export function setWasUserLoggedOutInStorage(flag: boolean)
{
    let userData = getUserDataFromStorage();
    userData.wasUserLoggedOut = flag;
    localStorage.setItem("userData", JSON.stringify(userData));
}

export function setSessionExpirationDateInLocalStorage(expirationDate: Date | null)
{
    let userData = getUserDataFromStorage();
    userData.sessionExpirationDate = expirationDate;
    localStorage.setItem("userData", JSON.stringify(userData));
}
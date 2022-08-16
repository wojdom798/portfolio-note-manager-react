export default (function()
{

function getCurrentDateTimeString(): string
{
    let currentDateTime = new Date();
    let year = currentDateTime.getFullYear();
    let month = currentDateTime.getMonth() + 1 < 10 ? `0${currentDateTime.getMonth() + 1}` : currentDateTime.getMonth() + 1;
    let day = currentDateTime.getDate() < 10 ? `0${currentDateTime.getDate()}` : currentDateTime.getDate();
    let hours = currentDateTime.getHours() < 10 ? `0${currentDateTime.getHours()}`: currentDateTime.getHours();
    let minutes = currentDateTime.getMinutes() < 10 ? `0${currentDateTime.getMinutes()}`: currentDateTime.getMinutes();
    let seconds = currentDateTime.getSeconds() < 10 ? `0${currentDateTime.getSeconds()}`: currentDateTime.getSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

return {
    getCurrentDateTimeString: getCurrentDateTimeString
};

})();
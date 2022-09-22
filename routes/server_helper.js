module.exports = (function()
{

function _replaceAllV1(str, toReplace, replaceWith)
{
    let strArray = str.split(toReplace);
    // console.log(strArray);
    let finalString = "";
    for (let i = 0; i < strArray.length; i++)
    {
        if (strArray.length - i === 1)
        {
            if (strArray[i] === '')
            {
                continue;
            }
            else
            {
                finalString += strArray[i];
            }
        }
        else
        {
            finalString += strArray[i] + replaceWith;
        }
    }
    return finalString;
}

function sanitizeText(str)
{
    // return str.replaceAll("\'", "\'\'");
    return _replaceAllV1(str, "\'", "\'\'");
}
    
return {
    sanitizeText: sanitizeText,
};

})();
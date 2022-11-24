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

function generateSQLMultiORCondition(numOfConditions, columnName, dbType)
{
    if (!(dbType === "sqlite" || dbType === "postgres")) return undefined;
    if (numOfConditions === 1)
    {
        if (dbType === "sqlite")
            return `(${columnName} = ?)`;
        else if (dbType === "postgres")
            return `(${columnName} = $2)`;
    }
    else if (numOfConditions > 1)
    {
        let outStr = "(";
        for (let i = 0; i < numOfConditions; i++)
        {
            if (i !== numOfConditions-1)
            {
                if (dbType === "sqlite")
                    outStr += `(${columnName} = ?) OR `;
                else if (dbType === "postgres")
                    outStr += `(${columnName} = $${i+2}) OR `;
            }
            else // last item
            {
                if (dbType === "sqlite")
                    outStr += `(${columnName} = ?)`;
                else if (dbType === "postgres")
                    outStr += `(${columnName} = $${i+2})`;
            }
        }
        return outStr + ")";
    }
    return undefined;
}
    
return {
    sanitizeText: sanitizeText,
    generateSQLMultiORCondition: generateSQLMultiORCondition
};

})();
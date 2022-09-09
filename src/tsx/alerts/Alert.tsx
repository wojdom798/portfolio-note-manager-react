import React, { useState, useEffect } from "react";
import {IonIcon} from "react-ion-icon";
import { AlertTypes } from "./alertTypes";

// redux
import { remove as removeAlert } from "../../redux/alertListSlice";
import { useAppDispatch } from "../../redux/hooks";

interface AlertPropTypes
{
    id: number;
    type: AlertTypes;
    title: string;
};

const renderAlertIcon = (type: AlertTypes) =>
{
    if (type === AlertTypes.Success)
    {
        return (
        <div className="alert-icon-container alert-success">
            <IonIcon name="checkmark-outline"></IonIcon>
        </div>);
    }
    else if (type === AlertTypes.Error)
    {
        return (
        <div className="alert-icon-container alert-error">
            <IonIcon name="skull-outline"></IonIcon>
        </div>);
    }
    else if (type === AlertTypes.Warning)
    {
        return (
        <div className="alert-icon-container alert-warning">
            <IonIcon name="warning-outline"></IonIcon>
        </div>);
    }
    else if (type === AlertTypes.Info)
    {
        return (
        <div className="alert-icon-container alert-info">
            <IonIcon name="information-outline"></IonIcon>
        </div>);
    }
    
};

function Alert({ id, type, title }: AlertPropTypes)
{
    const dispatch = useAppDispatch();
    const [timeLeftProgress, setTimeLeftProgress] = useState<number>(100);

    const handleOnAlertDeleteBtnClick = (alertId: number) =>
    {
        dispatch(removeAlert(alertId));
    };
    
    useEffect(() =>
    {
        const interval = setInterval(() =>
        {
            // if (timeLeftProgress <= 0)
            //     setTimeLeftProgress(100);
            // else
            //     setTimeLeftProgress(timeLeftProgress - 0.2);
            if (timeLeftProgress <= 0)
                dispatch(removeAlert(id));
            else
                setTimeLeftProgress(timeLeftProgress - 0.2);
        }, 50);

        return () => { clearInterval(interval); };
    }, [timeLeftProgress]);

    return (
        <div className="alert-main-container">
            { renderAlertIcon(type) }
            <div className="alert-header-container">
                <h3 className="alert-title">{title}</h3>
            </div>

            <button
                onClick={() => handleOnAlertDeleteBtnClick(id)}
                className="alert-close-btn"
            >
                <IonIcon name="close-circle-outline"></IonIcon>
            </button>
            <span
                className="alert-disappear-progress"
                style={ {width: `${timeLeftProgress}%`} }></span>
        </div>
    );
}

export default Alert;
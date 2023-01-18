import React, { useState } from "react";
import {IonIcon} from "react-ion-icon";
import Alert from "./Alert";

// redux imports
import { selectAlertList } from "../../redux/alertListSlice";
import { useAppSelector } from "../../redux/hooks";


function AlertList(props: any)
{
    const alerts = useAppSelector(selectAlertList);
    const [isAlertListActive, setIsAlertListActive] = useState<boolean>(false);

    return (
        <div className="alert-list-container">
            <button
                className="alert-list-container__icon-container"
                onClick={() => setIsAlertListActive(!isAlertListActive)}
            >
                <IonIcon name="notifications-outline"></IonIcon>
            </button>

            <ul
                className={
                    isAlertListActive ?
                    "alert-list " + "alert-list--active" :
                    "alert-list"
                }
            >
                { alerts.map((alert: any) =>
                    <Alert
                        key={alert.id}
                        id={alert.id}
                        title={alert.message}
                        type={alert.type}/> )
                }
            </ul>

        </div>
    );
}

export default AlertList;
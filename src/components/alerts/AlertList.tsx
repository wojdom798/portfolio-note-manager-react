import React from "react";
import {IonIcon} from "react-ion-icon";
import Alert from "./Alert";

// redux imports
import { selectAlertList } from "../../redux/alertListSlice";
import { useAppSelector } from "../../redux/hooks";


function AlertList(props: any)
{
    const alerts = useAppSelector(selectAlertList);

    return (
        <div className="alert-list-main-container">
            
            { alerts.map((alert: any) =>
                <Alert
                    key={alert.id}
                    id={alert.id}
                    title={alert.message}
                    type={alert.type}/> )
            }

        </div>
    );
}

export default AlertList;
import React from "react";
import {IonIcon} from "react-ion-icon";
import { AlertTypes } from "./alertTypes";
import Alert from "./Alert";

function AlertList(props: any)
{
    return (
        <div className="alert-list-main-container">

            <Alert
                title="Alert 1"
                type={AlertTypes.Success}/>

            <Alert
                title="Alert 2"
                type={AlertTypes.Success}/>

            <Alert
                title="Alert 3"
                type={AlertTypes.Error}/>

            <Alert
                title="Alert 4"
                type={AlertTypes.Warning}/>

            <Alert
                title="Alert 5"
                type={AlertTypes.Info}/>

        </div>
    );
}

export default AlertList;
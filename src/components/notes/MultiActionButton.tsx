import React, { useState } from "react";

// type imports
import { MultiActionButtonProps } from "../../types";

// 3rd party imports
import { IonIcon } from "react-ion-icon";


function MultiActionButton({ onEditAction, onDeleteAction, onManageTagsAction }: MultiActionButtonProps)
{
    const [isActionListActive, setIsActionListActive] = useState<boolean>(false);

    return (
        <div className="multi-action-btn-container">
            <button
                className="multi-action-btn"
                onClick={() => setIsActionListActive(!isActionListActive)}
            >
                <IonIcon name="ellipsis-vertical-outline" />
            </button>

            <div className={isActionListActive ? "action-list-container active": "action-list-container"}>
                <button
                    className="multi-action-btn__action"
                    onClick={onEditAction}
                >Edit</button>
                <button
                    className="multi-action-btn__action multi-action-btn__action--warning"
                    onClick={onDeleteAction}
                >Delete</button>
                <button
                    className="multi-action-btn__action"
                    onClick={onManageTagsAction}
                >Manage tags</button>
            </div>
        </div>
    );
}

export default MultiActionButton;
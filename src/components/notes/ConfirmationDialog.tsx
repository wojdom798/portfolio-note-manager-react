import React from "react";

// Type imports
import { ConfirmationDialogProps } from "../../types";


export default function ConfirmationDialog({
    title, message, confirmButtonText, cancelButtonText,
    onConfirmBtnClick, onCancelBtnClick
}: ConfirmationDialogProps)
{
    return (
        <div className="confirmation-dialog">
            <h2 className="confirmation-dialog__title">
                {title}
            </h2>
            <p className="confirmation-dialog__message">
                {message}
            </p>
            <div className="confirmation-dialog__button-group">
                <button
                    className={
                        "notes-app-btn " +
                        "confirmation-dialog__button " +
                        "notes-app-btn--danger "
                    }
                    onClick={onConfirmBtnClick}
                >{confirmButtonText ? confirmButtonText : "confirm"}</button>
                <button
                    className={
                        "notes-app-btn " +
                        "confirmation-dialog__button"
                    }
                    onClick={onCancelBtnClick}
                >{cancelButtonText ? cancelButtonText : "cancel"}</button>
            </div>
        </div>
    );
}
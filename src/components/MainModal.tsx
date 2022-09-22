import React from "react";
import { Modal, Button } from "react-bootstrap";

function MainModal(props: any)
{
    if (!props)
    {
        return (
            <Modal
                show={false}
                backdrop="static"
                keyboard={false}>
            </Modal>
        );
    }
    else
    {
        return (
            <Modal
                show={props.showModal}
                onHide={props.onHide}
                backdrop="static"
                keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.title}</Modal.Title>
                </Modal.Header>
    
                <Modal.Body>
                    { props.children }
                </Modal.Body>
    
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={props.onApplyBtnClick}
                    >{props.applyBtnText}</Button>
                    <Button
                        variant="primary"
                        onClick={props.onCloseBtnClick}
                    >{props.closeBtnText}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default MainModal;
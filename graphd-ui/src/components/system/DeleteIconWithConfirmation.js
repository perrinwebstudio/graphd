import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Delete } from '@material-ui/icons';

function DeleteIconWithConfirmation({ confirmationMessage, onYes = () => { }, onNo = () => { } }) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const no = () => {
        onNo();
        setOpen(false);
    };

    const yes = () => {
        onYes();
        setOpen(false);
    };

    return (
        <>
            <IconButton edge="end" aria-label="delete" onClick={handleOpen}>
                <Delete />
            </IconButton>
            <Dialog open={open} onClose={no}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>{confirmationMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={no}>No</Button>
                    <Button onClick={yes} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export { DeleteIconWithConfirmation };

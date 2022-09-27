import React, { useState, useCallback } from 'react';
import {
  Typography,
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  makeStyles
} from '@mui/styles';

const useStyles = makeStyles(() => ({
}));

const ConfirmBox = ({ description, confirmText = 'Yes', cancelText = 'No', onFinish, confirmAction = () => {}, cancelAction = () => {}, disabledCancel, disabledBackdropClick }) => {
  const [open, setOpen] = useState(true);
  const onClose = useCallback(() => {setOpen(false); onFinish()}, [onFinish]);

  const onCancel = useCallback(() => {
    cancelAction();
    onClose();
  }, [cancelAction, onClose]);
  const onConfirm = useCallback(() => {
    confirmAction();
    onClose();
  }, [confirmAction, onClose]);

  return (
    <Dialog
      onClose={!disabledBackdropClick ? onClose : () => {}}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
      </DialogTitle>
      <DialogContent>
        {description}
      </DialogContent>
      <DialogActions>
        {!disabledCancel && (
        <Button size="small" variant="contained" color="error" onClick={onCancel}>
          {cancelText}
        </Button>
        )}
        <Button size="small" variant="contained" color="primary" onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmBox;

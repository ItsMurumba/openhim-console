import React from 'react'
import Alert, {AlertColor} from '@mui/material/Alert'
import Backdrop from '@mui/material/Backdrop'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'

export type AlertDialogProps = {
  title?: string
  message: string
  open: boolean
  onClose: () => void
  severity?: AlertColor
}

export function AlertDialog(props: AlertDialogProps) {
  return (
    <Backdrop
      sx={{color: '#fff', zIndex: theme => theme.zIndex.drawer + 1}}
      onClick={props.onClose}
      open={props.open}
    >
      <div style={{minWidth: '500px'}}>
        <Alert
          variant="standard"
          severity={props.severity ?? 'info'}
          action={
            <Button
              variant="contained"
              color={props.severity}
              size="small"
              onClick={props.onClose}
            >
              OK
            </Button>
          }
        >
          {props.title && <AlertTitle>{props.title}</AlertTitle>}
          {props.message}
        </Alert>
      </div>
    </Backdrop>
  )
}
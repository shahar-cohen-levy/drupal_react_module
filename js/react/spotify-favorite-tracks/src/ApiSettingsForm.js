import React, { useState } from 'react'
import { IoMdSettings } from 'react-icons/io'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material'

import PropTypes from 'prop-types'
import { fetchCredentials, saveCredentials } from './api'

function ApiSettingsForm({
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  sessionToken,
  spotifyToken,
  setErr,
}) {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    fetchCredentials(setClientId, setClientSecret, sessionToken)
    setOpen(false)
  }

  const handleSaveCredentials = () => {
    saveCredentials(clientId, clientSecret, sessionToken, setErr)
    setOpen(false)
  }

  return (
    <>
      <div style={{ textAlign: 'right' }}>
        <IconButton
          color={spotifyToken ? 'success' : 'error'}
          onClick={() => handleClickOpen()}
        >
          <IoMdSettings />
        </IconButton>
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To use this Module, please enter your Client Id and Secret here. You
            should get these details from Spotify API.
          </DialogContentText>
          <TextField
            margin="dense"
            id="client_id"
            label="Client Id"
            type="text"
            fullWidth
            required
            variant="standard"
            value={clientId || ''}
            onChange={(e) => setClientId(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="client_secret"
            label="Client secret"
            type="text"
            fullWidth
            required
            variant="standard"
            value={clientSecret || ''}
            onChange={(e) => setClientSecret(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={() => handleSaveCredentials(clientId, clientSecret)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

ApiSettingsForm.propTypes = {
  clientId: PropTypes.string,
  setClientId: PropTypes.func.isRequired,
  clientSecret: PropTypes.string,
  setClientSecret: PropTypes.func.isRequired,
  sessionToken: PropTypes.string.isRequired,
  spotifyToken: PropTypes.string,
  setErr: PropTypes.func.isRequired,
}

export default ApiSettingsForm

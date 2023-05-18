import React from 'react'
import { Alert } from '@mui/material'
import * as PropType from 'prop-types'
import { v4 as uuidv4 } from 'uuid'

function ErrorMessage({ err }) {
  if (err?.length === 0) {
    return null
  }
  return (
    <>
      {err.map((error) => (
        <Alert key={uuidv4()} severity="error">
          {error}
        </Alert>
      ))}
    </>
  )
}

ErrorMessage.propTypes = {
  err: PropType.array.isRequired,
}

export default ErrorMessage

import React, { useMemo, useState, useCallback } from 'react'
import MaterialReactTable from 'material-react-table'
import PropTypes from 'prop-types'
import { PacmanLoader } from 'react-spinners'
import { Box, IconButton, Tooltip } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { IoMdThumbsDown, IoMdThumbsUp } from 'react-icons/io'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'
import { deleteTrack } from './api'
const SweetAlert = withReactContent(Swal)

const pacmanLoaderOverride = {
  margin: '3rem auto',
}
function TracksList({ sessionToken, allTracks, setAllTracks, setErr }) {
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'trackName',
        header: 'Name',
      },
      {
        accessorFn: (row) => row.artist,
        id: 'artistName',
        header: 'Artist',
      },
    ],
    [],
  )
  const [loader, setLoader] = useState(true)

  setTimeout(() => setLoader(false), 2000)

  const handleDeleteRow = useCallback(
    (row) => {
      SweetAlert.fire({
        title: `<p>Delete this song?</p>`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: <IoMdThumbsUp />,
        confirmButtonAriaLabel: 'Thumbs up, great!',
        cancelButtonText: <IoMdThumbsDown />,
        cancelButtonAriaLabel: 'Thumbs down',
      }).then((result) => {
        if (result.isConfirmed) {
          allTracks.splice(row.index, 1)
          deleteTrack(sessionToken, row.original.uuid, setErr)
          return setAllTracks([...allTracks])
        }
        return SweetAlert.fire(<p>Not deleted</p>)
      })
    },
    [allTracks, setAllTracks, sessionToken, setErr],
  )

  return (
    <>
      <PacmanLoader
        color="rgb(54, 215, 183)"
        loading={loader}
        size={50}
        cssOverride={pacmanLoaderOverride}
        aria-label="Loading Spinner"
        data-testid="loader"
      />

      {!loader && sessionToken && allTracks && (
        <>
          <h2>Tracks on my list</h2>
          <MaterialReactTable
            columns={columns}
            data={allTracks}
            enableEditing
            enableColumnFilters={false}
            enableTopToolbar={false}
            renderRowActions={({ row }) => (
              <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip arrow placement="right" title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteRow(row)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          />
        </>
      )}
    </>
  )
}

TracksList.propTypes = {
  sessionToken: PropTypes.string.isRequired,
  setAllTracks: PropTypes.func.isRequired,
  allTracks: PropTypes.array.isRequired,
  setErr: PropTypes.func.isRequired,
}

export default TracksList

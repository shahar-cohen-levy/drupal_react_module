import React, { useEffect, useState } from 'react'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { IoMdThumbsDown, IoMdThumbsUp } from 'react-icons/io'
import PropTypes from 'prop-types'
import { v4 as uuidv4 } from 'uuid'
import { BarLoader } from 'react-spinners'
import { fetchSearchResults, saveSongTerm } from './api'

const MySwal = withReactContent(Swal)
function SearchTracks({
  sessionToken,
  setAllTracks,
  allTracks,
  err,
  setErr,
  setIsLoading,
  spotifyToken,
  clientId,
  clientSecret,
  isLoading,
}) {
  const [tracks, setTracks] = useState()
  const [searchTerm, setSearchTerm] = useState()
  const [clearInput, setClearInput] = useState('')

  useEffect(() => {
    if (spotifyToken && searchTerm) {
      fetchSearchResults(
        spotifyToken,
        searchTerm,
        setTracks,
        setErr,
        setIsLoading,
      )
    }
  }, [spotifyToken, searchTerm, setErr, setIsLoading])

  const handleOnSearch = (string) => {
    setSearchTerm(string)
  }

  const handleOnSelect = (item) => {
    const { name, artists, id } = item
    MySwal.fire({
      title: `<p>Add ${name} by ${artists[0].name}?</p>`,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: <IoMdThumbsUp />,
      confirmButtonAriaLabel: 'Thumbs up, great!',
      cancelButtonText: <IoMdThumbsDown />,
      cancelButtonAriaLabel: 'Thumbs down',
    }).then((result) => {
      if (result.isConfirmed) {
        return handleSave(name, artists[0].name, id)
      }
      return MySwal.fire(<p>Not saved</p>)
    })
  }

  const handleClear = () => {
    const randomKey = uuidv4()
    setClearInput(randomKey)
  }

  const handleSave = (name, artist, id) => {
    handleClear()
    saveSongTerm(
      name,
      artist,
      id,
      sessionToken,
      setAllTracks,
      allTracks,
      setErr,
    )
  }

  return (
    <>
      {isLoading && (
        <BarLoader
          color="rgb(54, 215, 183)"
          loading={isLoading}
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      )}
      {!isLoading && !clientId && !clientSecret && !err && (
        <div>
          Welcome, please click on the settings button in order to enter Spotify
          API credentials
        </div>
      )}
      {spotifyToken && (
        <ReactSearchAutocomplete
          items={tracks}
          onSearch={handleOnSearch}
          onSelect={handleOnSelect}
          placeholder="Find your favorite tracks..."
          styling={{ zIndex: 1 }}
          key={clearInput}
        />
      )}
    </>
  )
}

SearchTracks.propTypes = {
  sessionToken: PropTypes.string.isRequired,
  setAllTracks: PropTypes.func.isRequired,
  allTracks: PropTypes.array.isRequired,
  setErr: PropTypes.func.isRequired,
  spotifyToken: PropTypes.string,
  clientId: PropTypes.string,
  clientSecret: PropTypes.string,
  setIsLoading: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  err: PropTypes.array.isRequired,
}

export default SearchTracks

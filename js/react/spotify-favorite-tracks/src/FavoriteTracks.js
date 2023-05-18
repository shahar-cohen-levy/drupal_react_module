import React, { useEffect, useState } from 'react'
import SearchTracks from './SearchTracks'
import TracksList from './TracksList'
import {
  fetchAllSongs,
  fetchCredentials,
  fetchSessionToken,
  fetchSpotifyToken,
} from './api'
import ApiSettingsForm from './ApiSettingsForm'
import ErrorMessage from './ErrorMessage'

function FavoriteTracks() {
  const [sessionToken, setSessionToken] = useState('')
  const [allTracks, setAllTracks] = useState([])
  const [err, setErr] = useState([])
  const [clientId, setClientId] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [spotifyToken, setSpotifyToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const props = {
    sessionToken,
    allTracks,
    setAllTracks,
    err,
    setErr,
    clientId,
    setClientId,
    clientSecret,
    setClientSecret,
    spotifyToken,
    setIsLoading,
    isLoading,
  }

  useEffect(() => {
    fetchSessionToken(setSessionToken, setErr)
  }, [])

  useEffect(() => {
    fetchCredentials(setClientId, setClientSecret, sessionToken, setErr)
  }, [sessionToken])

  useEffect(() => {
    fetchSpotifyToken(
      clientId,
      clientSecret,
      setSpotifyToken,
      setErr,
      setIsLoading,
    )
  }, [clientId, clientSecret])

  useEffect(() => {
    fetchAllSongs(setAllTracks, sessionToken, setErr)
  }, [sessionToken])

  return (
    <>
      <ErrorMessage err={err} />
      <ApiSettingsForm {...props} />
      <SearchTracks {...props} />
      <TracksList {...props} />
    </>
  )
}

export default FavoriteTracks

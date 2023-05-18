/* global drupalSettings:true */
import MySwal from 'sweetalert2'

const {
  dataFromDrupal: { baseUrl },
} = drupalSettings

export const fetchSpotifyToken = (
  clientId,
  clientSecret,
  setSpotifyToken,
  setErr,
  setIsLoading,
) => {
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const method = 'POST'
  const body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`

  if (!clientId && !clientSecret) {
    setIsLoading(false)
    return
  }

  fetch('https://accounts.spotify.com/api/token', { method, headers, body })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error_description)
      }
      return response.json()
    })
    .then(
      (data) => {
        setSpotifyToken(data.access_token)
        setErr([])
        setIsLoading(false)
      },
      (err) => {
        setSpotifyToken()
        setIsLoading(false)
        setErr((prevState) => {
          if (prevState) {
            return [...prevState, [`${err.message} from spotify`]]
          }
          return [...prevState]
        })
      },
    )
}

export const fetchSessionToken = (setSessionToken, setErr) => {
  fetch(`${baseUrl}/session/token`)
    .then((response) => {
      if (response.status === 200) {
        return response.text()
      }
      throw new Error('wrong session token from Drupal')
    })
    .then(
      (data) => {
        setSessionToken(data)
      },
      (err) => {
        setErr((prevState) => {
          if (prevState) {
            return [...prevState, err.message]
          }
          return [...prevState]
        })
      },
    )
}

export const fetchSearchResults = (
  token,
  searchTerm,
  setTracks,
  setErr,
  setIsLoading,
) => {
  const headers = { Authorization: `Bearer ${token}` }
  const method = 'GET'
  const url = `https://api.spotify.com/v1/search?q=${searchTerm}&type=track&market=GB&limit=5`
  fetch(url, { method, headers })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error?.message)
      }
      return response.json()
    })
    .then(
      (data) => setTracks(data?.tracks?.items),
      (err) => {
        setTracks()
        setIsLoading(false)
        setErr((prevState) => {
          if (
            prevState &&
            !prevState.includes(`${err?.message} error from spotify`)
          ) {
            return [...prevState, `${err?.message} error from spotify`]
          }
          return [...prevState]
        })
      },
    )
}

export const saveSongTerm = (
  name,
  artist,
  id,
  sessionToken,
  setAllTracks,
  allTracks,
  setErr,
) => {
  const foundInList = allTracks.some((el) => el.spotifyTrackId === id)
  if (foundInList) {
    return MySwal.fire({
      title: 'Artist not added',
      text: `${name} is already on your list`,
      timer: 3000,
      icon: 'error',
      showConfirmButton: false,
    })
  }
  const headers = {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: 'Basic YXBpOmFwaQ==',
    'X-CSRF-Token': sessionToken,
  }
  const body = JSON.stringify({
    data: {
      type: 'taxonomy_term--songs',
      attributes: {
        name,
        field_artist_name: artist,
        field__song_id: id,
      },
    },
  })
  const method = 'POST'
  const url = `${baseUrl}/jsonapi/taxonomy_term/songs`
  fetch(url, { method, headers, body })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error?.message)
      }
      return response.json()
    })
    .then(
      (data) => {
        setAllTracks([
          {
            name,
            artist,
            uuid: data.data.id,
            spotifyTrackId: id,
          },
          ...allTracks,
        ])
        return MySwal.fire({
          title: 'Track saved',
          text: `${name} was added to your list`,
          timer: 2000,
          icon: 'success',
          showConfirmButton: false,
        })
      },
      (err) => {
        setErr((prevState) => {
          if (prevState) {
            return [...prevState, err.message]
          }
          return [...prevState]
        })
        return MySwal.fire({
          title: 'Artist not added',
          text: 'Unable to save song, please contact',
          timer: 3000,
          icon: 'error',
          showConfirmButton: false,
        })
      },
    )
  return true
}

export const fetchAllSongs = (setAllTracks, sessionToken, setErr) => {
  const headers = {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: 'Basic YXBpOmFwaQ==',
    'X-CSRF-Token': sessionToken,
  }
  const method = 'GET'
  const url = `${baseUrl}/jsonapi/taxonomy_term/songs`
  fetch(url, { method, headers })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error?.message)
      }
      return response.json()
    })
    .then(
      (data) => {
        setAllTracks(
          data.data.map(
            ({
              id: uuid,
              attributes: {
                name,
                field_artist_name: artist,
                field__song_id: spotifyTrackId,
              },
            }) => ({ name, artist, uuid, spotifyTrackId }),
          ),
        )
      },
      (err) => {
        setErr((prevState) => {
          if (prevState) {
            return [...prevState, err.message]
          }
          return [...prevState]
        })
      },
    )
}

export const deleteTrack = (sessionToken, uuid, setErr) => {
  const headers = {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: 'Basic YXBpOmFwaQ==',
    'X-CSRF-Token': sessionToken,
  }
  const method = 'DELETE'
  const url = `${baseUrl}/jsonapi/taxonomy_term/songs/${uuid}`
  fetch(url, { method, headers })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.errors[0]?.detail)
      }
      return response
    })
    .catch((err) => {
      setErr((prevState) => {
        if (prevState) {
          return [...prevState, `Track not deleted. ${err.message}`]
        }
        return [...prevState]
      })
    })
}

export const fetchCredentials = (
  setClientId,
  setClientSecret,
  sessionToken,
  setErr,
) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Basic YXBpOmFwaQ==',
    'X-CSRF-Token': sessionToken,
  }

  const method = 'GET'
  const url = `${baseUrl}/spotify_songs/api_resource?_format=json`
  fetch(url, { method, headers })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.message)
      }
      return response.json()
    })
    .then(
      (data) => {
        setClientId(data.client_id)
        setClientSecret(data.client_secret)
      },
      (err) => {
        setErr((prevState) => {
          if (prevState) {
            return [...prevState, err.message]
          }
          return [...prevState]
        })
      },
    )
}

export const saveCredentials = (
  clientId,
  clientSecret,
  sessionToken,
  setErr,
) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Basic YXBpOmFwaQ==',
    'X-CSRF-Token': sessionToken,
  }
  const body = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
  })

  const method = 'POST'
  const url = `${baseUrl}/spotify_songs/api_resource/set?_format=json`
  fetch(url, { method, headers, body })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.message)
      }
      return response
    })
    .catch((err) => {
      setErr((prevState) => {
        if (prevState) {
          return [...prevState, `Credentials not saved. ${err.message}`]
        }
        return [...prevState]
      })
    })
}

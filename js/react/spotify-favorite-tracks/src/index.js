import React from 'react'
import { createRoot } from 'react-dom/client'
import FavoriteTracks from './FavoriteTracks'
const container = document.getElementById('fa-songs-api')
const root = createRoot(container)

root.render(<FavoriteTracks />)

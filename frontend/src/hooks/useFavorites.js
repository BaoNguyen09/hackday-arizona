import { useState } from 'react'

const STORAGE_KEY = 'dishcovery-favorites'

/**
 * TODO:
 * - Read/write favorites from localStorage
 * - Each favorite: { name: string, addedAt: string }
 * - Return { favorites, addFavorite, removeFavorite }
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const save = (next) => {
    setFavorites(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addFavorite = (name) => {
    if (favorites.some((f) => f.name === name)) return
    save([...favorites, { name, addedAt: new Date().toISOString() }])
  }

  const removeFavorite = (name) => {
    save(favorites.filter((f) => f.name !== name))
  }

  return { favorites, addFavorite, removeFavorite }
}

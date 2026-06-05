import { createContext, useContext } from 'react'
export const SceneContext = createContext({ isDaytime: true })
export const useScene = () => useContext(SceneContext)

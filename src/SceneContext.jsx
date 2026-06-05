import { createContext, useContext } from 'react'
export const SceneContext = createContext({
  isDaytime: true,
  selected: null,
  setSelected: () => {},
})
export const useScene = () => useContext(SceneContext)

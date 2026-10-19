import { createContext, useContext, useEffect, useState } from 'react'
import userService from '../services/userService.js'
import { getToken } from '../services/api.js'

const AuthContext = createContext(null)

// keeps track of who's logged in so any page can use it
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // if there's a saved token, check it's still good when the app loads
  useEffect(() => {
    if (!getToken()) { setLoading(false); return }
    userService.getMe()
      .then(setUser)
      .catch(() => userService.logout())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => setUser(await userService.login(email, password))
  const register = async (data) => setUser(await userService.register(data))
  const logout = () => { userService.logout(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

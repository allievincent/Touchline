import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import Sessions from './pages/Sessions/Sessions.jsx'
import SessionDetail from './pages/SessionDetail/SessionDetail.jsx'
import SessionForm from './pages/SessionForm/SessionForm.jsx'
import Schedule from './pages/Schedule/Schedule.jsx'
import Profile from './pages/Profile/Profile.jsx'
import TrainingLog from './pages/TrainingLog/TrainingLog.jsx'
import LogForm from './pages/LogForm/LogForm.jsx'
import PlayerLogs from './pages/PlayerLogs/PlayerLogs.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* anyone can see these */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* have to be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/log" element={<TrainingLog />} />
          <Route path="/log/new" element={<LogForm />} />
          <Route path="/log/:id/edit" element={<LogForm />} />
        </Route>

        {/* coaches only */}
        <Route element={<ProtectedRoute role="coach" />}>
          <Route path="/sessions/new" element={<SessionForm />} />
          <Route path="/sessions/:id/edit" element={<SessionForm />} />
          <Route path="/log/shared" element={<PlayerLogs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

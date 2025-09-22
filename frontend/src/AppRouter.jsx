import { Routes, Route } from 'react-router-dom'
import App from './App'
import AuthLayout from './components/AuthLayout'
import NotFound from './components/NotFound'
import PersistLogin from './components/PersistLogin'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Authorization from './components/Authorization'
import UnAuthorized from './components/UnAuthorized'
import StudentProfile from './pages/StudentProfile'

function AppRouter() {
    return (
        <Routes>
            <Route element={<PersistLogin />}>
                {/* Protected Routes */}
                <Route element={<AuthLayout authenticated={true} />}>
                    <Route path="/" element={<App />}>
                        <Route index element={<Home />} />
                        {/* Student routes */}
                        <Route element={<Authorization role={"student"} />}>
                            <Route path="/student" element={<StudentProfile />} />
                        </Route>
                        {/* Teacher routes */}
                        <Route element={<Authorization role={"teacher"} />}>
                            <Route path="/teacher" element={<Home />} />
                        </Route>
                        {/* Parent routes */}
                        <Route element={<Authorization role={"parent"} />}>
                            <Route path="/parent" element={<Home />} />
                        </Route>
                    </Route>
                </Route>
                {/* Public Routes */}
                <Route element={<AuthLayout authenticated={false} />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>
                <Route path='*' element={<NotFound />} />
                <Route path='/unauthorized' element={<UnAuthorized />} />
            </Route>
        </Routes >
    )
}

export default AppRouter

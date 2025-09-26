import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/authSlice'
import { Outlet } from 'react-router-dom'
import { api } from '../api/api'
function PersistLogin() {
    const [isLoading, setIsLoading] = useState(true)
    const { userData } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    console.log(userData);
    useEffect(() => {
        const verify = async () => {
            try {
                const res = await api.get('/users/current-user')
                if (res.data.data) dispatch(login(res.data.data));
                return res.data.data
            } catch (error) {
                console.error(error)
                return false
            } finally {
                setIsLoading(false)
            }
        }

        (async () => {
            if (!userData) {
                await verify()
            } else {
                setIsLoading(false)
            }
        })()
    }, [userData])

    return (
        <>
            {isLoading ? <div>Loading...</div> : <Outlet />}
        </>
    )
}

export default PersistLogin
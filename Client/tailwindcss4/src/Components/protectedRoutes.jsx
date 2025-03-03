import { Navigate, Outlet } from 'react-router-dom'

const protectedRoutes = (props) => {
  return (
    props.isAuthenticated ? <Outlet /> : <Navigate to ="/" />
  )
}

export default protectedRoutes
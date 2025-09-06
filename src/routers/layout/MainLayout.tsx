import { Outlet } from "react-router-dom"
import MainNavbar from "../../components/Navbar/MainNavbar"


const MainLayout = () => {
  return (
    <div className="bg-gray-100">
    <MainNavbar/>
    <Outlet />
</div>
  )
}

export default MainLayout;
﻿
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/Sidebar/AdminSidebar'
import AdminNavbar from '../../components/Navbar/AdminNavbar'

const AdminLayout = () => {
    return (
        <>
            <div className='flex flex-row bg-mono-100'>
                <div>
                    <AdminSidebar />
                </div>
                <div className='flex flex-col w-full min-h-screen'>
                    <AdminNavbar />
                    <div className='p-4'>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminLayout
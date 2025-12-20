import React from 'react'
import { useGetProfileQuery } from '../../../store/api/authApi'

const AdminProfile = (props) => {
    const {data:profiledata}=useGetProfileQuery();
    console.log(profiledata);
    return (
        <div>
            
        </div>
    )
}

export default AdminProfile

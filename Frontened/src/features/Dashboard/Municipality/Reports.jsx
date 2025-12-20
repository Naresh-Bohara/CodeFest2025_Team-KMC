import React from 'react'
import { useGetReportsQuery } from '../../../store/api/reportApi'

const Reports = (props) => {
    const {data:reports}=useGetReportsQuery();
    return (
        <div>
            
        </div>
    )
}

export default Reports

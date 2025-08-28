import React from 'react'
import api from '../../api/axios'

const Settings = () => {
    const handleSum = async () => {
      const res = await api.post("/auth/logout")
        console.log(res)
    }
  return (
    <div>
      <button className='p-5 rounded bg-yellow-400' onClick={handleSum}>heya</button>
    </div>
  )
}

export default Settings

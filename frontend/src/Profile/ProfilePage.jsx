import React from 'react'
import ProfileSideBar from './ProfileSideBar'
import ProfileContent from './ProfileContent'

const ProfilePage = () => {
  return (
    <div>
      <div>
        <ProfileSideBar/>
      </div>
      <div>
        <ProfileContent/>
      </div>
    </div>
  )
}

export default ProfilePage

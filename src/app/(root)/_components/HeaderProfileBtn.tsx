"use client"
import { SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { User } from 'lucide-react'
import React from 'react'
// import LoginButton from './LoginButton

function HeaderProfileBtn() {
  return (
    <>
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Profile"
          labelIcon={<User className="size-4" />}
          href="/profile"
        />
      </UserButton.MenuItems>
    </UserButton>

    <SignedOut>
      <SignInButton mode='modal'/>
    </SignedOut>
  </>
  )
}

export default HeaderProfileBtn
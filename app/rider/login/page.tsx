'use client'
import { useEffect } from 'react'

export default function RiderLogin() {
  useEffect(() => { window.location.replace('/staff-login') }, [])
  return null
}
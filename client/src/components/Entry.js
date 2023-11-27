import { useCallback, useEffect, useState } from 'react'
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from 'react-router-dom'

const Entry = () => {
  const [email, setEmail] = useState('')
  const [room, setRoom] = useState('')
  const socket = useSocket()
  const navigate = useNavigate()
  const submitHandler = async e => {
    e.preventDefault()
    socket.emit('join room', { email, room })
  }
  const joinRoomHandler = useCallback(p => { navigate(`/${p.room}`) }, [navigate])
  useEffect(() => {
    socket.on('join room', joinRoomHandler)
    return () => socket.off('join room', joinRoomHandler)
  }, [joinRoomHandler, socket])
  return (
    <form onSubmit={submitHandler}>
      <input value={email} placeholder='Email' onChange={e => setEmail(e.target.value)} required />
      <input value={room} placeholder='Room' onChange={e => setRoom(e.target.value)} required />
      <button type='submit'>
        Join
      </button>
    </form>
  )
}

export default Entry
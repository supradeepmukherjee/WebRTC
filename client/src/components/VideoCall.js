import { useCallback, useEffect, useState } from "react"
import { useSocket } from "../context/SocketProvider"
import ReactPlayer from 'react-player'
import PeerService from "../PeerService.js"

const VideoCall = () => {
    const socket = useSocket()
    const [remoteId, setRemoteId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const userJoinedHandler = useCallback(p => setRemoteId(p.id), [])
    const callHandler = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        const offer = await PeerService.getOffer()
        socket.emit('call user', {
            to: remoteId,
            offer
        })
        setMyStream(stream)
    }
    const incomingCallHandler = useCallback(async ({ from, offer }) => {
        setRemoteId(from)
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        setMyStream(stream)
        const answer = await PeerService.getAnswer(offer)
        socket.emit('call accepted', {
            to: from,
            answer
        })
    }, [socket])
    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) PeerService.peer.addTrack(track, myStream)
    }, [myStream])
    const acceptCallHandler = useCallback(async p => {
        await PeerService.setLocalDescription(p.answer)
        sendStreams()
    }, [sendStreams])
    const negotiationNeededHandler = useCallback(async () => {
        const offer = await PeerService.getOffer()
        socket.emit('negotiation needed', {
            offer,
            to: remoteId
        })
    }, [remoteId, socket])
    const incomingNegotiationHandler = useCallback(async ({ from, offer }) => {
        const answer = await PeerService.getAnswer(offer)
        socket.emit('negotiation done', {
            to: from,
            answer
        })
    }, [socket])
    const negotiationFinalHandler = useCallback(async p => await PeerService.setLocalDescription(p.answer), [])
    useEffect(() => {
        socket.on('user joined', userJoinedHandler)
        socket.on('incoming call', incomingCallHandler)
        socket.on('call accepted', acceptCallHandler)
        socket.on('negotiation needed', incomingNegotiationHandler)
        socket.on('negotiation final', negotiationFinalHandler)
        return () => {
            socket.off('user joined', userJoinedHandler)
            socket.off('incoming call', incomingCallHandler)
            socket.off('call accepted', acceptCallHandler)
            socket.off('negotiation needed', incomingNegotiationHandler)
            socket.off('negotiation final', negotiationFinalHandler)
        }
    }, [acceptCallHandler, incomingCallHandler, incomingNegotiationHandler, negotiationFinalHandler, socket, userJoinedHandler])
    useEffect(() => {
        PeerService.peer.addEventListener('track', async e => {
            const remoteStream = e.streams
            setRemoteStream(remoteStream[0])
        })
    }, [])
    useEffect(() => {
        PeerService.peer.addEventListener('negotiationneeded', negotiationNeededHandler)
        return () => {
            PeerService.peer.removeEventListener('negotiationneeded', negotiationNeededHandler)
        }
    }, [negotiationNeededHandler])
    return (
        <>
            {remoteId ? 'Connected' : 'No one is online'}
            {remoteId &&
                <button onClick={callHandler}>
                    Call
                </button>}
            {myStream &&
                <>
                    My Stream
                    <button onClick={sendStreams}>
                        Send Stream
                    </button>
                    <ReactPlayer url={myStream} playing muted height={'234px'} width={'234px'} />
                </>}
            {remoteStream &&
                <>
                    Friend's Stream
                    <ReactPlayer url={remoteStream} playing muted height={'234px'} width={'234px'} />
                </>}
        </>
    )
}

export default VideoCall
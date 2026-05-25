import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [roomId, setRoomId] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(socketUrl, { autoConnect: false });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomFromQuery = params.get('room');
    if (roomFromQuery) {
      setRoomId(roomFromQuery);
    }
  }, [location.search]);

  const startCall = async () => {
    if (!roomId) {
      toast.error('Enter a room ID');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = socketRef.current;
      if (!socket) return;

      socket.connect();
      socket.emit('room:join', { roomId, userId: user?.id });

      socket.on('room:user-joined', () => {
        if (peerRef.current) return;
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peerRef.current = peer;

        peer.on('signal', (data) => {
          socket.emit('signal', { roomId, data });
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      });

      socket.on('signal', ({ data }) => {
        if (!peerRef.current) {
          const peer = new Peer({ initiator: false, trickle: false, stream });
          peerRef.current = peer;

          peer.on('signal', (signalData) => {
            socket.emit('signal', { roomId, data: signalData });
          });

          peer.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        }

        peerRef.current.signal(data);
      });

      socket.on('room:user-left', () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      setIsInCall(true);
    } catch (error) {
      toast.error('Unable to access camera or microphone');
    }
  };

  const endCall = () => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit('room:leave', { roomId, userId: user?.id });
      socket.removeAllListeners();
      socket.disconnect();
    }

    peerRef.current?.destroy();
    peerRef.current = null;

    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsInCall(false);
  };

  const toggleAudio = () => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach(track => {
      track.enabled = !isAudioEnabled;
    });
    setIsAudioEnabled(prev => !prev);
  };

  const toggleVideo = () => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach(track => {
      track.enabled = !isVideoEnabled;
    });
    setIsVideoEnabled(prev => !prev);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
        <p className="text-gray-600">Join a room to start a call</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Join Room</h2>
        </CardHeader>
        <CardBody className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <Input
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          {!isInCall ? (
            <Button leftIcon={<Video size={16} />} onClick={startCall}>
              Join Call
            </Button>
          ) : (
            <Button variant="outline" leftIcon={<PhoneOff size={16} />} onClick={endCall}>
              End Call
            </Button>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Your Video</h2>
          </CardHeader>
          <CardBody>
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full rounded-md bg-gray-900" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Remote Video</h2>
          </CardHeader>
          <CardBody>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-md bg-gray-900" />
          </CardBody>
        </Card>
      </div>

      {isInCall && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={toggleAudio} leftIcon={isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}>
            {isAudioEnabled ? 'Mute' : 'Unmute'}
          </Button>
          <Button variant="outline" onClick={toggleVideo} leftIcon={isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}>
            {isVideoEnabled ? 'Stop Video' : 'Start Video'}
          </Button>
        </div>
      )}
    </div>
  );
};

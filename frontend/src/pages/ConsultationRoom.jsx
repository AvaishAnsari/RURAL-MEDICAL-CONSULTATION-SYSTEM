import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Wifi, WifiOff } from 'lucide-react';
import { API_URL } from '../config';

const ConsultationRoom = () => {
  const { id: roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Waiting for other participant...');

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);  // Use ref for stream to avoid stale closure in cleanup

  useEffect(() => {
    if (!user) return;

    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    // Use a unique peer ID combining userId + roomId to avoid collisions on reconnect
    const peerId = `${user.id}-${roomId}`.replace(/[^a-zA-Z0-9]/g, '-');
    const peer = new Peer(peerId, {
      // Uses the default PeerJS cloud server
      debug: 0,
    });
    peerRef.current = peer;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        streamRef.current = mediaStream;
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream;
        }

        // Answer any incoming call
        peer.on('call', (call) => {
          call.answer(mediaStream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              setIsConnected(true);
              setConnectionStatus('Connected');
            }
          });
          call.on('close', () => {
            setIsConnected(false);
            setConnectionStatus('Call ended by the other participant.');
          });
        });

        // When other participant joins the room via socket, initiate call to them
        socket.on('user-connected', (remotePeerId) => {
          setConnectionStatus(`Connecting to participant...`);
          setTimeout(() => {
            const call = peer.call(remotePeerId, mediaStream);
            if (call) {
              call.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                  setIsConnected(true);
                  setConnectionStatus('Connected');
                }
              });
              call.on('close', () => {
                setIsConnected(false);
                setConnectionStatus('Call ended by the other participant.');
              });
            }
          }, 1000);
        });
      })
      .catch((err) => {
        console.error('Failed to get local stream', err);
        setConnectionStatus('Camera/microphone access denied. Please allow access and refresh.');
      });

    // Pass our peerId to the socket so other participants can call us
    socket.emit('join-room', roomId, peerId);

    socket.on('user-disconnected', () => {
      setIsConnected(false);
      setConnectionStatus('Other participant disconnected.');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup using refs to avoid stale closures
    return () => {
      socket.disconnect();
      peer.destroy();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [user, roomId]);

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    navigate(user.role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socketRef.current) {
      const msg = {
        sender: user.name,
        text: messageInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socketRef.current.emit('send-message', { roomId, message: msg });
      // Also show own message immediately locally
      setMessages((prev) => [...prev, msg]);
      setMessageInput('');
    }
  };

  return (
    <div className="h-[80vh] grid md:grid-cols-3 gap-4">
      {/* Video area */}
      <div className="md:col-span-2 flex flex-col gap-4">
        <div className="flex-grow glass-card overflow-hidden relative bg-black rounded-2xl">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black"
          />

          {/* Connection status overlay when not connected */}
          {!isConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <WifiOff className="w-12 h-12 text-textMuted mb-3" />
              <p className="text-textMuted text-center px-4">{connectionStatus}</p>
            </div>
          )}

          {/* Connected badge */}
          {isConnected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-400 text-xs px-3 py-1 rounded-full">
              <Wifi className="w-3 h-3" /> Live
            </div>
          )}

          {/* My video (PiP) */}
          <div className="absolute bottom-4 right-4 w-32 h-48 md:w-48 md:h-36 rounded-xl overflow-hidden border-2 border-primary shadow-neon">
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-black"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card p-4 flex justify-center gap-4">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          <button
            onClick={toggleVideo}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            {isVideoOff ? <VideoOff /> : <Video />}
          </button>
          <button
            onClick={endCall}
            title="End call"
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <PhoneOff />
          </button>
        </div>
      </div>

      {/* Chat panel */}
      <div className="glass-card flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-white/10 font-bold text-lg">Chat</div>
        <div className="flex-grow p-4 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-textMuted text-sm text-center mt-4">No messages yet. Say hello!</p>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === user.name ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-textMuted mb-1">{msg.sender} · {msg.time}</span>
              <div className={`px-4 py-2 rounded-xl max-w-[85%] text-sm break-words ${msg.sender === user.name ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2">
          <input
            type="text"
            className="input-field flex-grow text-sm"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-primary text-black p-2 rounded-lg hover:bg-primary/80 transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationRoom;

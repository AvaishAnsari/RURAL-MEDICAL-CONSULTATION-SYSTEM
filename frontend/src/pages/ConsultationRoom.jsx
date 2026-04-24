import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send } from 'lucide-react';

const ConsultationRoom = () => {
  const { id: roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Let's use default peerjs cloud server for simplicity
    const cloudPeer = new Peer(user.id);
    setPeer(cloudPeer);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream;
        }

        cloudPeer.on('call', (call) => {
          call.answer(mediaStream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });

        newSocket.on('user-connected', (userId) => {
          // Wait a bit to ensure peer is ready on the other side
          setTimeout(() => {
            const call = cloudPeer.call(userId, mediaStream);
            if (call) {
              call.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                }
              });
            }
          }, 1000);
        });

      })
      .catch((err) => console.error("Failed to get local stream", err));

    newSocket.emit('join-room', roomId, user.id);

    newSocket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
      cloudPeer.destroy();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [user, roomId]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
      setIsMuted(!stream.getAudioTracks()[0].enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
      setIsVideoOff(!stream.getVideoTracks()[0].enabled);
    }
  };

  const endCall = () => {
    navigate(user.role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socket) {
      const msg = {
        sender: user.name,
        text: messageInput,
        time: new Date().toLocaleTimeString()
      };
      socket.emit('send-message', { roomId, message: msg });
      setMessageInput('');
    }
  };

  return (
    <div className="h-[80vh] grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 flex flex-col gap-4">
        <div className="flex-grow glass-card overflow-hidden relative">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover bg-black"
          />
          <div className="absolute bottom-4 right-4 w-32 h-48 md:w-48 md:h-64 rounded-xl overflow-hidden border-2 border-primary shadow-neon">
            <video 
              ref={myVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover bg-black"
            />
          </div>
        </div>
        
        <div className="glass-card p-4 flex justify-center gap-4">
          <button 
            onClick={toggleMute} 
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-surface hover:bg-surfaceHover text-white'}`}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          <button 
            onClick={toggleVideo} 
            className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-surface hover:bg-surfaceHover text-white'}`}
          >
            {isVideoOff ? <VideoOff /> : <Video />}
          </button>
          <button 
            onClick={endCall} 
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff />
          </button>
        </div>
      </div>

      <div className="glass-card flex flex-col h-full">
        <div className="p-4 border-b border-white/10 font-bold text-lg">Chat</div>
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === user.name ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-textMuted mb-1">{msg.sender} • {msg.time}</span>
              <div className={`px-4 py-2 rounded-lg max-w-[80%] ${msg.sender === user.name ? 'bg-primary text-black' : 'bg-white/10'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2">
          <input 
            type="text" 
            className="input-field flex-grow" 
            placeholder="Type a message..." 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button type="submit" className="neon-button px-4 py-2 rounded-lg bg-primary text-black hover:bg-primary/80" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationRoom;

import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { getLiveKitTokenApi } from '../../services/api';
import { useClinic } from '../../context/ClinicContext';
import { Phone, PhoneOff, Mic, MicOff, Sparkles, X, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import gsap from 'gsap';

export const VoiceAssistantModal = () => {
  const { isVoiceAssistantOpen, setIsVoiceAssistantOpen } = useClinic();
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [roomName, setRoomName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const glowRef = useRef(null);

  // GSAP Entrance & Exit Animations
  useEffect(() => {
    if (isVoiceAssistantOpen) {
      // Reset errors & state
      setErrorMsg('');
      
      // Backdrop fade in
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      // Modal scale up & slide in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)', delay: 0.05 }
      );

      // Continuous ambient glow rotation
      gsap.to(glowRef.current, {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: 'none',
      });
    }
  }, [isVoiceAssistantOpen]);

  // Initiate Call - Fetch JWT Token from FastAPI backend
  const handleStartCall = async () => {
    setIsConnecting(true);
    setErrorMsg('');

    try {
      // Unique room & participant identity (no hardcoded names)
      const uniqueRoom = `clinic-room-${Math.random().toString(36).substring(2, 9)}`;
      const uniqueParticipant = `patient-${Math.random().toString(36).substring(2, 9)}`;

      const data = await getLiveKitTokenApi(uniqueRoom, uniqueParticipant);

      if (!data?.token || !data?.url) {
        throw new Error('Invalid token response from backend');
      }

      setToken(data.token);
      setServerUrl(data.url);
      setRoomName(data.room_name || uniqueRoom);
      setParticipantName(data.participant_name || uniqueParticipant);
      setIsJoined(true);
    } catch (err) {
      console.error('Error connecting to Voice Assistant:', err);
      setErrorMsg(err.message || 'Unable to connect to Voice Assistant backend server.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Close Modal & End Call
  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setIsJoined(false);
        setToken('');
        setServerUrl('');
        setIsVoiceAssistantOpen(false);
      },
    });
  };

  if (!isVoiceAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Blurred Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      {/* Main Glassmorphic Modal Window */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-slate-900/95 text-white rounded-3xl border border-slate-700/60 shadow-2xl shadow-teal-500/10 overflow-hidden z-10 p-6 sm:p-8"
      >
        {/* Ambient Gradient Glow Background Effect */}
        <div
          ref={glowRef}
          className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-500/20 via-emerald-500/20 to-cyan-500/0 rounded-full blur-3xl pointer-events-none"
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Zunair <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">AI Receptionist</span>
            </h3>
            <p className="text-xs text-slate-400">Mid City Hospital Live Voice Assistant</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Connection Error</p>
              <p className="text-rose-300/90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* LiveKit Active Call Room Context */}
        {isJoined && token && serverUrl ? (
          <LiveKitRoom
            serverUrl={serverUrl}
            token={token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={() => {
              setIsJoined(false);
              setToken('');
            }}
            className="flex flex-col items-center"
          >
            <RoomAudioRenderer />
            <ActiveVoiceSessionContent onEndCall={handleClose} roomName={roomName} participantName={participantName} />
          </LiveKitRoom>
        ) : (
          /* Pre-Call Readiness Card */
          <div className="flex flex-col items-center text-center py-6">
            {/* Pulsing Avatar Container */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 p-1 shadow-xl shadow-teal-500/20">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <Volume2 className="w-10 h-10 text-teal-400" />
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-white mb-2">
              Ready to speak with Zunair?
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mb-8 leading-relaxed">
              Ask about doctor schedules, lab test pricing, clinic hours, or hospital services in real-time.
            </p>

            {/* Start Call Action Button */}
            <button
              onClick={handleStartCall}
              disabled={isConnecting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to LiveKit Room...</span>
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 fill-slate-950" />
                  <span>Start Voice Call Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> WebRTC Encrypted
          </span>
          <span>FastAPI & LiveKit Cloud</span>
        </div>
      </div>
    </div>
  );
};

// Internal Sub-Component for Active LiveKit Voice Call Controls & Audio Visualizer
function ActiveVoiceSessionContent({ onEndCall, roomName, participantName }) {
  const { state, audioTrack } = useVoiceAssistant();
  const [isMuted, setIsMuted] = useState(false);
  const wavesRef = useRef(null);

  // GSAP dynamic wave bar animation when AI or User is speaking
  useEffect(() => {
    if (state === 'speaking' || state === 'listening') {
      gsap.to(wavesRef.current, {
        scaleY: 1.2,
        duration: 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    } else {
      gsap.to(wavesRef.current, { scaleY: 1, duration: 0.3 });
    }
  }, [state]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full flex flex-col items-center py-4">
      {/* Connection Info Tag */}
      <div className="mb-4 text-[11px] px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Connected to <strong>{roomName}</strong> as <strong>{participantName}</strong></span>
      </div>

      {/* Voice Assistant Live Status Indicator */}
      <div className="mb-6 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
            state === 'speaking'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : state === 'listening'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : state === 'thinking'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {state === 'speaking' ? '🗣️ Zunair Speaking...' : state === 'listening' ? '🎙️ Listening to you...' : state === 'thinking' ? '🤔 Processing request...' : 'Active Call'}
        </span>
      </div>

      {/* Audio Wave Visualizer */}
      <div ref={wavesRef} className="w-full h-24 mb-8 bg-slate-950/60 rounded-2xl border border-slate-800 p-4 flex items-center justify-center">
        <BarVisualizer state={state} trackRef={audioTrack} barCount={7} className="w-full h-full text-teal-400" />
      </div>

      {/* Call Action Controls (Mute & End Call) */}
      <div className="flex items-center space-x-6">
        {/* Mic Toggle Button */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-2xl border transition-all ${
            isMuted
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-teal-400" />}
        </button>

        {/* End Call Red Button */}
        <button
          onClick={onEndCall}
          className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

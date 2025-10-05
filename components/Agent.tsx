"use client";

import {useState} from "react";
import Image from "next/image";
import {Phone, PhoneOff} from "lucide-react";

// Call status enum
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface AgentProps {
  userId: string;
  userName: string;
  type: "generate" | "practice";
}

export default function Agent({userName}: AgentProps) {
  // State management
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  // Get last message for display
  const lastMessage = messages[messages.length - 1];

  // Call state checks
  const isCallActive = callStatus === CallStatus.ACTIVE;
  const isConnecting = callStatus === CallStatus.CONNECTING;
  const isInactive = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  // Handle call toggle
  const handleCallToggle = () => {
    if (isCallActive) {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
    } else {
      setCallStatus(CallStatus.CONNECTING);

      setTimeout(() => {
        setCallStatus(CallStatus.ACTIVE);
        setIsSpeaking(true);
        setMessages(["Hello! I'm your AI interviewer. Let's get started."]);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Call View */}
      <div className="call-view">
        {/* AI Interviewer */}
        <div className="card-interview">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak"/>}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt={userName}
              width={120}
              height={120}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="transition-opacity duration-500 animate-fadeIn opacity-100">
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call Button */}
      <div className="w-full flex justify-center">
        {!isCallActive ? (
          <button
            onClick={handleCallToggle}
            disabled={isConnecting}
            className="btn-call flex items-center gap-2 cursor-pointer"
          >
            <Phone className="size-5"/>
            {isInactive ? "Start Call" : "Connecting..."}
          </button>
        ) : (
          <button
            onClick={handleCallToggle}
            className="btn-disconnect flex items-center gap-2 cursor-pointer"
          >
            <PhoneOff className="size-5"/>
            End Call
          </button>
        )}
      </div>
    </div>
  );
}
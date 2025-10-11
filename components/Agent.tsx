"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import vapi from "@/lib/vapi.sdk";

// Call status enum
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

// Message interface
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export default function Agent({
                                userName,
                                userId,
                                interviewId,
                                type,
                                questions
                              }: AgentProps) {
  const router = useRouter();

  // State
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  // Computed values
  const lastMessage = messages[messages.length - 1]?.content || "";
  const isCallActive = callStatus === CallStatus.ACTIVE;
  const isConnecting = callStatus === CallStatus.CONNECTING;
  const isInactive =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  // Setup VAPI event listeners
  useEffect(() => {
    // Call started
    const handleCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      toast.success("Call connected!");
    };

    // Call ended
    const handleCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      toast.info("Call ended");
    };

    // Message received - save final transcripts
    const handleMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript }
        ]);
      }
    };

    // Speech events
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    // Error handling
    const handleError = (error: Error) => {
      console.error("VAPI error:", error);
      toast.error("Call error occurred");
      setCallStatus(CallStatus.INACTIVE);
    };

    // Register listeners
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("error", handleError);

    // Cleanup
    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    console.log("Generate feedback here!");

    // TODO: Replace mock implementation with real server action (for feedback generation)
    const { success, id } = { success: true, id: "feedback-id" };

    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      console.error("Error generating feedback!");
      router.push("/");
    }
  };

  // Redirect to home when call finishes
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      setTimeout(() => router.push("/"), 1000);
    }
  }, [callStatus, router]);

  // Start workflow call
  const handleCallStart = async () => {
    // Handle interview type separately
    if (type === "interview") {
      // Format questions list for the AI interviewer prompt
      const formattedQuestions =
        questions?.map((q) => `- ${q}`).join("\n") || "";

      // TODO: Integrate formattedQuestions into the AI workflow variables
      // e.g., pass to vapi.start() or custom interview setup in future iteration
      console.log("Interview setup in progress:", formattedQuestions);

      return; // Prevent default workflow execution for now
    }

    setCallStatus(CallStatus.CONNECTING);
    const loadingToast = toast.loading("Connecting...");

    try {
      // Get workflow ID
      const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;

      if (!workflowId) {
        throw new Error("VAPI Workflow ID not configured");
      }

      // Start VAPI workflow
      await vapi.start(null, null, null, workflowId, {
        variableValues: {
          username: userName,
          userid: userId
        }
      });

      toast.dismiss(loadingToast);
      toast.success("Workflow started successfully!");
      setCallStatus(CallStatus.ACTIVE);
    } catch (error) {
      console.error("Workflow start failed:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to start workflow");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  // End call
  const handleCallEnd = () => {
    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
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
            {isSpeaking && <span className="animate-speak" />}
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

      {/* Call Controls */}
      <div className="w-full flex justify-center">
        {!isCallActive ? (
          <button
            onClick={handleCallStart}
            disabled={isConnecting}
            className="btn-call flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone className="size-5" />
            {isInactive ? "Start Call" : "Connecting..."}
          </button>
        ) : (
          <button
            onClick={handleCallEnd}
            className="btn-disconnect flex items-center gap-2 cursor-pointer"
          >
            <PhoneOff className="size-5" />
            End Call
          </button>
        )}
      </div>
    </div>
  );
}

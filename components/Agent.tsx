"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import vapi from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";
import { interviewer } from "@/constants";

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
  questions,
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
          { role: message.role, content: message.transcript },
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

  // Generate feedback after interview
  const handleGenerateFeedback = async (transcript: SavedMessage[]) => {
    try {
      toast.loading("Generating feedback...");

      const { success, feedbackId } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript,
      });

      if (success && feedbackId) {
        toast.success("Feedback generated successfully!");
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        throw new Error("Failed to generate feedback");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback");
      router.push("/");
    }
  };

  // Handle call finish based on type
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      // Generate feedback for interview type
      if (type === "interview" && messages.length > 0) {
        handleGenerateFeedback(messages);
      } else {
        // Redirect to home for other types
        setTimeout(() => router.push("/"), 1000);
      }
    }
  }, [callStatus, messages, type]);

  // Start call
  const handleCallStart = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const loadingToast = toast.loading("Connecting...");

    try {
      // Handle interview type
      if (type === "interview") {
        // Format questions for AI interviewer
        const formattedQuestions =
          questions?.map((q) => `- ${q}`).join("\n") || "";

        // Start interview with questions
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      } else if (type === "generate") {
        // Handle generate workflow type
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;

        if (!workflowId) {
          throw new Error("VAPI Workflow ID not configured");
        }

        // Start workflow for generation
        await vapi.start(null, null, null, workflowId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        throw new Error("Unsupported call type");
      }

      toast.dismiss(loadingToast);
      toast.success("Call started successfully!");
      setCallStatus(CallStatus.ACTIVE);
    } catch (error) {
      console.error("Call start failed:", error);
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : "Failed to start call",
      );
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

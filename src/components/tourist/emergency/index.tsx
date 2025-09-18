"use client";

import React, { useState } from "react";
import { AlertTriangle, Phone, Mail, Clock } from "lucide-react";

interface EmergencyButtonProps {
  emergencyContacts?: string[];
  userInfo?: {
    name?: string;
    location?: string;
    phone?: string;
  };
  apiEndpoint?: string;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  emergencyContacts = [
    "121423408006@josephscollege.ac.in",
    "121423408008@josephscollege.ac.in",
    "121423408057@josephscollege.ac.in",
    "piyushjain31456@gmail.com",
  ],
  userInfo = {
    name: "Piyush Jain",
    location: "St Joseph's Degree and PG College",
    phone: "+1-555-0123",
  },
  apiEndpoint = "/api/emergency",
}) => {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleEmergencyActivation = async () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          sendEmergencyAlert();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const sendEmergencyAlert = async () => {
    setIsLoading(true);
    setIsActivated(true);

    try {
      const emergencyData = {
        timestamp: new Date().toISOString(),
        userInfo,
        emergencyContacts,
        location: userInfo.location,
        severity: "HIGH",
        message: `EMERGENCY ALERT: ${userInfo.name} has activated the emergency button at ${userInfo.location}. Immediate assistance required.`,
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emergencyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStatus("success");

      setTimeout(() => {
        setIsActivated(false);
        setStatus("idle");
      }, 10000);
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
      setStatus("error");

      setTimeout(() => {
        setIsActivated(false);
        setStatus("idle");
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCountdown = () => setCountdown(null);
  const resetButton = () => {
    setIsActivated(false);
    setStatus("idle");
    setCountdown(null);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Emergency Alert System
        </h2>
        <p className="text-gray-300 text-sm">
          Press and hold for emergency assistance
        </p>
      </div>

      {/* Emergency Button */}
      <div className="relative">
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-yellow-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold animate-pulse shadow-lg shadow-yellow-600/50">
              {countdown}
            </div>
          </div>
        )}

        <button
          onClick={
            countdown === null ? handleEmergencyActivation : cancelCountdown
          }
          disabled={isActivated && status !== "error"}
          className={`
            relative w-32 h-32 rounded-full font-bold text-white text-lg
            transition-all duration-200 transform active:scale-95
            focus:outline-none focus:ring-4 focus:ring-red-400/50
            shadow-lg shadow-red-500/25
            ${
              countdown !== null
                ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/25"
                : isActivated
                ? status === "success"
                  ? "bg-green-500 shadow-green-500/25"
                  : status === "error"
                  ? "bg-red-800 shadow-red-800/25"
                  : "bg-red-600 animate-pulse shadow-red-600/50"
                : "bg-red-500 hover:bg-red-600"
            }
            ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className="flex flex-col items-center">
            {countdown !== null ? (
              <>
                <AlertTriangle size={32} />
                <span className="text-sm mt-1">CANCEL</span>
              </>
            ) : isActivated ? (
              status === "success" ? (
                <>
                  <Mail size={32} />
                  <span className="text-sm mt-1">SENT</span>
                </>
              ) : status === "error" ? (
                <>
                  <AlertTriangle size={32} />
                  <span className="text-sm mt-1">ERROR</span>
                </>
              ) : (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="text-sm mt-1">SENDING</span>
                </>
              )
            ) : (
              <>
                <Phone size={32} />
                <span className="text-sm mt-1">EMERGENCY</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Status Messages */}
      {status === "success" && (
        <div className="text-center p-4 bg-green-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <Mail size={20} />
            <span className="font-semibold">
              Emergency alert sent successfully!
            </span>
          </div>
          <p className="text-green-300 text-sm mt-2">
            Help is on the way. Emergency contacts have been notified.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center p-4 bg-red-100 rounded-lg border border-red-300">
          <div className="flex items-center justify-center space-x-2 text-red-700">
            <AlertTriangle size={20} />
            <span className="font-semibold">Failed to send alert</span>
          </div>
          <p className="text-red-600 text-sm mt-2">
            Please try again or contact emergency services directly.
          </p>
          <button
            onClick={resetButton}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="text-center p-4 bg-orange-100 rounded-lg border border-orange-300">
          <div className="flex items-center justify-center space-x-2 text-orange-700">
            <Clock size={20} />
            <span className="font-semibold">
              Emergency activation in {countdown}...
            </span>
          </div>
          <p className="text-orange-600 text-sm mt-2">
            Click the button again to cancel
          </p>
        </div>
      )}

      {/* Emergency Info */}
      <div className="w-full text-center text-xs text-gray-500 border-t pt-4">
        <p>
          <strong>User:</strong> {userInfo.name}
        </p>
        <p>
          <strong>Location:</strong> {userInfo.location}
        </p>
        <p>
          <strong>Contacts:</strong> {emergencyContacts.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default EmergencyButton;

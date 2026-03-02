"use client";

import { RETURNING_USER_EMAIL } from "@/lib/config";
import Tooltip from "@/components/tooltip";

interface UserTypeSelectorProps {
  userType: "returning" | "new";
  onUserTypeChange: (userType: "returning" | "new", email: string) => void;
}

function getSecureRandomString(length: number): string {
  const bytes = new Uint8Array(length);
  // Use the Web Crypto API for cryptographically secure randomness
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export default function UserTypeSelector({ userType, onUserTypeChange }: UserTypeSelectorProps) {
  const handleUserTypeChange = (newUserType: "returning" | "new") => {
    if (userType !== newUserType) {
      if (newUserType === "new") {
        const randomPart = getSecureRandomString(8);
        const email = `demos+onramp-new-user-${randomPart}@crossmint.com`;
        onUserTypeChange(newUserType, email);
      } else {
        onUserTypeChange(newUserType, RETURNING_USER_EMAIL);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 mb-4">
      <Tooltip content="Preview the flow for users who have already completed KYC" className="flex-1">
        <button
          type="button"
          className={`w-full px-4 py-2 rounded-lg text-sm text-center ${
            userType === "returning" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => handleUserTypeChange("returning")}
        >
          Returning user
        </button>
      </Tooltip>
      <Tooltip content="Preview the KYC flow for first-time users" className="flex-1">
        <button
          type="button"
          className={`w-full px-4 py-2 rounded-lg text-sm text-center ${
            userType === "new" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => handleUserTypeChange("new")}
        >
          New user (KYC)
        </button>
      </Tooltip>
    </div>
  );
}

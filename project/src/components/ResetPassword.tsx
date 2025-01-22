import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = location.hash.substring(1); // Remove the '#' at the start of the fragment
    const params = new URLSearchParams(hash); // Parse the fragment as query-like parameters
    const accessToken = params.get("access_token"); // Get the access_token

    if (!accessToken) {
      setError("Invalid reset link. Please request a new password reset email.");
      setLoading(false);
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken })
      .then(({ error }) => {
        if (error) {
          console.error("Error setting session:", error);
          setError("Invalid or expired session. Please request a new reset link.");
        }
      })
      .catch((err) => {
        console.error("Error setting session:", err);
        setError("Failed to authenticate. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [location.hash]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Set New Password</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">Password reset successful! Redirecting...</p>}
        {!success && (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handleResetPassword} className="w-full">
              Reset Password
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
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

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const accessToken = query.get("access_token");

    if (accessToken) {
      supabase.auth.setSession({ access_token: accessToken })
        .then(({ error }) => {
          if (error) {
            setError("Invalid or expired session. Please try again.");
          }
        })
        .catch((err) => setError("Failed to authenticate. Please try again."));
    } else {
      setError("Auth session missing!");
    }
  }, [location.search]);

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
      setTimeout(() => navigate("/login"), 2000); // Redirect after success
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    }
  };

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
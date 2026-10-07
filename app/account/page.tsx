"use client";
import { useState } from "react";
import { useAuth } from "@/components/providers";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(""); setProfileSuccess(false);
    setProfileLoading(true);
    try {
      await usersApi.updateMe({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone || undefined });
      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Passwords do not match."); return; }
    setPwError(""); setPwSuccess(false);
    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Password change failed.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-mute">Profile</h2>
        {profileError && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</p>}
        {profileSuccess && <p className="mb-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Profile updated.</p>}
        <form onSubmit={saveProfile} className="flex flex-col gap-5 max-w-sm">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" id="firstName" required value={profileForm.firstName} onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
            <Input label="Last Name" id="lastName" required value={profileForm.lastName} onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))} />
          </div>
          <Input label="Phone" id="phone" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Email" id="email" type="email" value={user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
          <Button type="submit" loading={profileLoading}>Save Changes</Button>
        </form>
      </section>

      <section>
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-mute">Change Password</h2>
        {pwError && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwError}</p>}
        {pwSuccess && <p className="mb-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Password changed.</p>}
        <form onSubmit={changePassword} className="flex flex-col gap-5 max-w-sm">
          <Input label="Current Password" id="currentPassword" type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
          <Input label="New Password" id="newPassword" type="password" required value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
          <Input label="Confirm New Password" id="confirmPassword" type="password" required value={pwForm.confirmPassword} onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
          <Button type="submit" loading={pwLoading}>Change Password</Button>
        </form>
      </section>
    </div>
  );
}

"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

interface UserProfile {
  clerkId: string;
  name?: string;
  email?: string;
  avatar?: string;
  xp?: number;
  badges?: string[];
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
}

export function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      toast.success("Profile updated");
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ai-mentor");
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || "demo"}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setProfile((prev) => (prev ? { ...prev, avatar: data.secure_url } : prev));
        toast.success("Avatar updated");
      }
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  if (!profile) {
    return <p className="text-muted-foreground">Loading profile...</p>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">AI</div>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
                <UploadCloud className="h-4 w-4" /> Upload Avatar
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="grid flex-1 gap-4">
              <Input
                placeholder="Name"
                value={profile.name || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              />
              <Input placeholder="Email" value={profile.email || ""} readOnly disabled />
              <Textarea
                placeholder="Badges"
                value={(profile.badges || []).join(", ")}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, badges: e.target.value.split(",").map((item) => item.trim()) } : prev))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-sm font-semibold text-primary">XP Progress</p>
              <p className="text-3xl font-bold text-primary">{profile.xp || 0} XP</p>
            </div>
            <div className="flex-1 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
              <p className="text-sm font-semibold text-secondary-foreground">Theme</p>
              <Input
                value={profile.preferences?.theme || "system"}
                onChange={(e) => setProfile((prev) =>
                  prev ? { ...prev, preferences: { ...prev.preferences, theme: e.target.value } } : prev
                )}
              />
            </div>
            <div className="flex-1 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-emerald-200">Notifications</p>
              <Button
                variant="outline"
                onClick={() =>
                  setProfile((prev) =>
                    prev
                      ? { ...prev, preferences: { ...prev.preferences, notifications: !prev.preferences?.notifications } }
                      : prev
                  )
                }
              >
                {profile.preferences?.notifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={updateProfile} disabled={loading}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

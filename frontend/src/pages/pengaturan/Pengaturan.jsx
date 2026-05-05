import React, { useEffect, useState } from "react";
import KartuProfil from "./KartuProfil";
import FormAkun from "./FormAkun";
import PreferensiAkun from "./PreferensiAkun";
import "./Pengaturan.css";

const API_BASE = "http://localhost:5000";

const Pengaturan = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profilePreview, setProfilePreview] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("Belajar flowchart, algoritma, dan logika pemrograman.");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notif, setNotif] = useState(false);
  const [sound, setSound] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/user/settings?userId=${userId}`);
        const data = await res.json();

        setName(data?.name || user?.nama || "");
        setUsername(data?.username || user?.username || "");
        setEmail(data?.email || user?.email || "");
        setBio(data?.bio || user?.bio || "Belajar flowchart, algoritma, dan logika pemrograman.");
        setProfilePreview(data?.profile_url || user?.profile_url || "");
        setCoverPreview(data?.cover_url || user?.cover_url || "");
        setNotif(data?.notif === 1 || data?.notif === true);
        setSound(data?.sound === 1 || data?.sound === true);
        setPrivateProfile(data?.private_profile === 1 || data?.private_profile === true);
      } catch (err) {
        console.error("Gagal fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchSettings();
  }, [userId]);

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi password belum sama.");
      return;
    }

    try {
      setSaving(true);

      await fetch(`${API_BASE}/api/user/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          username,
          email,
          bio,
          notif: notif ? 1 : 0,
          sound: sound ? 1 : 0,
          private_profile: privateProfile ? 1 : 0,
        }),
      });

      if (newPassword) {
        await fetch(`${API_BASE}/api/user/change-password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, oldPassword, newPassword }),
        });
      }

      if (profileFile) {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("profile", profileFile);
        await fetch(`${API_BASE}/api/user/profile-photo`, { method: "PUT", body: formData });
      }

      if (coverFile) {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("cover", coverFile);
        await fetch(`${API_BASE}/api/user/cover-photo`, { method: "PUT", body: formData }).catch(() => {
          console.warn("Endpoint cover-photo belum tersedia, preview tetap ditampilkan.");
        });
      }

      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, nama: name, username, email, bio, profile_url: profilePreview, cover_url: coverPreview })
      );

      alert("Pengaturan berhasil disimpan ✨");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Gagal save settings:", err);
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="pengaturan-loader">
        <div className="pengaturan-spinner"></div>
        <p>Menyiapkan pusat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="pengaturan-page">
      <div className="pengaturan-grid"></div>
      <div className="pengaturan-glow pengaturan-glow-blue"></div>
      <div className="pengaturan-glow pengaturan-glow-soft"></div>

      <main className="pengaturan-container">
        <KartuProfil
          name={name}
          username={username}
          email={email}
          bio={bio}
          profilePreview={profilePreview}
          coverPreview={coverPreview}
          onProfileChange={handleProfileChange}
          onCoverChange={handleCoverChange}
        />

        <section className="pengaturan-layout">
          <FormAkun
            name={name}
            setName={setName}
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            bio={bio}
            setBio={setBio}
            oldPassword={oldPassword}
            setOldPassword={setOldPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
          />

          <PreferensiAkun
            notif={notif}
            setNotif={setNotif}
            sound={sound}
            setSound={setSound}
            privateProfile={privateProfile}
            setPrivateProfile={setPrivateProfile}
            handleLogout={handleLogout}
          />
        </section>

        <div className="pengaturan-actions">
          <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
            {saving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN ✨"}
          </button>
          <button className="btn-outline" onClick={() => window.location.reload()}>BATALKAN</button>
        </div>
      </main>
    </div>
  );
};

export default Pengaturan;

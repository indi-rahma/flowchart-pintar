import React, { useEffect, useState } from "react";
import KomponenKartuProfil from "./KartuProfil";
import KomponenFormProfil from "./FormProfil";
import KomponenKeamananAkun from "./KeamananAkun";
import KomponenPreferensiBelajar from "./PreferensiBelajar";
import { styles, globalStyle } from "./stylePengaturan";
import { API_BASE } from "../config";

const Pengaturan = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profilePreview, setProfilePreview] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notif, setNotif] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/user/settings?userId=${userId}`
        );

        const data = await res.json();

        setName(data?.name || user?.nama || "");
        setUsername(data?.username || user?.username || "");
        setEmail(data?.email || user?.email || "");
        setProfilePreview(data?.profile_url || user?.profile_url || "");
        setNotif(data?.notif === 1 || data?.notif === true);
        setSound(data?.sound === 1 || data?.sound === true);
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
          notif: notif ? 1 : 0,
          sound: sound ? 1 : 0,
        }),
      });

      if (newPassword) {
        await fetch(`${API_BASE}/api/user/change-password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            oldPassword,
            newPassword,
          }),
        });
      }

      if (profileFile) {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("profile", profileFile);

        await fetch(`${API_BASE}/api/user/profile-photo`, {
          method: "PUT",
          body: formData,
        });
      }

      const updatedUser = {
        ...user,
        nama: name,
        username,
        email,
        profile_url: profilePreview,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

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
      <div style={styles.loader}>
        <style>{globalStyle}</style>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Menyiapkan pusat pengaturan...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <style>{globalStyle}</style>

      <div style={styles.gridLayer}></div>
      <div style={styles.scanLine}></div>
      <div style={styles.glowBlue}></div>
      <div style={styles.glowYellow}></div>
      <div style={styles.curvedBg}></div>

      <div style={styles.contentContainer}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            Pengaturan <span style={styles.goldText}>Akun</span> ⚙️
          </h2>
          <p style={styles.headerSub}>
            Atur profil, keamanan akun, dan preferensi belajarmu di sini.
          </p>
        </div>

        <div style={styles.mainGrid}>
          <KomponenKartuProfil
            name={name}
            email={email}
            profilePreview={profilePreview}
            handleProfileChange={handleProfileChange}
          />

          <KomponenFormProfil
            name={name}
            setName={setName}
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
          />

          <KomponenKeamananAkun
            oldPassword={oldPassword}
            setOldPassword={setOldPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
          />

          <KomponenPreferensiBelajar
            notif={notif}
            setNotif={setNotif}
            sound={sound}
            setSound={setSound}
          />
        </div>

        <div style={styles.buttonArea}>
          <button onClick={handleSaveProfile} disabled={saving} style={styles.btnSave}>
            {saving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN ✨"}
          </button>

          <button onClick={handleLogout} style={styles.btnLogout}>
            KELUAR AKUN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
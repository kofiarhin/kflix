import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getInitials = (fullName = "") => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const buildImageUrl = (profileImagePath) => {
  if (!profileImagePath) return "";

  if (/^https?:\/\//i.test(profileImagePath)) {
    return profileImagePath;
  }

  return `${API_URL}${profileImagePath}`;
};

const Profile = () => {
  const {
    user,
    updateProfile,
    uploadProfileImage,
    removeProfileImage,
  } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const savedImageUrl = useMemo(() => buildImageUrl(user?.profileImage), [user?.profileImage]);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setSelectedFile(null);
    setPreviewUrl("");
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const activeImageUrl = previewUrl || savedImageUrl;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await updateProfile({ fullName, email });

      if (selectedFile) {
        const formData = new FormData();
        formData.append("profileImage", selectedFile);
        await uploadProfileImage(formData);
      }

      setSelectedFile(null);
      setPreviewUrl("");
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setSelectedFile(null);
    setPreviewUrl("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl("");
      await removeProfileImage();
      setSuccessMessage("Profile image removed successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove profile image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="glass-panel mx-auto max-w-3xl rounded-[1.75rem] p-8 text-white">
      <p className="eyebrow mb-3">Profile</p>
      <h1 className="mb-8 text-4xl font-black tracking-tight">Account Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06]">
            {activeImageUrl ? (
              <img src={activeImageUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-slate-100">{getInitials(user?.fullName || "U")}</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-red-400 hover:text-red-400">
              Change Photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>

            <button
              type="button"
              className="secondary-action px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleRemoveImage}
              disabled={loading || (!user?.profileImage && !previewUrl)}
            >
              Remove Photo
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-200">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="field-control"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-control"
            disabled={loading}
            required
          />
        </div>

        {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}
        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="primary-action disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="secondary-action disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleReset}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </section>
  );
};

export default Profile;

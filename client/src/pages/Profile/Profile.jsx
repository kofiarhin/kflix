import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRecentlyViewed } from "../../context/RecentlyViewedContext";

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
  const { recentlyViewed } = useRecentlyViewed();
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
    <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">Account Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-slate-800">
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
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="w-full rounded-lg border border-white/20 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-red-400"
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
            className="w-full rounded-lg border border-white/20 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-red-400"
            disabled={loading}
            required
          />
        </div>

        {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}
        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleReset}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
      {recentlyViewed.length > 0 ? (
        <div className="mt-8 border-t border-white/10 pt-6">
          <h2 className="text-xl font-semibold">Recently Viewed</h2>
          <div className="mt-4 space-y-3">
            {recentlyViewed.slice(0, 4).map((item) => {
              const to = item.mediaType === "tv" ? `/series/${item.tmdbId}` : `/movies/${item.tmdbId}`;
              return (
                <Link
                  key={`${item.mediaType}-${item.tmdbId}`}
                  to={to}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-sm transition hover:border-red-500/40"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">
                    {item.mediaType === "tv" ? "Series" : "Movie"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Profile;

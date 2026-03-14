import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>
      <div className="space-y-4 text-slate-200">
        <p>
          <span className="font-semibold text-white">Full name:</span> {user?.fullName}
        </p>
        <p>
          <span className="font-semibold text-white">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-semibold text-white">User ID:</span> {user?._id}
        </p>
      </div>
    </section>
  );
};

export default Profile;

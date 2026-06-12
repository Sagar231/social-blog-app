export default function Avatar({ user, size = 40 }) {
  const initial = (user?.username || "?").charAt(0).toUpperCase();
  const src = user?.avatar_url || user?.avatar;
  if (src) {
    return (
      <img
        src={src}
        alt={user.username}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-full bg-brand-gradient font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}

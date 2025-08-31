import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const link = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl border text-sm ${isActive ? "bg-black text-white" : "hover:bg-black/5"}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <nav className="max-w-5xl mx-auto flex items-center justify-between p-3">
        <Link to="/" className="font-bold">Bolt Demo</Link>
        <div className="flex gap-2">
          {link("/", "Landing")}
          {link("/find-1v1", "Find 1v1 Match")}
        </div>
      </nav>
    </header>
  );
}
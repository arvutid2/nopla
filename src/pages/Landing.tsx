import Landing from "./pages/Landing";
export default function App() {
  return <Landing />;
}
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Play. Win. Repeat.</h1>
        <p className="opacity-80 mb-6">1v1 mängud. Kiire sobitamine. Turvaline payout loogika.</p>
        <div className="flex gap-3 justify-center">
          <a href="#choose" className="px-5 py-3 rounded-2xl border">Choose Your Battle</a>
          <Link to="/find-1v1" className="px-5 py-3 rounded-2xl border">Find 1v1 Match</Link>
        </div>
      </section>

      <section id="choose" className="py-12">
        <h2 className="text-2xl font-semibold mb-4">Choose Your Battle</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GameCard title="Rock-Paper-Scissors" to="/play/rps" />
          <GameCard title="Durak (stub)" to="/play/durak" />
        </div>
      </section>
    </main>
  );
}

function GameCard({ title, to }: { title: string; to: string }) {
  return (
    <Link to={to} className="block rounded-2xl border p-5 hover:shadow">
      <div className="text-lg font-semibold mb-2">{title}</div>
      <div className="text-sm opacity-70">Click to play</div>
    </Link>
  );
}

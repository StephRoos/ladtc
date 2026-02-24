export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-background-light border-b border-accent/10">
        <nav className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary-DEFAULT">LADTC</h1>
          <p className="text-foreground/70">Les Amis Du Trail des Collines</p>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome to LADTC</h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            A trail running club based in Ellezelles, Pays des Collines region, Belgium.
            Join our community of passionate trail runners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <h3 className="text-xl font-bold text-primary-DEFAULT mb-2">~70 Members</h3>
            <p className="text-foreground/70">Active trail runners in our community</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold text-accent-DEFAULT mb-2">Regular Training</h3>
            <p className="text-foreground/70">Wednesday and Sunday group sessions</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold text-primary-light mb-2">Races & Events</h3>
            <p className="text-foreground/70">Regional trail running events and camps</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-foreground/60 mb-6">
            Project setup in progress. Check back soon for full features including blog,
            events calendar, member management, and equipment orders.
          </p>
        </div>
      </section>

      <footer className="bg-background-light border-t border-accent/10 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-foreground/60">
          <p>&copy; 2026 LADTC - Les Amis Du Trail des Collines. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

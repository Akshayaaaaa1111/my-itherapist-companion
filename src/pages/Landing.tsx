import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "🧠",
    title: "Emotion-Aware",
    desc: "Detects your emotional state from every message and adapts its responses with clinical empathy.",
  },
  {
    icon: "💬",
    title: "3-Turn Deep Listening",
    desc: "Asks three thoughtful follow-up questions to truly understand your situation before offering support.",
  },
  {
    icon: "🔒",
    title: "Your Private Space",
    desc: "Your unique user ID keeps your history persistent and private — no account creation needed.",
  },
  {
    icon: "🌿",
    title: "Personalized Care",
    desc: "Integrates with health records to tailor advice to your specific mental health profile.",
  },
];

const testimonials = [
  {
    quote: "It actually listened before jumping to advice. That felt different.",
    name: "Priya M.",
    role: "Graduate student",
  },
  {
    quote: "The follow-up questions helped me understand what I was really feeling.",
    name: "Arjun T.",
    role: "Software engineer",
  },
  {
    quote: "Having a safe space at 2am when anxiety spikes makes a real difference.",
    name: "Leila F.",
    role: "Healthcare worker",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-serif text-xl text-primary font-normal tracking-tight">
            i<span className="italic">Therapist</span>
          </span>
          <Button
            onClick={() => navigate("/chat")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 h-9 text-sm font-medium transition-all active:scale-[0.97]"
          >
            Start Session
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 px-6 overflow-hidden">
        {/* Background image — text sits outside it */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="animate-fade-up inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-primary border border-primary/30 bg-secondary px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
            AI-powered mental health companion
          </p>
          <h1 className="animate-fade-up-delay-1 font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05] mb-6">
            A conversation that<br />
            <span className="italic text-primary">truly listens</span>
          </h1>
          <p className="animate-fade-up-delay-2 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            iTherapist asks three thoughtful follow-up questions before offering personalised mental health guidance — because understanding comes before advice.
          </p>
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/chat")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-base font-medium shadow-soft transition-all active:scale-[0.97] w-full sm:w-auto"
            >
              Begin your session
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary/30 text-primary hover:bg-secondary rounded-full px-8 h-12 text-base font-medium transition-all active:scale-[0.97] w-full sm:w-auto"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              How it works
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground text-center mb-3">Designed for real support</p>
          <h2 className="font-serif text-3xl md:text-4xl text-center text-foreground mb-14">
            What makes iTherapist different
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-chat-card transition-shadow duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-sans font-semibold text-foreground text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works step flow ── */}
      <section className="py-20 px-6 bg-secondary/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-foreground mb-14">
            Every session, step by step
          </h2>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-border -translate-x-1/2" aria-hidden="true" />
            <div className="grid md:grid-cols-1 gap-8">
              {[
                { step: "01", title: "Share what's on your mind", desc: "Type freely — a feeling, a situation, anything bothering you. No judgment, no login needed." },
                { step: "02", title: "iTherapist asks three questions", desc: "The AI asks clarifying follow-ups to understand context, severity, and what matters most to you." },
                { step: "03", title: "Receive personalised guidance", desc: "After listening deeply, iTherapist offers evidence-based support tailored to your unique profile and emotional state." },
              ].map((s, i) => (
                <div key={s.step} className={`flex gap-6 items-start ${i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""}`}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="font-serif text-primary text-sm font-normal">{s.step}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-sans font-semibold text-foreground mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-foreground mb-14">
            What people are saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl p-7 border border-border shadow-card">
                <p className="text-sm text-foreground/80 leading-relaxed italic mb-5">"{t.quote}"</p>
                <div>
                  <p className="font-medium text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-primary/8 rounded-3xl border border-primary/20 px-8 py-14"
               style={{ background: "hsl(172 32% 40% / 0.06)" }}>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Ready to be heard?
            </h2>
            <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto leading-relaxed">
              Start a session right now. No sign-up, no waiting — just a calm space to talk.
            </p>
            <Button
              onClick={() => navigate("/chat")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-12 text-base font-medium shadow-soft transition-all active:scale-[0.97]"
            >
              Start talking →
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-serif text-lg text-primary">i<span className="italic">Therapist</span></span>
          <p className="text-xs text-muted-foreground text-center">
            For informational support only. Not a substitute for professional mental health care.
          </p>
          <p className="text-xs text-muted-foreground">© 2025 iTherapist</p>
        </div>
      </footer>
    </div>
  );
}

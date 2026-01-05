import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Send,
  CheckCircle2,
  ArrowRight,
  Linkedin,
  BarChart3,
  PenLine,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description:
      "Generate viral LinkedIn posts in seconds with Justin Welsh-style formatting and hooks that grab attention.",
  },
  {
    icon: TrendingUp,
    title: "Trend Discovery",
    description: "Real-time trending topics powered by Perplexity AI. Never miss what's hot in your niche.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Schedule posts at optimal times. View your content calendar and plan weeks ahead.",
  },
  {
    icon: Send,
    title: "Direct Publishing",
    description: "Post directly to LinkedIn with one click. No switching between apps.",
  },
]

const stats = [
  { value: "10x", label: "faster content creation" },
  { value: "300%", label: "more engagement" },
  { value: "5hrs", label: "saved per week" },
  { value: "24/7", label: "AI assistance" },
]

const testimonials = [
  {
    quote: "LinkAgent transformed my LinkedIn presence. I went from 500 to 15,000 followers in 3 months.",
    author: "Sarah Chen",
    role: "Founder, TechStartup",
  },
  {
    quote: "The AI hooks are incredible. My posts consistently get 10x more impressions than before.",
    author: "Marcus Johnson",
    role: "Sales Director",
  },
  {
    quote: "Finally, a tool that understands LinkedIn. The trending topics feature is a game-changer.",
    author: "Emily Rodriguez",
    role: "Marketing Lead",
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["5 AI-generated posts/month", "Basic trend discovery", "Draft saving", "LinkedIn preview"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious content creators",
    features: [
      "Unlimited AI posts",
      "Advanced trend analysis",
      "Direct LinkedIn posting",
      "Smart scheduling",
      "AI image generation",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "/month",
    description: "For growing teams",
    features: [
      "Everything in Pro",
      "5 team members",
      "Collaborative drafts",
      "Analytics dashboard",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-40 left-[-7rem] h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-1/3 h-96 w-96 rounded-full bg-emerald-300/15 blur-3xl" />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400 text-sm font-bold text-primary-foreground shadow-sm">
              LA
            </div>
            <span className="text-lg font-semibold">LinkAgent</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Testimonials
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Log in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered LinkedIn Growth
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Create standout LinkedIn posts <span className="text-primary">in minutes</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                LinkAgent gives you trends, AI drafting, and scheduling in a single workspace. Ship more posts without
                the content grind.
              </p>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2 bg-primary text-base hover:bg-primary/90">
                    Start Creating Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="gap-2 bg-background/60 text-base">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <PenLine className="h-4 w-4" />
                    </span>
                    Weekly content board
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
                    Live preview
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-medium text-foreground">
                      "Your next LinkedIn post is already half written. Here is the hook..."
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">AI Draft</span>
                      <span>2 mins ago</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Scheduled</span>
                      <span>Thu, 9:00 AM</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Build a repeatable cadence with 3 posts per week.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-border/60 bg-background/70 p-3">
                      <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to dominate LinkedIn</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful AI tools designed for creators, founders, and professionals.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y border-border/70 bg-card/60 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From idea to viral post in 3 steps</h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="relative rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold">Discover Trends</h3>
              <p className="mt-2 text-muted-foreground">
                Browse AI-curated trending topics in your niche. Click any trend to start drafting.
              </p>
            </div>
            <div className="relative rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold">Generate & Edit</h3>
              <p className="mt-2 text-muted-foreground">
                AI writes your first draft in seconds. Customize tone, add hooks, and generate images.
              </p>
            </div>
            <div className="relative rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold">Schedule & Post</h3>
              <p className="mt-2 text-muted-foreground">
                Preview exactly how it looks on LinkedIn. Schedule for later or post instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by LinkedIn creators</h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
                <p className="text-muted-foreground">"{testimonial.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-border/70 bg-card/60 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border p-8 shadow-sm ${
                  plan.highlighted ? "border-primary bg-card" : "border-border/70 bg-card/80"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="mt-8 block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary to-sky-500 px-6 py-16 text-center shadow-sm sm:px-16 sm:py-24">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to grow your LinkedIn presence?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Join thousands of creators using LinkAgent to build their personal brand.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary" className="w-full gap-2 text-base sm:w-auto">
                  <Linkedin className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/70 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                LA
              </div>
              <span className="font-semibold">LinkAgent</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">(c) 2026 LinkAgent. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

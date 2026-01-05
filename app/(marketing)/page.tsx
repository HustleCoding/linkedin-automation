import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Calendar, Send, CheckCircle2, ArrowRight, Linkedin } from "lucide-react"

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              LA
            </div>
            <span className="text-lg font-semibold">LinkAgent</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
              Testimonials
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
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
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[128px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered LinkedIn Growth
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Create viral LinkedIn posts <span className="text-primary">in seconds</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400 text-balance sm:text-xl">
              Stop staring at blank screens. LinkAgent uses AI to generate engaging posts, discover trending topics, and
              schedule content—all in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full gap-2 bg-primary text-base hover:bg-primary/90 sm:w-auto">
                  Start Creating Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-zinc-700 text-base text-zinc-300 hover:bg-zinc-800 sm:w-auto bg-transparent"
                >
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 gap-4 border-y border-zinc-800 py-8 sm:grid-cols-4 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-zinc-100 sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to dominate LinkedIn</h2>
            <p className="mt-4 text-lg text-zinc-400">
              Powerful AI tools designed for creators, founders, and professionals.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y border-zinc-800 bg-zinc-900/30 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From idea to viral post in 3 steps</h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold">Discover Trends</h3>
              <p className="mt-2 text-zinc-400">
                Browse AI-curated trending topics in your niche. Click any trend to start drafting.
              </p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold">Generate & Edit</h3>
              <p className="mt-2 text-zinc-400">
                AI writes your first draft in seconds. Customize tone, add hooks, and generate images.
              </p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold">Schedule & Post</h3>
              <p className="mt-2 text-zinc-400">
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
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <p className="text-zinc-300">"{testimonial.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 font-semibold text-zinc-400">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-zinc-100">{testimonial.author}</div>
                    <div className="text-sm text-zinc-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-zinc-800 bg-zinc-900/30 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-zinc-400">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted ? "border-primary bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"
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
                  <span className="text-zinc-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
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
                        : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
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
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-16 sm:py-24">
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
      <footer className="border-t border-zinc-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                LA
              </div>
              <span className="font-semibold">LinkAgent</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="#" className="hover:text-zinc-300">
                Privacy
              </Link>
              <Link href="#" className="hover:text-zinc-300">
                Terms
              </Link>
              <Link href="#" className="hover:text-zinc-300">
                Contact
              </Link>
            </div>
            <div className="text-sm text-zinc-500">© 2026 LinkAgent. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

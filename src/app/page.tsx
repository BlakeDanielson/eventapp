import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Share2, Mail, BarChart3, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 opacity-50" />
      <div className="fixed inset-0 bg-dot-white/[0.2] bg-[size:40px_40px]" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl" />



      {/* Hero Section */}
      <main className="relative z-10">
        <div className="container mx-auto px-4 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm text-zinc-300">Trusted by 10,000+ event organizers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                Create events that
              </span>
              <br />
              <span className="text-white">people remember</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The modern event platform for creators. Build beautiful event pages, manage registrations, 
              and grow your community with tools that actually work.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg bg-white text-black hover:bg-zinc-200 font-semibold group">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-white/20 text-white hover:bg-white/5">
                  Watch demo
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-16 text-center">
              <p className="text-sm text-zinc-500 mb-4">Trusted by teams at</p>
              <div className="flex items-center justify-center space-x-8 opacity-50">
                <div className="h-8 w-20 bg-white/10 rounded" />
                <div className="h-8 w-24 bg-white/10 rounded" />
                <div className="h-8 w-16 bg-white/10 rounded" />
                <div className="h-8 w-20 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to run successful events
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              From intimate gatherings to large conferences, our platform scales with your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Beautiful Event Pages",
                description: "Create stunning event pages in minutes with our intuitive builder. No design skills required."
              },
              {
                icon: Users,
                title: "Smart Registration",
                description: "Streamlined registration with custom forms, automatic confirmations, and waitlist management."
              },
              {
                icon: Share2,
                title: "Viral Growth Tools",
                description: "Built-in referral tracking and social sharing to help your events grow organically."
              },
              {
                icon: Mail,
                title: "Email Automation",
                description: "Send beautiful confirmations, reminders, and follow-ups automatically."
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Track registrations, attendance, and engagement with comprehensive dashboards."
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-grade security with private events and granular access controls."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300">
                <feature.icon className="h-12 w-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 transform origin-top-left" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to create your first event?
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of creators who trust EventApp to bring their communities together.
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg bg-white text-black hover:bg-zinc-200 font-semibold">
                  Get started for free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}

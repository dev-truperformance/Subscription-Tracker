'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { useRouter } from 'next/navigation';
import { useAuthLoader } from '@/components/auth-loader-provider';

export default function Home() {
  const router = useRouter();
  const { showLoader } = useAuthLoader();

  const handleNavigation = (href: string, message: string = 'Loading...') => {
    showLoader(message);
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="Tru Subscription Tracker Logo"
              className="mx-auto h-24 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Track Your Subscriptions
            <span className="text-primary"> Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Take control of your monthly expenses. Monitor all your
            subscriptions in one place and never miss a payment again.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="px-8"
              onClick={() =>
                handleNavigation('/sign-up', 'Creating your account...')
              }
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8"
              onClick={() =>
                handleNavigation('/dashboard', 'Loading dashboard...')
              }
            >
              View Demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center bg-card border shadow-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle>Track Everything</CardTitle>
              <CardDescription>
                Monitor all your subscriptions from Netflix to Spotify in one
                dashboard
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center bg-card border shadow-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle>Save Money</CardTitle>
              <CardDescription>
                Identify unused subscriptions and cut costs with smart insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center bg-card border shadow-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <CardTitle>Never Miss</CardTitle>
              <CardDescription>
                Get timely reminders before your subscriptions renew
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center bg-card border rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold mb-6">
            Ready to take control of your subscriptions?
          </h2>
          <p className="text-lg mb-8 muted-foreground">
            Join thousands of users who are already saving money with our
            subscription tracker.
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              ✓ Free to start
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              ✓ No credit card required
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              ✓ Cancel anytime
            </Badge>
          </div>
          <Button
            size="lg"
            className="px-8"
            onClick={() => handleNavigation('/sign-up', 'Getting started...')}
          >
            Start Tracking Now
          </Button>
        </div>
      </div>
    </div>
  );
}

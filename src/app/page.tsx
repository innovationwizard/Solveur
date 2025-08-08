import Link from 'next/link'
import { ArrowRight, Check, Shield, Zap, Users, BarChart3, Globe, Lock, Bot } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Navigation */}
      <nav className="border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-primary-900 font-sora">Solveur</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin" 
                className="text-primary-600 hover:text-primary-900 px-3 py-2 text-sm font-medium font-sora"
              >
                Sign In
              </Link>
              <Link 
                href="/onboarding" 
                className="bg-accent-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-600 transition-all duration-200 font-sora shadow-soft hover:shadow-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-primary-900 mb-6 font-sora">
              Deploy AI Customer Support
              <span className="text-accent-500"> in 24 Hours</span>
            </h1>
            <p className="text-xl text-primary-600 mb-8 max-w-3xl mx-auto font-sora">
              Solveur transforms your business knowledge into intelligent AI agents that handle customer inquiries, 
              reduce support tickets, and scale your customer service instantly.
            </p>
            
            {/* Benefit Bullets */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8">
              <div className="flex items-center text-primary-600 font-sora">
                <Check className="w-5 h-5 text-success-500 mr-2" />
                <span>24/7 Customer Support</span>
              </div>
              <div className="flex items-center text-primary-600 font-sora">
                <Check className="w-5 h-5 text-success-500 mr-2" />
                <span>95% Response Accuracy</span>
              </div>
              <div className="flex items-center text-primary-600 font-sora">
                <Check className="w-5 h-5 text-success-500 mr-2" />
                <span>Enterprise Security</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/onboarding"
                className="bg-accent-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent-600 transition-all duration-200 flex items-center font-sora shadow-soft hover:shadow-accent"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                href="#demo"
                className="text-primary-600 hover:text-primary-900 px-8 py-4 rounded-lg text-lg font-semibold border border-primary-300 hover:border-primary-400 transition-all duration-200 font-sora"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-900 mb-4 font-sora">
              Enterprise-Grade AI Support
            </h2>
            <p className="text-xl text-primary-600 max-w-3xl mx-auto font-sora">
              Built for scale, security, and compliance. Trusted by Fortune 500 companies worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Scalability */}
            <div className="bg-primary-50 p-8 rounded-xl border border-primary-200 hover:shadow-medium transition-all duration-200">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2 font-sora">Infinite Scalability</h3>
              <p className="text-primary-600 font-sora">
                Handle millions of conversations simultaneously. Auto-scales based on demand with zero downtime.
              </p>
            </div>

            {/* Compliance */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">SOC 2 Compliant</h3>
              <p className="text-gray-600">
                Enterprise-grade security with SOC 2 Type II certification, GDPR compliance, and data encryption.
              </p>
            </div>

            {/* Integrations */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Integrations</h3>
              <p className="text-gray-600">
                Connect with Slack, Zendesk, Salesforce, and 100+ other tools via our robust API.
              </p>
            </div>

            {/* Multi-tenant */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Tenant Architecture</h3>
              <p className="text-gray-600">
                Complete tenant isolation with custom domains, subdomains, and dedicated infrastructure.
              </p>
            </div>

            {/* Global */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Deployment</h3>
              <p className="text-gray-600">
                Deploy across multiple regions with automatic failover and edge caching for optimal performance.
              </p>
            </div>

            {/* Security */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Zero-Trust Security</h3>
              <p className="text-gray-600">
                End-to-end encryption, role-based access control, and comprehensive audit logging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-900 mb-4 font-sora">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-primary-600 font-sora">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>1,000 API calls/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>1 user</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Basic support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>10 documents</span>
                </li>
              </ul>
              <Link 
                href="/onboarding"
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors block text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-xl border-2 border-accent-500 relative shadow-medium hover:shadow-large transition-all duration-200">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-semibold font-sora">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary-900 mb-2 font-sora">Starter</h3>
                <div className="text-4xl font-bold text-primary-900 mb-2 font-sora">$29</div>
                <p className="text-primary-600 font-sora">per month</p>
              </div>
                              <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success-500 mr-3" />
                    <span className="font-sora">10,000 API calls/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success-500 mr-3" />
                    <span className="font-sora">5 users</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success-500 mr-3" />
                    <span className="font-sora">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success-500 mr-3" />
                    <span className="font-sora">100 documents</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-success-500 mr-3" />
                    <span className="font-sora">Custom integrations</span>
                  </li>
                </ul>
                <Link 
                  href="/onboarding"
                  className="w-full bg-accent-500 text-white py-3 rounded-lg font-semibold hover:bg-accent-600 transition-all duration-200 block text-center font-sora shadow-soft hover:shadow-accent"
                >
                  Start Free Trial
                </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$99</div>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>100,000 API calls/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>25 users</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>24/7 support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>1,000 documents</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Custom domains</span>
                </li>
              </ul>
              <Link 
                href="/onboarding"
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors block text-center"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of companies that trust Solveur with their customer support
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            {/* Placeholder for company logos */}
            <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Company 1</span>
            </div>
            <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Company 2</span>
            </div>
            <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Company 3</span>
            </div>
            <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Company 4</span>
            </div>
          </div>

          {/* Security Badges */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SOC 2 Type II</h3>
              <p className="text-gray-600">Certified security and compliance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">99.9% Uptime</h3>
              <p className="text-gray-600">Enterprise-grade reliability</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GDPR Compliant</h3>
              <p className="text-gray-600">Global data protection standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 font-sora">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-xl text-accent-100 mb-8 font-sora">
            Join thousands of companies using AI to provide exceptional customer experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/onboarding"
              className="bg-white text-accent-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-all duration-200 flex items-center font-sora shadow-soft hover:shadow-medium"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/auth/signin"
              className="text-white border border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-accent-500 transition-all duration-200 font-sora"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold font-sora">Solveur</h3>
              </div>
              <p className="text-primary-300 font-sora">
                AI-powered customer support that scales with your business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">API</Link></li>
                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white">Status</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Solveur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
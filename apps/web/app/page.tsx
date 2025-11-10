import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Zap,
  Shield,
  Download,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">FinParse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Parse Financial Documents
            <span className="text-blue-600"> Instantly</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload invoices, receipts, or statements and extract structured data
            in seconds. Powered by AI.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Parsing Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose FinParse?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 space-y-4">
            <Zap className="h-12 w-12 text-blue-600" />
            <h3 className="text-xl font-semibold">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Extract data from documents in seconds with our AI-powered OCR
              engine.
            </p>
          </Card>
          <Card className="p-6 space-y-4">
            <Shield className="h-12 w-12 text-blue-600" />
            <h3 className="text-xl font-semibold">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your documents are encrypted and stored securely. We never share
              your data.
            </p>
          </Card>
          <Card className="p-6 space-y-4">
            <Download className="h-12 w-12 text-blue-600" />
            <h3 className="text-xl font-semibold">Export Anywhere</h3>
            <p className="text-muted-foreground">
              Download parsed data as JSON or integrate with our REST API.
            </p>
          </Card>
        </div>
      </section>

      {/* Features List Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto bg-blue-50 dark:bg-gray-800 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            What We Extract
          </h2>
          <div className="grid gap-4">
            {[
              "Invoice numbers and dates",
              "Vendor and customer information",
              "Line items with quantities and prices",
              "Taxes, subtotals, and totals",
              "Payment terms and due dates",
              "Purchase orders and references",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of businesses automating their document processing.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 FinParse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

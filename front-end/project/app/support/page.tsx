import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Support - Ghost Writers",
  description: "Get help and support for your Ghost Writers account",
}

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">How can we help?</h1>
        
        <div className="grid gap-6 mb-12">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">Get help via email within 24 hours</p>
                </div>
                <Button className="ml-auto" variant="outline">
                  Send Email
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Chat with our support team</p>
                </div>
                <Button className="ml-auto" variant="outline">
                  Start Chat
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">Call us during business hours</p>
                </div>
                <Button className="ml-auto" variant="outline">
                  Call Now
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">How do I get started?</h3>
                <p className="text-muted-foreground">Create an account and follow our simple onboarding process to begin working with our ghost writers.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">What are your payment terms?</h3>
                <p className="text-muted-foreground">We offer flexible payment plans and accept all major credit cards. Payments are processed securely through Stripe.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">How long does a typical project take?</h3>
                <p className="text-muted-foreground">Project timelines vary based on scope and requirements. Most projects are completed within 4-12 weeks.</p>
              </div>
            </div>
          </Card>
        </div>

        <p className="text-center text-muted-foreground">
          Need immediate assistance? Contact our support team at{" "}
          <a href="mailto:support@ghostwriters.com" className="text-primary hover:underline">
            support@ghostwriters.com
          </a>
        </p>
      </div>
    </div>
  )
}
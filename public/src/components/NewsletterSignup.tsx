import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card border rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-health-success/10 rounded-full">
            <CheckCircle className="h-8 w-8 text-health-success" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Successfully Subscribed!
        </h3>
        <p className="text-muted-foreground mb-4">
          Thank you for subscribing to our health updates newsletter.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-primary hover:text-primary/80 font-medium text-sm"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-8">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Stay Informed
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Get the latest health updates, announcements, and wellness tips delivered to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                <span>Subscribing...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Subscribe</span>
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}

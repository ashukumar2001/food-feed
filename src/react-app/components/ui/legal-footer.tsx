import { Link } from "@tanstack/react-router";

export function LegalFooter() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:text-primary/80">
            FoodFeed
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/" className="hover:underline">
            Terms and Conditions
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/" className="hover:underline">
            Privacy Policy
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/" className="hover:underline">
            Cancellation and Refund
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/" className="hover:underline">
            Shipping
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/" className="hover:underline">
            Contact Us
          </Link>
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} FoodFeed. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

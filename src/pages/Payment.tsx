
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Calendar as CalendarIcon, Lock } from "lucide-react";

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.5;
      
      if (success) {
        navigate(`/confirmation/${bookingId}`);
      } else {
        navigate(`/payment/failed/${bookingId}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <div className="relative">
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  required
                  className="mt-1"
                />
                <CalendarIcon className="absolute right-3 top-4 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  required
                  maxLength={4}
                  className="mt-1"
                />
                <Lock className="absolute right-3 top-4 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
};

export default Payment;

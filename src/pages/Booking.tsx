
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Ticket } from "lucide-react";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState("");

  // Mock event data (in a real app, this would come from an API)
  const event = {
    id,
    title: "Summer Music Festival 2024",
    price: 99.99,
    availableSeats: ["A1", "A2", "B1", "B2", "C1", "C2"],
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a seat",
      });
      return;
    }

    // Generate a mock booking ID
    const bookingId = Math.random().toString(36).substring(7);
    navigate(`/payment/${bookingId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Ticket className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Book Your Tickets</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
          <p className="text-gray-600">
            Price per ticket: ${event.price.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="quantity">Number of Tickets</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="seat">Select Seat</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {event.availableSeats.map((seat) => (
                <Button
                  key={seat}
                  type="button"
                  variant={selectedSeat === seat ? "default" : "outline"}
                  onClick={() => setSelectedSeat(seat)}
                >
                  {seat}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                ${(event.price * quantity).toFixed(2)}
              </span>
            </div>
            <Button type="submit" className="w-full">
              Continue to Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;

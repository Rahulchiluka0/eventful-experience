
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Booking = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Book Your Tickets</h1>
      <p>Booking page for event {id}</p>
      {/* Add booking form and seat selection here */}
      <Button>Continue to Payment</Button>
    </div>
  );
};

export default Booking;

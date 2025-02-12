
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Payment = () => {
  const { bookingId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>
      <p>Payment page for booking {bookingId}</p>
      {/* Add payment form here */}
      <Button>Complete Payment</Button>
    </div>
  );
};

export default Payment;

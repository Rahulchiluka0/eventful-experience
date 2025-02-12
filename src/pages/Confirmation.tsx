
import { useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Confirmation = () => {
  const { bookingId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-4">
          Your booking (ID: {bookingId}) has been confirmed. You will receive an email
          with your ticket details shortly.
        </p>
      </div>
    </div>
  );
};

export default Confirmation;

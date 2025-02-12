
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Share2 } from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();

  // Mock event data (in a real app, this would come from an API)
  const event = {
    id: id,
    title: "Summer Music Festival 2024",
    description: "A day of amazing music and unforgettable memories",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    date: "2024-07-15",
    time: "12:00 PM",
    venue: "Central Park, New York",
    price: 99.99,
    category: "Music",
    longDescription: "Join us for an unforgettable day of music featuring top artists from around the world. Experience amazing performances, great food, and create lasting memories with friends and family.",
  };

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Event Image */}
          <div className="relative h-[400px]">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-lg mb-4">{event.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-grow">
                <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
                <p className="text-gray-600 mb-6">{event.longDescription}</p>
                
                <h3 className="text-xl font-semibold mb-3">Venue Information</h3>
                <p className="text-gray-600 mb-6">
                  Located in the heart of New York City, Central Park provides the perfect backdrop for this amazing musical experience.
                </p>
              </div>

              {/* Booking Section */}
              <div className="md:w-80">
                <div className="bg-neutral p-6 rounded-lg">
                  <div className="mb-4">
                    <span className="text-2xl font-bold">${event.price}</span>
                    <span className="text-gray-600"> / ticket</span>
                  </div>
                  <Button className="w-full mb-4">Book Now</Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

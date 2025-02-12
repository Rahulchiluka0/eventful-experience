import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for events
const events = [
  {
    id: "1",
    title: "Summer Music Festival 2024",
    description: "A day of amazing music and unforgettable memories",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    date: "2024-07-15",
    time: "12:00 PM",
    venue: "Central Park, New York",
    price: 99.99,
    category: "Music",
  },
  {
    id: "2",
    title: "Tech Conference 2024",
    description: "Join the biggest tech conference of the year",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    date: "2024-08-20",
    time: "9:00 AM",
    venue: "Convention Center, San Francisco",
    price: 299.99,
    category: "Technology",
  },
  {
    id: "3",
    title: "Food & Wine Festival",
    description: "Experience the finest cuisines and wines",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    date: "2024-09-10",
    time: "11:00 AM",
    venue: "Downtown Food Court, Chicago",
    price: 75.00,
    category: "Food",
  },
];

const Categories = ["All", "Music", "Technology", "Food", "Sports", "Arts"];

const Index = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const searchQuery = searchParams.get("search") || "";
  const eventsRef = useRef<HTMLElement>(null);

  const handleExplore = () => {
    eventsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (searchQuery) {
      setSelectedCategory("All");
    }
  }, [searchQuery]);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Book tickets for the most exciting events happening around you
          </p>
          <Button
            size="lg"
            className="w-fit bg-white text-primary hover:bg-white/90"
            onClick={handleExplore}
          >
            Explore Events
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {Categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section ref={eventsRef} className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Upcoming Events"}
          </h2>
          {filteredEvents.length === 0 && (
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Clear Search
            </Button>
          )}
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No events found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary">
                    ${event.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;

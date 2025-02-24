
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const mockUpcomingEvents = [
  {
    id: "1",
    title: "Summer Music Festival",
    date: "2024-06-15",
    time: "12:00 PM",
    location: "Central Park, NY",
    tickets: 2,
  },
  {
    id: "2",
    title: "Food & Wine Expo",
    date: "2024-05-20",
    time: "10:00 AM",
    location: "Convention Center, SF",
    tickets: 1,
  },
];

const mockPastBookings = [
  {
    id: "1",
    title: "Tech Conference 2023",
    date: "2023-12-10",
    tickets: 1,
    amount: "$299",
    status: "completed",
  },
  {
    id: "2",
    title: "New Year's Eve Party",
    date: "2023-12-31",
    tickets: 2,
    amount: "$150",
    status: "completed",
  },
];

const UserDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUpcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold">{event.title}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Ticket className="w-4 h-4 mr-2" />
                      {event.tickets} {event.tickets === 1 ? "ticket" : "tickets"}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link to={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {mockUpcomingEvents.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <h3 className="font-semibold">{booking.title}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {booking.date}
                    </div>
                    <div className="flex items-center">
                      <Ticket className="w-4 h-4 mr-2" />
                      {booking.tickets} {booking.tickets === 1 ? "ticket" : "tickets"}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Amount paid: {booking.amount}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm">Download Ticket</Button>
                  </div>
                </div>
              ))}
              {mockPastBookings.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No booking history
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;

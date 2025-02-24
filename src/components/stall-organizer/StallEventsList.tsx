
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Eye, Store } from "lucide-react";
import { Link } from "react-router-dom";

const mockEvents = [
  {
    id: 1,
    title: "Food Festival 2024",
    date: "2024-06-15",
    location: "Central Park",
    stallsTotal: 50,
    stallsBooked: 35,
    status: "active",
  },
  {
    id: 2,
    title: "Craft Fair Exhibition",
    date: "2024-07-20",
    location: "Convention Center",
    stallsTotal: 30,
    stallsBooked: 25,
    status: "pending",
  },
  {
    id: 3,
    title: "Farmers Market",
    date: "2024-08-10",
    location: "City Square",
    stallsTotal: 40,
    stallsBooked: 0,
    status: "upcoming",
  },
];

const StallEventsList = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Stall Events</CardTitle>
        <Link to="/stall-organizer/events/new">
          <Button>Create New Event</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{event.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Store className="h-4 w-4 mr-1" />
                  {event.stallsBooked} / {event.stallsTotal} stalls booked
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      event.status === "active"
                        ? "bg-green-100 text-green-800"
                        : event.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StallEventsList;

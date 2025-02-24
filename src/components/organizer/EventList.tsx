
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const mockEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "2024-06-15",
    status: "pending",
    type: "Show Event",
  },
  {
    id: 2,
    title: "Food & Wine Expo",
    date: "2024-05-20",
    status: "approved",
    type: "Stall Event",
  },
  {
    id: 3,
    title: "Tech Conference 2024",
    date: "2024-07-10",
    status: "rejected",
    type: "Show Event",
  },
];

const EventList = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Events</CardTitle>
        <Link to="/organizer/events/new">
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
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      event.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : event.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
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

export default EventList;

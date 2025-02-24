
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, MessageSquare, Calendar, Store } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const pendingEvents = [
  {
    id: 1,
    title: "Summer Music Festival 2024",
    organizer: "John Smith",
    date: "2024-06-15",
    type: "show",
    description: "A 3-day music festival featuring local and international artists",
    status: "pending",
  },
  {
    id: 2,
    title: "Food & Wine Expo",
    organizer: "Sarah Johnson",
    date: "2024-05-20",
    type: "stall",
    stallCount: 50,
    description: "Showcasing local cuisine and wine from various regions",
    status: "pending",
  },
];

const EventVerification = () => {
  const { toast } = useToast();

  const handleApprove = (eventId: number) => {
    toast({
      title: "Event Approved",
      description: "The event has been approved and organizer notified.",
    });
  };

  const handleReject = (eventId: number) => {
    toast({
      title: "Event Rejected",
      description: "The event has been rejected and organizer notified.",
      variant: "destructive",
    });
  };

  const handleRequestModifications = (eventId: number) => {
    toast({
      title: "Modifications Requested",
      description: "The organizer has been notified about required modifications.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.type === 'show' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {event.type === 'show' ? 'Show Event' : 'Stall Event'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        {event.type === 'show' ? (
                          <Calendar className="h-4 w-4" />
                        ) : (
                          <Store className="h-4 w-4" />
                        )}
                        <span>{event.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Organizer: {event.organizer}
                      </p>
                      <p className="text-sm mt-2">{event.description}</p>
                      {event.type === 'stall' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Number of Stalls: {event.stallCount}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                        onClick={() => handleApprove(event.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleReject(event.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestModifications(event.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Request Changes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventVerification;

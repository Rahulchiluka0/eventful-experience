
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const StallEventForm = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Event Submitted",
      description: "Your stall event has been submitted for review.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Stall Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" placeholder="Enter event title" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Event Date</Label>
            <Input id="date" type="date" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Event description" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Event location" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stallCapacity">Number of Stalls</Label>
            <Input id="stallCapacity" type="number" placeholder="Total available stalls" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stallPrice">Price per Stall</Label>
            <Input id="stallPrice" type="number" placeholder="Price per stall" required />
          </div>
          
          <Button type="submit" className="w-full">
            Submit for Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StallEventForm;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Search, MapPin, Calendar, DollarSign } from "lucide-react";

const mockStalls = [
  {
    id: 1,
    name: "Food Corner A12",
    event: "Summer Food Festival 2024",
    location: "Central Park, Area A",
    date: "2024-06-15",
    status: "active",
    revenue: "$2,500",
  },
  {
    id: 2,
    name: "Craft Booth B5",
    event: "Artisan Market",
    location: "Convention Center, Hall B",
    date: "2024-07-20",
    status: "upcoming",
    revenue: "$0",
  },
  {
    id: 3,
    name: "Local Products C8",
    event: "Farmers Market",
    location: "City Square, Zone C",
    date: "2024-05-10",
    status: "completed",
    revenue: "$1,800",
  },
];

const MyStalls = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Stalls</CardTitle>
            <Button>
              <Store className="mr-2 h-4 w-4" />
              Request New Stall
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search stalls..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStalls.map((stall) => (
              <div
                key={stall.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">{stall.name}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {stall.event}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {stall.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Revenue: {stall.revenue}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      stall.status === "active"
                        ? "bg-green-100 text-green-800"
                        : stall.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {stall.status.charAt(0).toUpperCase() + stall.status.slice(1)}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyStalls;

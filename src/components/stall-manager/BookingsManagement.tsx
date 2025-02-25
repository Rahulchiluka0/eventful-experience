
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, DollarSign, Check, X } from "lucide-react";
import { useState } from "react";

const mockBookings = [
  {
    id: 1,
    customerName: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 234 567 890",
    stallName: "Food Corner A12",
    event: "Summer Food Festival 2024",
    date: "2024-06-15",
    amount: "$500",
    status: "confirmed",
  },
  {
    id: 2,
    customerName: "Alice Johnson",
    email: "alice.j@example.com",
    phone: "+1 234 567 891",
    stallName: "Craft Booth B5",
    event: "Artisan Market",
    date: "2024-07-20",
    amount: "$450",
    status: "pending",
  },
];

const BookingsManagement = () => {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bookings</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "confirmed" ? "default" : "outline"}
                onClick={() => setFilter("confirmed")}
              >
                Confirmed
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
              >
                Pending
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bookings..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBookings
              .filter(
                booking => filter === "all" || booking.status === filter
              )
              .map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{booking.customerName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.email} • {booking.phone}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {booking.event} - {booking.date}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Amount: {booking.amount}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsManagement;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Check, X, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const pendingUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Event Organiser",
    documents: ["Business License", "ID Proof"],
    submittedAt: "2024-04-15",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "Stall Manager",
    documents: ["ID Proof"],
    submittedAt: "2024-04-14",
  },
  // Add more mock data as needed
];

const UsersVerification = () => {
  const { toast } = useToast();

  const handleVerify = (userId: number) => {
    toast({
      title: "User Verified",
      description: "The user has been successfully verified.",
    });
  };

  const handleReject = (userId: number) => {
    toast({
      title: "User Rejected",
      description: "The user verification has been rejected.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                        onClick={() => handleVerify(user.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleReject(user.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.documents.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-primary"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {doc}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {user.submittedAt}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersVerification;

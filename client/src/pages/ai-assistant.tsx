import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Loader2, Upload, Send, ImagePlus, Mic, AlertCircle } from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fileAttachment?: {
    name: string;
    type: string;
    url: string;
  };
  suggestions?: string[];
}

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your agricultural assistant. How can I help you today?",
      timestamp: new Date(),
      suggestions: [
        "How do I identify plant diseases?",
        "What crops are suitable for my region?",
        "Recommend sustainable farming practices",
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim() && !isRecording) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      let aiResponse: ChatMessage;

      if (activeTab === "general") {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content:
            "Based on your question, I'd recommend implementing crop rotation techniques to improve soil health and reduce pest pressure. Alternating between different crop families can break pest cycles and enhance soil nutrients. Would you like more specific recommendations for your region?",
          timestamp: new Date(),
          suggestions: [
            "Tell me more about crop rotation",
            "What crops should I rotate?",
            "How often should I rotate crops?",
          ],
        };
      } else if (activeTab === "diseases") {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content:
            "From your description, this could be powdery mildew, a common fungal disease. It typically appears as white powdery spots on leaves and stems. To manage it, improve air circulation around plants, avoid overhead watering, and consider organic fungicides like neem oil or a baking soda solution (1 tbsp in 1 gallon of water with a few drops of dish soap).",
          timestamp: new Date(),
          suggestions: [
            "Show me images of powdery mildew",
            "How do I prevent it next season?",
            "Are there resistant varieties?",
          ],
        };
      } else {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content:
            "Based on current market trends, consider focusing on specialty crops like heirloom tomatoes, organic herbs, or microgreens which command premium prices at farmers markets and to local restaurants. These crops can be grown in smaller spaces and have shorter growing cycles, allowing for multiple harvests per season.",
          timestamp: new Date(),
          suggestions: [
            "What are the startup costs?",
            "How do I find buyers?",
            "Which specialty crops are easiest to grow?",
          ],
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording for 3 seconds then auto-send
      setTimeout(() => {
        setIsRecording(false);
        setInputMessage("How can I improve soil health in my vegetable garden?");
        handleSendMessage();
      }, 3000);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">AI Farming Assistant</h1>
      <p className="text-muted-foreground mb-6">
        Get personalized advice, identify plant diseases, and explore profitable farming opportunities
      </p>

      <Tabs defaultValue="general" onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="general">General Advice</TabsTrigger>
          <TabsTrigger value="diseases">Disease Identification</TabsTrigger>
          <TabsTrigger value="market">Market Opportunities</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            {activeTab === "general" && "Agricultural Advisor"}
            {activeTab === "diseases" && "Plant Disease Identifier"}
            {activeTab === "market" && "Market Opportunity Analyzer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Chat messages area */}
          <div className="h-[500px] overflow-y-auto px-6 py-4 border-t">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.fileAttachment && (
                    <div className="mb-2 rounded bg-background/80 p-2 text-xs flex items-center gap-2">
                      <div className="p-1 bg-primary/10 rounded">
                        {message.fileAttachment.type.includes("image") ? (
                          <ImagePlus className="h-3 w-3" />
                        ) : (
                          <Upload className="h-3 w-3" />
                        )}
                      </div>
                      <span>{message.fileAttachment.name}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className="mt-1 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%] rounded-lg p-4 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>AI assistant is thinking...</p>
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              messages[messages.length - 1].suggestions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions?.map(
                    (suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            {activeTab === "diseases" && (
              <div className="mb-3 p-3 rounded-md bg-muted/60 flex gap-2 items-center">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">
                  Upload an image of your plant for better disease identification
                </span>
                <Button size="sm" variant="outline" className="h-7 ml-auto">
                  <ImagePlus className="h-3.5 w-3.5 mr-1" />
                  Upload
                </Button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Type your ${
                    activeTab === "general"
                      ? "farming question"
                      : activeTab === "diseases"
                      ? "plant problem description"
                      : "market inquiry"
                  }...`}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none pr-12"
                />
                <Button
                  onClick={toggleRecording}
                  size="icon"
                  variant="ghost"
                  className={`absolute right-2 bottom-2 h-8 w-8 ${
                    isRecording ? "text-red-500 animate-pulse" : ""
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleSendMessage} className="shrink-0" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
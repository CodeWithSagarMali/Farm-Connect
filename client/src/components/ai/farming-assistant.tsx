import { useState } from "react";
import { MessageSquare, Lightbulb, Send, ImageIcon, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

// Sample pre-defined farming questions
const sampleQuestions = [
  "What's the ideal pH level for tomato plants?",
  "How can I identify and treat powdery mildew?",
  "What are sustainable pest management techniques?",
  "How do I calculate the right amount of fertilizer?",
  "What's the best irrigation schedule for corn during drought?"
];

export default function FarmingAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your AI farming assistant. How can I help with your agricultural questions today?",
      timestamp: new Date(),
      suggestions: [
        "Identify a plant disease",
        "Get crop rotation advice",
        "Calculate fertilizer needs",
        "Weather impact on crops",
        "Water management tips"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
      fileAttachment: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        url: previewUrl || ""
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");
    
    // Remove file preview after sending
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);

    // Simulate AI response (1-2 second delay)
    setTimeout(() => {
      let aiResponse: ChatMessage;
      
      // Mock different AI responses based on user input
      if (input.toLowerCase().includes("disease") || input.toLowerCase().includes("pest")) {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content: "Based on your description, this could be a common fungal infection. Look for these signs: yellow spots on leaves, wilting, or unusual growth patterns. I recommend applying a copper-based fungicide and ensuring proper air circulation around plants.",
          timestamp: new Date(),
          suggestions: ["How to apply fungicide", "Preventative measures", "Organic treatment options"]
        };
      } else if (input.toLowerCase().includes("fertilizer") || input.toLowerCase().includes("nutrient")) {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content: "For balanced crop nutrition, consider a 10-10-10 NPK fertilizer applied at 2-3 pounds per 100 square feet. Adjust based on soil tests - sandy soils need more frequent, lighter applications while clay soils retain nutrients longer.",
          timestamp: new Date(),
          suggestions: ["Soil testing options", "Organic fertilizer alternatives", "Signs of nutrient deficiency"]
        };
      } else if (input.toLowerCase().includes("water") || input.toLowerCase().includes("irrigation")) {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content: "Efficient irrigation is crucial. Most crops need 1-1.5 inches of water weekly. Morning watering reduces evaporation. Consider drip irrigation which can save up to 60% water compared to sprinkler systems and delivers moisture directly to roots.",
          timestamp: new Date(),
          suggestions: ["Drip irrigation setup", "Water conservation techniques", "Signs of overwatering"]
        };
      } else if (input.toLowerCase().includes("crop rotation") || input.toLowerCase().includes("planting schedule")) {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content: "Crop rotation improves soil health and reduces pest problems. Divide crops into families: legumes, brassicas, alliums, and nightshades. Don't plant the same family in the same location for at least 3 years. Legumes followed by heavy feeders like corn works well.",
          timestamp: new Date(),
          suggestions: ["Sample rotation plans", "Cover crops benefits", "Companion planting"]
        };
      } else if (selectedFile && previewUrl) {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content: "I've analyzed your image. This appears to be a case of early blight, a fungal disease common in many crops. Notice the dark spots with concentric rings. Apply a copper-based fungicide, remove affected leaves, and ensure proper plant spacing for air circulation. Water at soil level to keep foliage dry.",
          timestamp: new Date(),
          suggestions: ["Prevention measures", "Organic treatment options", "Similar diseases to watch for"]
        };
      } else {
        aiResponse = {
          id: messages.length + 2,
          role: "assistant",
          content: "Thank you for your question. Based on agricultural best practices, I recommend focusing on sustainable methods that balance productivity with environmental stewardship. Consider soil health as your foundation - regular testing and organic amendments can significantly improve yields over time.",
          timestamp: new Date(),
          suggestions: ["Soil improvement techniques", "Sustainable farming practices", "Local agricultural resources"]
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleQuickQuestionClick = (question: string) => {
    setInput(question);
    // Auto-send the quick question
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Lightbulb className="mr-2 h-5 w-5" />
              AI Farming Assistant
            </CardTitle>
          </div>
          <CardDescription>
            Ask questions about farming techniques, crop diseases, or get personalized recommendations
          </CardDescription>
        </CardHeader>
        
        <div className="flex overflow-x-auto px-4 pb-4 gap-2 scrollbar-thin">
          {sampleQuestions.map((question, index) => (
            <Badge 
              key={index}
              variant="outline"
              className="whitespace-nowrap py-1 px-3 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleQuickQuestionClick(question)}
            >
              {question}
            </Badge>
          ))}
        </div>
        
        <ScrollArea className="flex-1 p-4 pt-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className={`h-8 w-8 ${message.role === "user" ? "bg-primary" : "bg-green-600"}`}>
                    {message.role === "assistant" ? (
                      <AvatarImage src="/robot-avatar.png" alt="AI" />
                    ) : null}
                    <AvatarFallback>
                      {message.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className={`rounded-lg p-4 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card border border-border"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {message.fileAttachment && message.fileAttachment.type.startsWith("image/") && (
                        <div className="mt-3">
                          <img 
                            src={message.fileAttachment.url} 
                            alt="Attached" 
                            className="max-h-48 rounded-md"
                          />
                        </div>
                      )}
                      
                      {message.fileAttachment && !message.fileAttachment.type.startsWith("image/") && (
                        <div className="mt-3 flex items-center p-2 rounded bg-muted/40">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          <span className="text-xs">{message.fileAttachment.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="cursor-pointer bg-background hover:bg-muted transition-colors"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8 bg-green-600">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-4 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p className="text-sm">Analyzing your question...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <CardFooter className="p-4 pt-2 border-t">
          {selectedFile && (
            <div className="flex items-center mb-2 p-2 border rounded bg-muted/30 w-full">
              <div className="flex-1 overflow-hidden">
                {previewUrl ? (
                  <div className="flex items-center">
                    <img src={previewUrl} alt="Preview" className="h-10 w-10 rounded mr-2 object-cover" />
                    <span className="text-xs truncate">{selectedFile.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    <span className="text-xs truncate">{selectedFile.name}</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile} className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex w-full gap-2">
            <div className="relative flex-1">
              <Textarea
                placeholder="Ask a farming question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-10 resize-none pr-10"
              />
              <div className="absolute right-3 bottom-3">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <ImageIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <Button className="shrink-0" onClick={handleSendMessage} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
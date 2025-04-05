import { useState, useEffect } from "react";
import { Globe, Volume2, VolumeX, MessageSquare, Check, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface TranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Supported languages
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "sw", name: "Swahili" },
  { code: "hi", name: "Hindi" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
];

// Sample conversation history
const sampleConversation = [
  { id: 1, sender: "You", text: "How do I manage soil erosion on sloped farmland?", time: "10:02 AM", translated: false },
  { id: 2, sender: "Dr. Maria", originalText: "Para controlar la erosión, debes implementar técnicas de cultivo en terrazas y establecer barreras vegetativas.", text: "To control erosion, you should implement terracing techniques and establish vegetative barriers.", time: "10:03 AM", translated: true },
  { id: 3, sender: "You", text: "What plants work best as barriers?", time: "10:04 AM", translated: false },
  { id: 4, sender: "Dr. Maria", originalText: "Las gramíneas como el vetiver y arbustos de raíces profundas son excelentes. También pueden proporcionar forraje o frutos adicionales.", text: "Grasses like vetiver and deep-rooted shrubs are excellent. They can also provide additional fodder or fruits.", time: "10:06 AM", translated: true },
];

export default function TranslationPanel({ isOpen, onClose }: TranslationPanelProps) {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [inputText, setInputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [activeTab, setActiveTab] = useState("translate");
  const [conversation, setConversation] = useState(sampleConversation);

  // Simulate translation
  const translateText = () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Simplified mock translation (in a real app this would call a translation API)
      let result = "";
      if (sourceLanguage === "en" && targetLanguage === "es") {
        // English to Spanish approximation
        result = inputText
          .replace(/hello/gi, "hola")
          .replace(/thank you/gi, "gracias")
          .replace(/please/gi, "por favor")
          .replace(/farm/gi, "granja")
          .replace(/crop/gi, "cultivo")
          .replace(/soil/gi, "suelo")
          .replace(/water/gi, "agua")
          .replace(/plant/gi, "planta");
      } else if (sourceLanguage === "es" && targetLanguage === "en") {
        // Spanish to English approximation
        result = inputText
          .replace(/hola/gi, "hello")
          .replace(/gracias/gi, "thank you")
          .replace(/por favor/gi, "please")
          .replace(/granja/gi, "farm")
          .replace(/cultivo/gi, "crop")
          .replace(/suelo/gi, "soil")
          .replace(/agua/gi, "water")
          .replace(/planta/gi, "plant");
      } else {
        // For other language pairs just add "[Translated]" prefix
        result = `[Translated to ${languages.find(l => l.code === targetLanguage)?.name}] ${inputText}`;
      }
      
      setTranslatedText(result);
      setIsTranslating(false);
    }, 1000);
  };

  // Effect to auto-translate when text changes
  useEffect(() => {
    if (autoTranslate && inputText) {
      const timeoutId = setTimeout(() => {
        translateText();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputText, autoTranslate]);

  // Add message to conversation
  const addToConversation = () => {
    if (!translatedText.trim()) return;
    
    const newMessage = {
      id: conversation.length + 1,
      sender: "You",
      text: translatedText,
      originalText: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      translated: true
    };
    
    setConversation([...conversation, newMessage]);
    setInputText("");
    setTranslatedText("");
  };

  // Text-to-speech functionality
  const speakText = (text: string) => {
    if (!textToSpeech) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLanguage === "en" ? "en-US" : 
                      targetLanguage === "es" ? "es-ES" : 
                      targetLanguage === "fr" ? "fr-FR" : "en-US";
    speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full md:w-96 h-auto max-h-[calc(100vh-200px)] overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg font-medium">
            <Globe className="h-5 w-5 mr-2" />
            Translation Tools
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            &times;
          </Button>
        </div>
        <CardDescription>
          Translate messages in real-time during your call
        </CardDescription>
      </CardHeader>
      
      <Tabs 
        defaultValue="translate" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="px-4 border-b">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="translate">Translator</TabsTrigger>
            <TabsTrigger value="history">Conversation</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="translate" className="m-0">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-2">
                <div className="w-full">
                  <Label htmlFor="sourceLang" className="text-xs font-medium mb-1 block">From</Label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger id="sourceLang" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="mt-6" 
                  onClick={() => {
                    const temp = sourceLanguage;
                    setSourceLanguage(targetLanguage);
                    setTargetLanguage(temp);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <div className="w-full">
                  <Label htmlFor="targetLang" className="text-xs font-medium mb-1 block">To</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger id="targetLang" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="inputText" className="text-xs font-medium mb-1 block">Input Text</Label>
                <Textarea
                  id="inputText"
                  placeholder="Type or paste text to translate..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="translatedText" className="text-xs font-medium">Translation</Label>
                  {textToSpeech && translatedText && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6" 
                      onClick={() => speakText(translatedText)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Textarea
                    id="translatedText"
                    placeholder="Translation will appear here..."
                    value={translatedText}
                    readOnly
                    rows={3}
                    className="resize-none bg-muted/30"
                  />
                  {isTranslating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <span className="text-sm">Translating...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5">
                  <Switch
                    id="auto-translate"
                    checked={autoTranslate}
                    onCheckedChange={setAutoTranslate}
                  />
                  <Label htmlFor="auto-translate" className="text-xs">Auto Translate</Label>
                </div>
                
                <div className="flex items-center space-x-1.5">
                  <Switch
                    id="text-to-speech"
                    checked={textToSpeech}
                    onCheckedChange={setTextToSpeech}
                  />
                  <Label htmlFor="text-to-speech" className="text-xs">
                    <div className="flex items-center">
                      {textToSpeech ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
                      Text to Speech
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between gap-2 p-4 pt-0">
            <Button
              variant="outline" 
              className="w-full" 
              disabled={!inputText.trim() || isTranslating}
              onClick={translateText}
            >
              Translate
            </Button>
            <Button 
              className="w-full flex items-center" 
              disabled={!translatedText.trim()}
              onClick={addToConversation}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Send
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="history" className="m-0 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div className="p-4 space-y-4">
            {conversation.length > 0 ? (
              conversation.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex flex-col ${
                    message.sender === "You" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-medium mr-2">{message.sender}</span>
                    <span className="text-xs text-neutral-500">{message.time}</span>
                  </div>
                  <div 
                    className={`max-w-[85%] p-3 rounded-lg ${
                      message.sender === "You" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.translated && message.originalText && (
                      <div className="mt-1 pt-1 border-t border-neutral-200/20">
                        <p className="text-xs italic opacity-80">{message.originalText}</p>
                      </div>
                    )}
                  </div>
                  {message.translated && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 h-4">
                        <Check className="h-2.5 w-2.5 mr-1" />
                        Translated
                      </Badge>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No conversation history yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
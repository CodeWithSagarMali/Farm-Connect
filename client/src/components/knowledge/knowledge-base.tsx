import { useState } from "react";
import { Search, BookOpen, FileText, Video, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "article" | "video" | "document";
  category: string;
  tags: string[];
  url: string;
  thumbnail?: string;
  author: string;
  date: string;
}

// Sample resources data
const sampleResources: Resource[] = [
  {
    id: 1,
    title: "Managing Soil pH for Optimal Crop Growth",
    description: "Learn about the importance of soil pH and how to adjust it for different crops.",
    type: "article",
    category: "Soil Management",
    tags: ["pH", "soil health", "fertilizers"],
    url: "#",
    author: "Dr. Maria Rodriguez",
    date: "2023-11-15"
  },
  {
    id: 2,
    title: "Identifying Common Crop Diseases",
    description: "Visual guide to identifying and treating common crop diseases in various plants.",
    type: "document",
    category: "Plant Health",
    tags: ["diseases", "treatment", "prevention"],
    url: "#",
    thumbnail: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=200&q=80",
    author: "Dr. James Wilson",
    date: "2023-10-22"
  },
  {
    id: 3,
    title: "Drip Irrigation Installation Guide",
    description: "Step-by-step tutorial on setting up efficient drip irrigation systems.",
    type: "video",
    category: "Irrigation",
    tags: ["water conservation", "installation", "tutorial"],
    url: "#",
    thumbnail: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=200&q=80",
    author: "Tech Farm Solutions",
    date: "2023-09-05"
  },
  {
    id: 4,
    title: "Seasonal Planting Calendar",
    description: "Comprehensive planting schedule for different crops based on seasons and regions.",
    type: "document",
    category: "Planning",
    tags: ["calendar", "seasons", "planning"],
    url: "#",
    author: "Agricultural Extension Office",
    date: "2023-12-01"
  },
  {
    id: 5,
    title: "Organic Pest Control Methods",
    description: "Natural and chemical-free approaches to controlling common agricultural pests.",
    type: "article",
    category: "Pest Management",
    tags: ["organic", "pest control", "natural solutions"],
    url: "#",
    author: "Green Farming Initiative",
    date: "2023-11-10"
  },
  {
    id: 6,
    title: "Modern Tractor Maintenance",
    description: "Essential maintenance tips to keep your farm equipment running efficiently.",
    type: "video",
    category: "Equipment",
    tags: ["machinery", "maintenance", "tractors"],
    url: "#",
    thumbnail: "https://images.unsplash.com/photo-1505672678657-cc7037095e60?auto=format&fit=crop&w=200&q=80",
    author: "Farm Mechanics Association",
    date: "2023-10-15"
  },
];

// Categories for filtering
const categories = [
  "All Categories",
  "Soil Management",
  "Plant Health",
  "Irrigation",
  "Planning",
  "Pest Management",
  "Equipment"
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setSelectedType] = useState("all");

  // Filter resources based on search, category, and type
  const filteredResources = sampleResources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === "All Categories" || resource.category === selectedCategory;
    
    const matchesType = 
      selectedType === "all" || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Resource card renderer
  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const typeIcon = () => {
      switch (resource.type) {
        case "article":
          return <BookOpen className="h-4 w-4" />;
        case "document":
          return <FileText className="h-4 w-4" />;
        case "video":
          return <Video className="h-4 w-4" />;
        default:
          return <FileText className="h-4 w-4" />;
      }
    };

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">{resource.title}</CardTitle>
            <div className={`p-1 rounded ${
              resource.type === "article" ? "bg-blue-100 text-blue-700" :
              resource.type === "video" ? "bg-red-100 text-red-700" :
              "bg-green-100 text-green-700"
            } flex items-center text-xs font-medium`}>
              {typeIcon()}
              <span className="ml-1 capitalize">{resource.type}</span>
            </div>
          </div>
          <CardDescription className="text-sm text-neutral-600">
            {resource.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resource.thumbnail && (
            <div className="mb-3 rounded-md overflow-hidden">
              <img 
                src={resource.thumbnail} 
                alt={resource.title} 
                className="w-full h-32 object-cover"
              />
            </div>
          )}
          <div className="text-xs text-neutral-500 mb-2">
            <span className="font-medium">By: {resource.author}</span>
            <span className="mx-2">•</span>
            <span>{new Date(resource.date).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {resource.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-neutral-50">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm" className="w-full">View Resource</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-medium">Knowledge Base</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Category
            </label>
            <select
              className="w-full rounded-md border border-neutral-300 p-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Resource Type
            </label>
            <Tabs 
              defaultValue="all" 
              value={selectedType}
              onValueChange={setSelectedType}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="article">Articles</TabsTrigger>
                <TabsTrigger value="document">Documents</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
            <h3 className="text-lg font-medium text-neutral-700">No resources found</h3>
            <p className="text-neutral-500">
              Try adjusting your search criteria or browse all resources.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedType("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
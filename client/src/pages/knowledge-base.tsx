import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { SearchIcon, BookOpen, PlayCircle, FileText } from "lucide-react";

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
    title: "Sustainable Irrigation Techniques",
    description: "Learn about water-efficient irrigation methods for drought-prone regions.",
    type: "article",
    category: "Water Management",
    tags: ["irrigation", "drought", "water conservation"],
    url: "#",
    author: "Dr. Sarah Johnson",
    date: "2023-06-15",
  },
  {
    id: 2,
    title: "Identifying Common Crop Diseases",
    description: "Visual guide to diagnosing common diseases in cereal crops.",
    type: "document",
    category: "Crop Health",
    tags: ["diseases", "diagnosis", "cereals"],
    url: "#",
    author: "Prof. Michael Chen",
    date: "2023-08-22",
  },
  {
    id: 3,
    title: "Soil Nutrient Management",
    description: "Comprehensive guide to balancing soil nutrients for optimal crop growth.",
    type: "article",
    category: "Soil Health",
    tags: ["soil", "nutrients", "fertilizer"],
    url: "#",
    author: "Dr. Emily Rodriguez",
    date: "2023-07-10",
  },
  {
    id: 4,
    title: "Organic Pest Control Methods",
    description: "Natural and eco-friendly approaches to managing common agricultural pests.",
    type: "video",
    category: "Pest Management",
    tags: ["organic", "pests", "natural solutions"],
    url: "#",
    thumbnail: "https://placehold.co/300x200",
    author: "Maria Gonzalez",
    date: "2023-09-05",
  },
  {
    id: 5,
    title: "Climate-Smart Farming Practices",
    description: "Adapting agricultural methods to changing climate conditions.",
    type: "document",
    category: "Climate Adaptation",
    tags: ["climate change", "adaptation", "resilience"],
    url: "#",
    author: "Dr. James Williams",
    date: "2023-10-12",
  },
  {
    id: 6,
    title: "Efficient Livestock Management",
    description: "Best practices for sustainable and profitable livestock operations.",
    type: "video",
    category: "Livestock",
    tags: ["animals", "management", "sustainability"],
    url: "#",
    thumbnail: "https://placehold.co/300x200",
    author: "Dr. Robert Garcia",
    date: "2023-08-30",
  },
];

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get unique categories
  const uniqueCategories = sampleResources.map(r => r.category)
    .filter((value, index, self) => self.indexOf(value) === index);
  const categories = ["all", ...uniqueCategories];

  // Filter resources based on search and category
  const filteredResources = sampleResources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === "all" || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Access agricultural resources, guides, and best practices
          </p>
        </div>
        
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="mb-6 flex flex-wrap">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No resources found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or category filters
            </p>
          </div>
        )}
      </Tabs>
    </div>
  );
}

interface ResourceCardProps {
  resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  const TypeIcon = () => {
    switch (resource.type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="capitalize flex items-center gap-1">
              <TypeIcon />
              {resource.type}
            </Badge>
            <Badge variant="outline">{resource.category}</Badge>
          </div>
          
          <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {resource.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              By {resource.author} • {new Date(resource.date).toLocaleDateString()}
            </div>
            
            <Button size="sm" asChild>
              <a href={resource.url}>View Resource</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
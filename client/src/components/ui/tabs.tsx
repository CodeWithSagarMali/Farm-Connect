import * as React from "react";

interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [selectedTab, setSelectedTab] = React.useState<string>(
      value || defaultValue || ""
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedTab(value);
      }
    }, [value]);

    const handleTabChange = React.useCallback(
      (tabValue: string) => {
        if (value === undefined) {
          setSelectedTab(tabValue);
        }
        onValueChange?.(tabValue);
      },
      [onValueChange, value]
    );

    return (
      <TabsContext.Provider
        value={{
          selectedTab,
          setSelectedTab: handleTabChange,
        }}
      >
        <div ref={ref} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component");
  }
  return context;
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { selectedTab, setSelectedTab } = useTabsContext();
    const isSelected = selectedTab === value;

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          isSelected
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        } ${className}`}
        onClick={() => setSelectedTab(value)}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { selectedTab } = useTabsContext();
    const isSelected = selectedTab === value;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
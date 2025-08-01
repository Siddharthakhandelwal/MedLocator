import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Hospital, PillBottle, Stethoscope, Search, Loader2, Phone, Clock, Star, Bookmark, Navigation, X, AlertCircle } from "lucide-react";
import type { HealthcareFacility } from "@shared/schema";

interface SearchResult extends HealthcareFacility {
  facility?: HealthcareFacility;
}

export default function HealthcareSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search facilities query
  const { data: searchData, error: searchError, isLoading } = useQuery({
    queryKey: [`/api/search-facilities?query=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length >= 2,
  });

  // Search history query
  const { data: historyData } = useQuery({
    queryKey: ["/api/search-history"],
  });

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: async (data: { facilityId: string; searchQuery: string }) => {
      const response = await apiRequest("POST", "/api/search-history", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-history"] });
    },
  });

  const facilities = (searchData as { facilities?: HealthcareFacility[] })?.facilities || [];

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isLoading) {
      setIsSearching(false);
    }
  }, [isLoading]);

  const handleFacilitySelect = useCallback((facility: HealthcareFacility) => {
    setSelectedFacility(facility);
    setSearchQuery(facility.name);
    setShowResults(false);
    
    // Save to search history
    saveSearchMutation.mutate({
      facilityId: facility.id,
      searchQuery: searchQuery,
    });
  }, [searchQuery, saveSearchMutation]);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setSelectedFacility(null);
    setShowResults(false);
    setDebouncedQuery("");
  }, []);

  const getFacilityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return <Hospital className="w-4 h-4" />;
      case 'pharmacy':
        return <PillBottle className="w-4 h-4" />;
      default:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getFacilityBadgeVariant = (type: string): "hospital" | "pharmacy" | "clinic" => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return 'hospital';
      case 'pharmacy':
        return 'pharmacy';
      default:
        return 'clinic';
    }
  };

  const handleGetDirections = () => {
    if (selectedFacility && selectedFacility.latitude && selectedFacility.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`;
      window.open(url, '_blank');
    } else if (selectedFacility) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedFacility.address)}`;
      window.open(url, '_blank');
    }
  };

  const handleSaveFacility = () => {
    if (selectedFacility) {
      toast({
        title: "Facility Saved",
        description: `${selectedFacility.name} has been saved to your locations.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Hospital className="text-medical-blue text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-slate-900">HealthFinder</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-slate-600 hover:text-medical-blue transition-colors">Search</a>
              <a href="#" className="text-slate-600 hover:text-medical-blue transition-colors">My Locations</a>
              <a href="#" className="text-slate-600 hover:text-medical-blue transition-colors">Help</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Interface */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-semibold text-slate-900">Find Healthcare Facilities</CardTitle>
            <CardDescription className="text-slate-600">Search for hospitals, pharmacies, and clinics in your area</CardDescription>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            {/* Search Input */}
            <div className="relative mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for hospitals, pharmacies, or clinics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-medical-blue focus:border-medical-blue"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                
                {/* Loading indicator */}
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-medical-blue animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-10">
                  {searchError && (
                    <div className="p-4 text-sm text-red-600 border-b border-slate-100">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Failed to search facilities. Please check your connection and try again.
                      </div>
                    </div>
                  )}
                  
                  {!isLoading && !searchError && facilities.length === 0 && debouncedQuery.length >= 2 && (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      No facilities found for "{debouncedQuery}". Try a different search term.
                    </div>
                  )}

                  {facilities.map((facility: HealthcareFacility) => (
                    <div
                      key={facility.id}
                      onClick={() => handleFacilitySelect(facility)}
                      className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <Badge variant={getFacilityBadgeVariant(facility.type)} className="mr-2">
                              {getFacilityIcon(facility.type)}
                              <span className="ml-1 capitalize">{facility.type}</span>
                            </Badge>
                            <h4 className="font-medium text-slate-900">{facility.name}</h4>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">{facility.address}</p>
                          <div className="flex items-center text-xs text-slate-500">
                            {facility.phone && (
                              <>
                                <Phone className="w-3 h-3 mr-1" />
                                <span>{facility.phone}</span>
                                <span className="mx-2">•</span>
                              </>
                            )}
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{facility.hours}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {facility.distance && (
                            <div className="text-sm font-medium text-slate-900">{facility.distance}</div>
                          )}
                          {facility.rating && (
                            <div className="flex items-center text-xs text-slate-500">
                              <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
                              <span>{facility.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-fill Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="facilityName" className="block text-sm font-medium text-slate-700 mb-2">
                  Facility Name
                </label>
                <Input
                  id="facilityName"
                  value={selectedFacility?.name || ""}
                  placeholder="Selected facility will appear here"
                  className="bg-slate-50"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="facilityType" className="block text-sm font-medium text-slate-700 mb-2">
                  Facility Type
                </label>
                <Input
                  id="facilityType"
                  value={selectedFacility?.type ? selectedFacility.type.charAt(0).toUpperCase() + selectedFacility.type.slice(1) : ""}
                  placeholder="Hospital, Pharmacy, or Clinic"
                  className="bg-slate-50"
                  readOnly
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="facilityAddress" className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <Input
                  id="facilityAddress"
                  value={selectedFacility?.address || ""}
                  placeholder="Full address will be auto-filled"
                  className="bg-slate-50"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="facilityPhone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <Input
                  id="facilityPhone"
                  value={selectedFacility?.phone || ""}
                  placeholder="Phone number will be auto-filled"
                  className="bg-slate-50"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="facilityHours" className="block text-sm font-medium text-slate-700 mb-2">
                  Operating Hours
                </label>
                <Input
                  id="facilityHours"
                  value={selectedFacility?.hours || ""}
                  placeholder="Hours will be auto-filled"
                  className="bg-slate-50"
                  readOnly
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
              <Button
                onClick={handleSaveFacility}
                disabled={!selectedFacility}
                className="flex-1 bg-medical-blue hover:bg-blue-700 text-white"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save Facility
              </Button>
              
              <Button
                onClick={handleGetDirections}
                disabled={!selectedFacility}
                className="flex-1 bg-healthcare-green hover:bg-green-700 text-white"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
              
              <Button
                onClick={handleClear}
                variant="secondary"
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        {(historyData as { history?: SearchResult[] })?.history && (historyData as { history?: SearchResult[] }).history!.length > 0 && (
          <Card className="mt-8 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Searches</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {((historyData as { history?: SearchResult[] })?.history || []).slice(0, 6).map((search: SearchResult) => (
                  <div
                    key={search.id}
                    onClick={() => search.facility && handleFacilitySelect(search.facility)}
                    className="border border-slate-200 rounded-lg p-4 hover:border-medical-blue cursor-pointer transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      {search.facility && (
                        <Badge variant={getFacilityBadgeVariant(search.facility.type)} className="mr-2">
                          {getFacilityIcon(search.facility.type)}
                          <span className="ml-1 capitalize">{search.facility.type}</span>
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500">
                        {search.createdAt && new Date(search.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {search.facility && (
                      <>
                        <h4 className="font-medium text-slate-900 mb-1">{search.facility.name}</h4>
                        <p className="text-sm text-slate-600">{search.facility.address?.split(',')[0]}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Hospital className="text-medical-blue text-xl mr-2" />
                <span className="font-semibold text-slate-900">HealthFinder</span>
              </div>
              <p className="text-sm text-slate-600">Find trusted healthcare facilities in your area quickly and easily.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-medical-blue transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-medical-blue transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Report an Issue</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

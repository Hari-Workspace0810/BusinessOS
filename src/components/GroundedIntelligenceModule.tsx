import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Film,
  Search,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Navigation,
  Compass,
  Play,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

export const GroundedIntelligenceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'maps' | 'video'>('search');

  // Search Grounding State
  const [searchQuery, setSearchQuery] = useState('Global enterprise SaaS ERP market trends 2025');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    text: string;
    sources: Array<{ title: string; uri: string }>;
    queries: string[];
  } | null>(null);

  // Maps Grounding State
  const [mapQuery, setMapQuery] = useState('Major air cargo logistics hubs and fulfillment centers in Frankfurt');
  const [isMapping, setIsMapping] = useState(false);
  const [mapResult, setMapResult] = useState<{
    text: string;
    places: Array<{ title: string; uri: string }>;
  } | null>(null);

  // Video Storyboard State
  const [videoTheme, setVideoTheme] = useState('BusinessOS Autonomous Drone Supply Chain & Warehousing');
  const [videoAudience, setVideoAudience] = useState('Enterprise Chief Operating Officers (COOs)');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStoryboard, setVideoStoryboard] = useState<{
    title: string;
    scenes: Array<{
      sceneNumber: number;
      duration: string;
      visualPrompt: string;
      audioNarration: string;
      cameraMovement: string;
    }>;
  } | null>(null);

  // Execute Search Grounding
  const handleExecuteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchGrounding(searchQuery);
      setSearchResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Execute Maps Grounding
  const handleExecuteMaps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapQuery.trim()) return;
    setIsMapping(true);
    try {
      const res = await api.mapsGrounding(mapQuery);
      setMapResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsMapping(false);
    }
  };

  // Execute Video Script Generation
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTheme.trim()) return;
    setIsGeneratingVideo(true);
    try {
      const res = await api.generateVideoScript(videoTheme, videoAudience, 15);
      setVideoStoryboard(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Grounded AI Intelligence & Omni Studio
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Google Search Grounding · Google Maps Geospatial Verification · Video Prompt Storyboarding
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Google Search Grounding
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'maps'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Google Maps Grounding
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Omni / Veo Video Storyboard
          </button>
        </div>
      </div>

      {/* TAB 1: GOOGLE SEARCH GROUNDING */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Real-Time Market Search Grounding
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Queries live Google Search web indexes to verify current events, regulatory mandates, and market valuations.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
                gemini-3.8-flash · googleSearch
              </span>
            </div>

            <form onSubmit={handleExecuteSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask about live market data, tax regulations, competitor valuations..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Run Grounded Search
              </button>
            </form>

            {/* Quick suggested chips */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
              <span className="text-slate-500">Suggested queries:</span>
              {[
                'Global supply chain bottlenecks 2025',
                'Enterprise AI SaaS valuation multiples',
                'EU CSRD corporate ESG reporting directives',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSearchQuery(chip)}
                  className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Display */}
          {searchResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Grounded Response (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Verified Executive Briefing</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Grounded with Google Search
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {searchResult.text}
                </div>
              </div>

              {/* Verified Sources & Citations (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  <span>Grounding Sources ({searchResult.sources.length})</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Web references verified during neural generation:
                </p>

                <div className="space-y-2">
                  {searchResult.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-950 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-sky-400 line-clamp-1">
                          {src.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-400 shrink-0 ml-1.5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 line-clamp-1 mt-1 block">
                        {src.uri}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOOGLE MAPS GROUNDING */}
      {activeTab === 'maps' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Logistics & Supplier Geospatial Grounding
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grounds warehouse locations, intermodal freight hubs, and supplier corridors with Google Maps data.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                gemini-3.8-flash · googleMaps
              </span>
            </div>

            <form onSubmit={handleExecuteMaps} className="flex gap-2">
              <input
                type="text"
                value={mapQuery}
                onChange={(e) => setMapQuery(e.target.value)}
                placeholder="Search freight corridor, seaport terminals, warehouse parks..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isMapping}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isMapping ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                Ground with Maps
              </button>
            </form>

            {/* Suggested location chips */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
              <span className="text-slate-500">Logistics regions:</span>
              {[
                'JNPT Port Nhava Sheva logistics container terminal',
                'Rotterdam port intermodal automated container hub',
                'Chicago O Hare air freight logistics park',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setMapQuery(chip)}
                  className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Maps Grounding Results */}
          {mapResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Geographic Infrastructure Analysis</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Google Maps Grounded
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {mapResult.text}
                </div>
              </div>

              {/* Places & Verified Maps Links */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Google Maps Locations</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Direct navigation links extracted from grounding metadata:
                </p>

                <div className="space-y-2">
                  {mapResult.places.map((place, idx) => (
                    <a
                      key={idx}
                      href={place.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-950 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 line-clamp-1">
                          {place.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1.5" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400/90 mt-1 block">
                        Open in Google Maps →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OMNI / VEO VIDEO STORYBOARD */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Film className="w-4 h-4 text-purple-400" />
                  Omni & Veo Video Production Storyboard
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generates cinematic camera directives, narration scripts, and visual prompts designed for Veo and Gemini Omni models.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                gemini-omni-1.1-flash & Veo Studio
              </span>
            </div>

            <form onSubmit={handleGenerateVideo} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="text-[11px] text-slate-400 block mb-1">Commercial Theme / Product</label>
                <input
                  type="text"
                  value={videoTheme}
                  onChange={(e) => setVideoTheme(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="text-[11px] text-slate-400 block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={videoAudience}
                  onChange={(e) => setVideoAudience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={isGeneratingVideo}
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingVideo ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                  Generate
                </button>
              </div>
            </form>
          </div>

          {/* Video Storyboard Display */}
          {videoStoryboard && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {videoStoryboard.title}
                </h3>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  {videoStoryboard.scenes.length} Scenes · 15s Total
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {videoStoryboard.scenes.map((scene) => (
                  <div
                    key={scene.sceneNumber}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-purple-400 font-bold">
                          SCENE {scene.sceneNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                          {scene.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug mb-2">
                        "{scene.visualPrompt}"
                      </p>
                      <div className="text-[11px] text-slate-400 italic bg-slate-900/60 rounded p-2 border border-slate-800/60">
                        VO: "{scene.audioNarration}"
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                      <Film className="w-3 h-3 text-purple-400" />
                      <span>{scene.cameraMovement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default GroundedIntelligenceModule;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { directoryApi } from '@/lib/api';
import { Search, Building2, MapPin, Users, Filter, ChevronLeft, ChevronRight, Rocket, Sprout, TrendingUp, Expand, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  PRE_STARTUP: 'Pre-Startup',
  STARTUP:     'Startup',
  GROWTH:      'Growth',
  EXPANSION:   'Expansion',
  MATURE:      'Mature',
};

const STAGE_COLORS: Record<string, string> = {
  PRE_STARTUP: 'bg-gray-100 text-gray-700',
  STARTUP:     'bg-blue-100 text-blue-700',
  GROWTH:      'bg-green-100 text-green-700',
  EXPANSION:   'bg-purple-100 text-purple-700',
  MATURE:      'bg-amber-100 text-amber-700',
};

const STAGE_CARD_STYLES: Record<string, { bg: string; border: string; icon: string; active: string }> = {
  PRE_STARTUP: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-500', active: 'ring-2 ring-gray-400 border-gray-400' },
  STARTUP:     { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', active: 'ring-2 ring-blue-400 border-blue-400' },
  GROWTH:      { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', active: 'ring-2 ring-green-400 border-green-400' },
  EXPANSION:   { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', active: 'ring-2 ring-purple-400 border-purple-400' },
  MATURE:      { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', active: 'ring-2 ring-amber-400 border-amber-400' },
};

const STAGE_ICONS: Record<string, LucideIcon> = {
  PRE_STARTUP: Sprout,
  STARTUP:     Rocket,
  GROWTH:      TrendingUp,
  EXPANSION:   Expand,
  MATURE:      Award,
};

export function DirectoryPage() {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);

  const { data: sectorsData } = useQuery({
    queryKey: ['directory-sectors'],
    queryFn: () => directoryApi.getSectors(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['directory-stats'],
    queryFn: () => directoryApi.getStats(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['directory-enterprises', search, sector, stage, page],
    queryFn: () => directoryApi.searchEnterprises({ search, sector, stage, page, limit: 12 }),
  });

  const enterprises = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;
  const sectors = Array.isArray((sectorsData as any)?.data) ? (sectorsData as any).data : [];
  const stats = (statsData as any)?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-dti-blue to-dti-blue-light text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-dti-orange font-semibold text-sm tracking-widest uppercase mb-2">
              Enterprise Directory
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
              Central Visayas MSME Directory
            </h1>
            <p className="text-blue-100 text-base leading-relaxed">
              Browse verified enterprises across Central Visayas. Discover MSMEs by industry sector,
              business stage, and location.
            </p>
          </div>

          {/* Stats bar */}
          {stats && (
            <div className="mt-8">
              <span className="text-3xl font-bold">{stats.totalListed}</span>
              <span className="text-blue-200 text-base ml-2">Verified Enterprises</span>
            </div>
          )}
        </div>
      </section>

      {/* Stage filter cards */}
      {stats?.byStage && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.keys(STAGE_LABELS).map((key) => {
              const count = (stats.byStage as Record<string, number>)[key] ?? 0;
              const style = STAGE_CARD_STYLES[key];
              const Icon = STAGE_ICONS[key];
              const isActive = stage === key;
              return (
                <button
                  key={key}
                  onClick={() => { setStage(isActive ? '' : key); setPage(1); }}
                  className={`${style.bg} border ${isActive ? style.active : style.border} rounded-xl px-4 py-3 text-left transition-all hover:shadow-md cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon size={18} className={`${style.icon} transition-transform group-hover:scale-110`} />
                    <span className="text-xl font-bold text-gray-900">{count}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600">{STAGE_LABELS[key]}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Search + Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search enterprises by name or sector..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-dti-blue focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={sector}
                onChange={(e) => { setSector(e.target.value); setPage(1); }}
                className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 text-sm bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-dti-blue"
              >
                <option value="">All Sectors</option>
                {sectors.map((s: any) => (
                  <option key={s.sector} value={s.sector}>
                    {s.sector} ({s.count})
                  </option>
                ))}
              </select>
            </div>
            {stage && (
              <button
                type="button"
                onClick={() => { setStage(''); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-300 text-sm bg-white hover:bg-gray-50"
              >
                <span className={`inline-block w-2 h-2 rounded-full ${STAGE_COLORS[stage]?.split(' ')[0] ?? 'bg-gray-400'}`} />
                {STAGE_LABELS[stage]}
                <span className="text-gray-400 ml-0.5">&times;</span>
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-card p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : enterprises.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No enterprises found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || sector || stage
                ? 'Try adjusting your search or filters.'
                : 'No publicly listed enterprises yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {enterprises.length} of {meta?.total ?? 0} enterprises
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enterprises.map((ent: any) => (
                <div key={ent.id} className="bg-white rounded-xl shadow-card p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{ent.businessName}</h3>
                      {ent.tradeName && (
                        <p className="text-xs text-gray-400 truncate">d/b/a {ent.tradeName}</p>
                      )}
                    </div>
                    {ent.stage && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${STAGE_COLORS[ent.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STAGE_LABELS[ent.stage] ?? ent.stage}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    {ent.industrySector && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">{ent.industrySector}</span>
                      </div>
                    )}
                    {(ent.cityMunicipality || ent.province || ent.region) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">
                          {[ent.cityMunicipality, ent.province, ent.region].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {ent.employeeCount != null && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={13} className="text-gray-400 shrink-0" />
                        <span>{ent.employeeCount} employee{ent.employeeCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {ent.industryTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {ent.industryTags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {ent.industryTags.length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{ent.industryTags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

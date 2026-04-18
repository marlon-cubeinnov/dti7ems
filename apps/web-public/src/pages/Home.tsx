import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@dti-ems/shared-types';

export function HomePage() {
  const { data } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsApi.list({ upcoming: true, limit: 6 }),
  });

  const events = (data?.data as unknown as (Event & { _count: { participations: number } })[]) ?? [];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-dti-blue to-dti-blue-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-dti-orange font-semibold text-sm tracking-widest uppercase mb-3">
              DTI Region 7 — Central Visayas
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
              Empowering MSMEs<br />in Central Visayas
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Join training programs, seminars, and capability-building events designed
              to grow your business — from startup to expansion.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/events" className="btn-accent px-6 py-3 text-base">
                Browse Events
              </Link>
              <Link to="/register" className="btn bg-white text-dti-blue hover:bg-blue-50 px-6 py-3 text-base">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Events Conducted', value: '250+' },
              { label: 'MSMEs Trained',    value: '15,000+' },
              { label: 'Provinces Reached', value: '6' },
              { label: 'Industry Sectors', value: '12' },
            ].map((stat) => (
              <div key={stat.label} className="p-4">
                <dt className="text-3xl font-extrabold text-dti-blue">{stat.value}</dt>
                <dd className="text-sm text-gray-500 mt-1">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Upcoming events ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <Link to="/events" className="text-dti-blue font-medium text-sm hover:underline">
            View all →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No upcoming events at the moment. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} participantCount={event._count?.participations ?? 0} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-dti-orange text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
          <p className="text-orange-100 mb-8 max-w-xl mx-auto">
            Register once and get pre-filled for all future events. Track your attendance,
            earn certificates, and access 6-month impact reports.
          </p>
          <Link to="/register" className="btn bg-white text-dti-orange hover:bg-orange-50 px-8 py-3 text-base font-bold">
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </>
  );
}

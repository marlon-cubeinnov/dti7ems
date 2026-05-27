import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, ApiError } from '@/lib/api';
import { AlertCircle, CheckCircle2, Search } from 'lucide-react';

// ── Philippines geographic data ──────────────────────────────────────────────
const PH_REGIONS = [
  'Region VII — Central Visayas',
  'NCR — National Capital Region',
  'CAR — Cordillera Administrative Region',
  'Region I — Ilocos Region',
  'Region II — Cagayan Valley',
  'Region III — Central Luzon',
  'Region IV-A — CALABARZON',
  'Region IV-B — MIMAROPA',
  'Region V — Bicol Region',
  'Region VI — Western Visayas',
  'Region VIII — Eastern Visayas',
  'Region IX — Zamboanga Peninsula',
  'Region X — Northern Mindanao',
  'Region XI — Davao Region',
  'Region XII — SOCCSKSARGEN',
  'Region XIII — Caraga',
  'BARMM',
];

// Region VII provinces and their cities/municipalities
const REGION7_PROVINCES: Record<string, string[]> = {
  'Cebu': [
    'Alcantara', 'Alcoy', 'Alegria', 'Aloguinsan', 'Argao', 'Asturias', 'Badian',
    'Balamban', 'Bantayan', 'Barili', 'Bogo City', 'Boljoon', 'Borbon', 'Carcar City',
    'Carmen', 'Catmon', 'Cebu City', 'Compostela', 'Consolacion', 'Cordova', 'Daanbantayan',
    'Dalaguete', 'Danao City', 'Dumanjug', 'Ginatilan', 'Lapu-Lapu City', 'Liloan',
    'Madridejos', 'Malabuyoc', 'Mandaue City', 'Medellin', 'Minglanilla', 'Moalboal',
    'Naga City', 'Oslob', 'Pilar', 'Pinamungajan', 'Poro', 'Ronda', 'Samboan',
    'San Fernando', 'San Francisco', 'San Remigio', 'Santa Fe', 'Santander', 'Sibonga',
    'Sogod', 'Tabogon', 'Tabuelan', 'Talisay City', 'Toledo City', 'Tuburan', 'Tudela',
  ],
  'Bohol': [
    'Alburquerque', 'Alicia', 'Anda', 'Antequera', 'Baclayon', 'Balilihan', 'Batuan',
    'Bien Unido', 'Bilar', 'Buenavista', 'Calape', 'Candijay', 'Carmen', 'Catigbian',
    'Clarin', 'Corella', 'Cortes', 'Dagohoy', 'Danao', 'Dauis', 'Dimiao', 'Duero',
    'Garcia Hernandez', 'Getafe', 'Guindulman', 'Inabanga', 'Jagna', 'Lila', 'Loay',
    'Loboc', 'Loon', 'Mabini', 'Maribojoc', 'Panglao', 'Pilar', 'Presidente Carlos P. Garcia',
    'Sagbayan', 'San Isidro', 'San Miguel', 'Sevilla', 'Sierra Bullones', 'Sikatuna',
    'Tagbilaran City', 'Talibon', 'Trinidad', 'Tubigon', 'Ubay', 'Valencia',
  ],
  'Negros Oriental': [
    'Amlan', 'Ayungon', 'Bacong', 'Bais City', 'Basay', 'Bayawan City', 'Bindoy',
    'Canlaon City', 'Dauin', 'Dumaguete City', 'Guihulngan City', 'Jimalalud',
    'La Libertad', 'Mabinay', 'Manjuyod', 'Pamplona', 'San Jose', 'Santa Catalina',
    'Siaton', 'Sibulan', 'Tanjay City', 'Tayasan', 'Valencia', 'Vallehermoso', 'Zamboanguita',
  ],
  'Siquijor': [
    'Enrique Villanueva', 'Larena', 'Lazi', 'Maria', 'San Juan', 'Siquijor',
  ],
};

const REGION7_KEY = 'Region VII — Central Visayas';

// ── Constants ────────────────────────────────────────────────────────────────
type EmploymentCategory = 'SELF_EMPLOYED' | 'EMPLOYED_GOVT' | 'EMPLOYED_PRIVATE' | 'GENERAL_PUBLIC';
type SocialClass = 'ABLED' | 'PWD' | 'FOUR_PS' | 'YOUTH' | 'SENIOR_CITIZEN' | 'INDIGENOUS_PERSON' | 'OFW' | 'OTHERS';

const EMPLOYMENT_OPTIONS: { value: EmploymentCategory; label: string; desc: string }[] = [
  { value: 'SELF_EMPLOYED', label: 'Self Employed', desc: 'Business owner / freelancer / entrepreneur' },
  { value: 'EMPLOYED_GOVT', label: 'Employed — Government', desc: 'LGU, national agency, or gov\'t-owned entity' },
  { value: 'EMPLOYED_PRIVATE', label: 'Employed — Private', desc: 'Private sector employee' },
  { value: 'GENERAL_PUBLIC', label: 'General / Public', desc: 'Student, homemaker, unemployed, or other' },
];

const SOCIAL_CLASS_OPTIONS: { value: SocialClass; label: string }[] = [
  { value: 'ABLED', label: 'Abled Person' },
  { value: 'PWD', label: 'Person with Disability (PWD)' },
  { value: 'FOUR_PS', label: '4Ps Beneficiary' },
  { value: 'YOUTH', label: 'Youth (15–30 years old)' },
  { value: 'SENIOR_CITIZEN', label: 'Senior Citizen (60+)' },
  { value: 'INDIGENOUS_PERSON', label: 'Indigenous Person (IP)' },
  { value: 'OFW', label: 'Overseas Filipino Worker (OFW)' },
  { value: 'OTHERS', label: 'Others' },
];

const SUFFIXES = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

// ── Company autocomplete ─────────────────────────────────────────────────────
interface CompanySuggestion {
  id: string;
  businessName: string;
  region: string | null;
  province: string | null;
  cityMunicipality: string | null;
}

function CompanySearchInput({
  value,
  onChange,
  onSelect,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (c: CompanySuggestion | null) => void;
  disabled?: boolean;
  error?: string;
}) {
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (v: string) => {
    onChange(v);
    onSelect(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await authApi.searchCompanies(v.trim());
        setSuggestions((res as any)?.data ?? []);
        setOpen(true);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 300);
  };

  const pick = (c: CompanySuggestion) => {
    onChange(c.businessName);
    onSelect(c);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          disabled={disabled}
          placeholder="Type company / office name…"
          className={`input pl-8 ${error ? 'border-red-400 focus:ring-red-200' : ''}`}
        />
        {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Searching…</span>}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map(c => (
            <li key={c.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 text-sm"
                onMouseDown={() => pick(c)}
              >
                <p className="font-medium text-gray-900">{c.businessName}</p>
                {(c.cityMunicipality || c.province || c.region) && (
                  <p className="text-xs text-gray-400">
                    {[c.cityMunicipality, c.province, c.region].filter(Boolean).join(', ')}
                  </p>
                )}
              </button>
            </li>
          ))}
          {value.trim() && (
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-green-50 text-sm text-green-700 border-t"
                onMouseDown={() => { onSelect(null); setOpen(false); }}
              >
                + Add <strong>"{value.trim()}"</strong> as new company
              </button>
            </li>
          )}
        </ul>
      )}
      {open && suggestions.length === 0 && value.trim().length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-sm text-gray-500">
          No match found — <strong>"{value.trim()}"</strong> will be added as a new company.
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function RegisterPage() {
  useNavigate();
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  // Personal info
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameSuffix, setNameSuffix] = useState('');
  const [sex, setSex] = useState<'MALE' | 'FEMALE' | ''>('');
  const [birthdate, setBirthdate] = useState('');

  // Classification
  const [category, setCategory] = useState<EmploymentCategory | ''>('');
  const [socialClass, setSocialClass] = useState<SocialClass | ''>('');

  // Employer/company info
  const [companyName, setCompanyName] = useState('');
  const [companyRegion, setCompanyRegion] = useState('');
  const [companyProvince, setCompanyProvince] = useState('');
  const [companyCityMunicipality, setCompanyCityMunicipality] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Account
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dpa, setDpa] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const showEmployer = category === 'EMPLOYED_GOVT' || category === 'EMPLOYED_PRIVATE';
  const showCompany = showEmployer || category === 'SELF_EMPLOYED';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e['firstName'] = 'First name is required';
    if (!lastName.trim()) e['lastName'] = 'Last name is required';
    if (!sex) e['sex'] = 'Sex is required';
    if (!birthdate) e['birthdate'] = 'Birthdate is required';
    if (!category) e['category'] = 'Category is required';
    if (!socialClass) e['socialClass'] = 'Social classification is required';
    if (showCompany && !companyName.trim()) e['companyName'] = 'Company / office name is required';
    if (!email.includes('@')) e['email'] = 'Valid email is required';
    if (password.length < 10) e['password'] = 'Password must be at least 10 characters';
    if (!/[A-Z]/.test(password)) e['password'] = (e['password'] ? e['password'] + ', ' : '') + 'must contain an uppercase letter';
    if (!/[0-9]/.test(password)) e['password'] = (e['password'] ? e['password'] + ' and ' : '') + 'must contain a number';
    if (password !== confirmPassword) e['confirmPassword'] = 'Passwords do not match';
    if (!dpa) e['dpa'] = 'You must agree to the data privacy policy to register';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        email,
        password,
        firstName,
        middleName: middleName || null,
        lastName,
        nameSuffix: nameSuffix || null,
        sex: sex || null,
        birthdate: birthdate || null,
        mobileNumber: mobile || null,
        employmentCategory: category || null,
        socialClassification: socialClass || null,
        companyName: showCompany ? (companyName || null) : null,
        companyRegion: showCompany ? (companyRegion || null) : null,
        companyProvince: showCompany ? (companyProvince || null) : null,
        companyCityMunicipality: showCompany ? (companyCityMunicipality || null) : null,
        companyEmail: showEmployer ? (companyEmail || null) : null,
        companyPhone: showEmployer ? (companyPhone || null) : null,
        jobTitle: showCompany ? (jobTitle || null) : null,
        dpaConsentGiven: true,
      }),
    onSuccess: () => {
      setSuccessEmail(email);
      setSuccess(true);
    },
    onError: (err) => {
      if (err instanceof ApiError) setErrors({ api: err.message });
      else setErrors({ api: 'Registration failed. Please try again.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    registerMutation.mutate();
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 text-sm mb-3">
            We sent a verification link to <strong>{successEmail}</strong>.
            Please check your inbox and click the link to activate your account.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 text-left mb-4">
            <p className="font-semibold mb-1">Pending DTI Region 7 Approval</p>
            <p>After verifying your email, your account will be reviewed and approved by DTI Region 7 staff. You will receive a notification once your account is active.</p>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Local dev environment?{' '}
            <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-dti-blue hover:underline">
              Check Mailpit (localhost:8025)
            </a>
          </p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Register once — pre-filled for all DTI Region 7 events.</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* ── Section 1: Personal Information ── */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">First Name *</label>
                  <input className={`input ${errors['firstName'] ? 'border-red-400' : ''}`} value={firstName}
                    onChange={e => setFirstName(e.target.value)} placeholder="Given name" />
                  {errors['firstName'] && <p className="text-red-500 text-xs mt-1">{errors['firstName']}</p>}
                </div>
                <div>
                  <label className="label">Middle Name</label>
                  <input className="input" value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input className={`input ${errors['lastName'] ? 'border-red-400' : ''}`} value={lastName}
                    onChange={e => setLastName(e.target.value)} placeholder="Family name" />
                  {errors['lastName'] && <p className="text-red-500 text-xs mt-1">{errors['lastName']}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Name Suffix</label>
                  <select className="input" value={nameSuffix} onChange={e => setNameSuffix(e.target.value)}>
                    {SUFFIXES.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Sex *</label>
                  <select className={`input ${errors['sex'] ? 'border-red-400' : ''}`} value={sex}
                    onChange={e => setSex(e.target.value as 'MALE' | 'FEMALE' | '')}>
                    <option value="">Select…</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  {errors['sex'] && <p className="text-red-500 text-xs mt-1">{errors['sex']}</p>}
                </div>
                <div>
                  <label className="label">Birthdate *</label>
                  <input type="date" className={`input ${errors['birthdate'] ? 'border-red-400' : ''}`} value={birthdate}
                    onChange={e => setBirthdate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} />
                  {errors['birthdate'] && <p className="text-red-500 text-xs mt-1">{errors['birthdate']}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Classification ── */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Classification</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Category *</label>
                <select
                  className={`input ${errors['category'] ? 'border-red-400' : ''}`}
                  value={category}
                  onChange={e => setCategory(e.target.value as EmploymentCategory | '')}
                >
                  <option value="">Select category…</option>
                  {EMPLOYMENT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors['category'] && <p className="text-red-500 text-xs mt-1">{errors['category']}</p>}
              </div>

              <div>
                <label className="label">Social Classification *</label>
                <select
                  className={`input ${errors['socialClass'] ? 'border-red-400' : ''}`}
                  value={socialClass}
                  onChange={e => setSocialClass(e.target.value as SocialClass | '')}
                >
                  <option value="">Select classification…</option>
                  {SOCIAL_CLASS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors['socialClass'] && <p className="text-red-500 text-xs mt-1">{errors['socialClass']}</p>}
              </div>
            </div>
          </section>

          {/* ── Section 3: Company / Office (conditional) ── */}
          {showCompany && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category === 'SELF_EMPLOYED' ? 'Business Information' : 'Company / Office Information'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label">
                    {category === 'SELF_EMPLOYED' ? 'Business Name *' : 'Company / Office Name *'}
                  </label>
                  <CompanySearchInput
                    value={companyName}
                    onChange={setCompanyName}
                    onSelect={c => {
                      if (c) {
                        setCompanyRegion(c.region ?? '');
                        setCompanyProvince(c.province ?? '');
                        setCompanyCityMunicipality(c.cityMunicipality ?? '');
                      }
                    }}
                    error={errors['companyName']}
                  />
                  {errors['companyName'] && <p className="text-red-500 text-xs mt-1">{errors['companyName']}</p>}
                  <p className="text-xs text-gray-400 mt-1">Search existing companies or type to add a new one.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label">Region</label>
                    <select className="input text-sm" value={companyRegion} onChange={e => {
                      setCompanyRegion(e.target.value);
                      setCompanyProvince('');
                      setCompanyCityMunicipality('');
                    }}>
                      <option value="">Select…</option>
                      {PH_REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Province</label>
                    {companyRegion === REGION7_KEY ? (
                      <select className="input text-sm" value={companyProvince} onChange={e => {
                        setCompanyProvince(e.target.value);
                        setCompanyCityMunicipality('');
                      }}>
                        <option value="">Select province…</option>
                        {Object.keys(REGION7_PROVINCES).map(p => <option key={p}>{p}</option>)}
                      </select>
                    ) : (
                      <input className="input text-sm" value={companyProvince} onChange={e => setCompanyProvince(e.target.value)} placeholder="e.g., Cebu" />
                    )}
                  </div>
                  <div>
                    <label className="label">City / Municipality</label>
                    {companyRegion === REGION7_KEY && companyProvince ? (
                      <select className="input text-sm" value={companyCityMunicipality} onChange={e => setCompanyCityMunicipality(e.target.value)}>
                        <option value="">Select city / municipality…</option>
                        {(REGION7_PROVINCES[companyProvince] ?? []).map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input className="input text-sm" value={companyCityMunicipality} onChange={e => setCompanyCityMunicipality(e.target.value)} placeholder="e.g., Cebu City"
                        disabled={companyRegion === REGION7_KEY && !companyProvince} />
                    )}
                  </div>
                </div>

                {showEmployer && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Company Email Address</label>
                      <input type="email" className="input text-sm" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="office@company.com" />
                    </div>
                    <div>
                      <label className="label">Company Contact Number</label>
                      <input type="tel" className="input text-sm" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="(032) 000-0000" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">{category === 'SELF_EMPLOYED' ? 'Your Role / Position' : 'Job Title / Designation'}</label>
                  <input className="input text-sm" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Owner, Marketing Manager, Bookkeeper" />
                </div>
              </div>
            </section>
          )}

          {/* ── Section 4: Account Credentials ── */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Email Address *</label>
                  <input type="email" autoComplete="email" className={`input ${errors['email'] ? 'border-red-400' : ''}`}
                    value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                  {errors['email'] && <p className="text-red-500 text-xs mt-1">{errors['email']}</p>}
                </div>
                <div>
                  <label className="label">Mobile Number</label>
                  <input type="tel" className="input" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="09XX XXX XXXX" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Password *</label>
                  <input type="password" autoComplete="new-password" className={`input ${errors['password'] ? 'border-red-400' : ''}`}
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 10 characters" />
                  {errors['password'] && <p className="text-red-500 text-xs mt-1">{errors['password']}</p>}
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input type="password" autoComplete="new-password" className={`input ${errors['confirmPassword'] ? 'border-red-400' : ''}`}
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
                  {errors['confirmPassword'] && <p className="text-red-500 text-xs mt-1">{errors['confirmPassword']}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* ── DPA Consent ── */}
          <div className="bg-blue-50 rounded-card p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 accent-dti-blue"
                checked={dpa}
                onChange={e => setDpa(e.target.checked)}
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                <strong>Data Privacy Consent (RA 10173)</strong><br />
                I consent to the Department of Trade and Industry Region 7 collecting, storing, and
                processing my personal information for the purpose of managing my event participation,
                issuing certificates, and conducting post-event impact surveys. I understand I can
                withdraw consent at any time by contacting DTI Region 7.
              </span>
            </label>
            {errors['dpa'] && <p className="text-red-500 text-xs mt-2">{errors['dpa']}</p>}
          </div>

          {errors['api'] && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-input p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors['api']}</span>
            </div>
          )}

          <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full py-3 text-base">
            {registerMutation.isPending ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-dti-blue font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}


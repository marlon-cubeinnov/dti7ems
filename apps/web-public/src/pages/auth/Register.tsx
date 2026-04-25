import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, ApiError } from '@/lib/api';
import { AlertCircle, CheckCircle2, Plus, Trash2, Building2, User, Landmark, Users } from 'lucide-react';

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

const INDUSTRY_SECTORS = [
  'Manufacturing',
  'Services',
  'Trading / Retail',
  'Food & Beverage',
  'Agriculture & Fisheries',
  'Technology / IT',
  'Tourism & Hospitality',
  'Construction',
  'Education & Training',
  'Healthcare',
  'Transportation & Logistics',
  'Handicrafts',
  'Creative Industries',
  'Startup / Innovation Ecosystem',
  'Other',
];

type RegType = 'individual' | 'government' | 'ngo' | 'business';

interface EmployeeRow {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [regType, setRegType] = useState<RegType>('individual');
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [employeesInvited, setEmployeesInvited] = useState(0);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    region: 'Region VII — Central Visayas',
    dpaConsentGiven: false as true | false,
  });

  const [bizForm, setBizForm] = useState({
    businessName: '',
    industrySector: '',
    tradeName: '',
    registrationNo: '',
    tinNumber: '',
    stage: 'STARTUP' as string,
    employeeCount: '',
  });

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e['firstName'] = 'First name is required';
    if (!form.lastName.trim()) e['lastName'] = 'Last name is required';
    if (!form.email.includes('@')) e['email'] = 'Valid email is required';
    if (form.password.length < 10) e['password'] = 'Password must be at least 10 characters';
    if (!/[A-Z]/.test(form.password)) e['password'] = 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) e['password'] = (e['password'] ? e['password'] + ' and ' : '') + 'a number';
    if (form.password !== form.confirmPassword) e['confirmPassword'] = 'Passwords do not match';
    if (!form.dpaConsentGiven) e['dpa'] = 'You must agree to the data privacy policy to register';

    if (regType === 'business' || regType === 'ngo') {
      if (!bizForm.businessName.trim()) e['businessName'] = regType === 'ngo' ? 'Organization name is required' : 'Business name is required';
      if (!bizForm.industrySector) e['industrySector'] = 'Industry sector is required';

      employees.forEach((emp, i) => {
        if (!emp.email.includes('@')) e[`emp_${i}_email`] = 'Valid email required';
        if (!emp.firstName.trim()) e[`emp_${i}_firstName`] = 'First name required';
        if (!emp.lastName.trim()) e[`emp_${i}_lastName`] = 'Last name required';
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const individualMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        mobileNumber: form.mobileNumber || null,
        dpaConsentGiven: true,
        clientType: regType === 'government' ? 'GOVERNMENT' : 'CITIZEN',
      }),
    onSuccess: () => {
      setSuccessEmail(form.email);
      setSuccess(true);
    },
    onError: (err) => {
      if (err instanceof ApiError) setErrors({ api: err.message });
      else setErrors({ api: 'Registration failed. Please try again.' });
    },
  });

  const ngoMutation = useMutation({
    mutationFn: () =>
      authApi.registerBusiness({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        mobileNumber: form.mobileNumber || null,
        dpaConsentGiven: true,
        enterprise: {
          businessName: bizForm.businessName,
          industrySector: bizForm.industrySector,
          tradeName: bizForm.tradeName || null,
          registrationNo: bizForm.registrationNo || null,
          stage: 'STARTUP',
          region: form.region || null,
        },
        employees: employees.filter((emp) => emp.email.trim()),
      }),
    onSuccess: (res) => {
      setSuccessEmail(form.email);
      setEmployeesInvited((res as any)?.data?.employeesInvited ?? employees.length);
      setSuccess(true);
    },
    onError: (err) => {
      if (err instanceof ApiError) setErrors({ api: err.message });
      else setErrors({ api: 'Registration failed. Please try again.' });
    },
  });

  const businessMutation = useMutation({
    mutationFn: () =>
      authApi.registerBusiness({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        mobileNumber: form.mobileNumber || null,
        dpaConsentGiven: true,
        enterprise: {
          businessName: bizForm.businessName,
          industrySector: bizForm.industrySector,
          tradeName: bizForm.tradeName || null,
          registrationNo: bizForm.registrationNo || null,
          tinNumber: bizForm.tinNumber || null,
          stage: bizForm.stage,
          employeeCount: bizForm.employeeCount ? parseInt(bizForm.employeeCount, 10) : null,
          region: form.region || null,
        },
        employees: employees.filter((emp) => emp.email.trim()),
      }),
    onSuccess: (res) => {
      setSuccessEmail(form.email);
      setEmployeesInvited((res as any)?.data?.employeesInvited ?? employees.length);
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
    if (regType === 'individual' || regType === 'government') individualMutation.mutate();
    else if (regType === 'ngo') ngoMutation.mutate();
    else businessMutation.mutate();
  };

  const isPending = individualMutation.isPending || businessMutation.isPending || ngoMutation.isPending;

  const addEmployee = () => setEmployees([...employees, { email: '', firstName: '', lastName: '', jobTitle: '' }]);
  const removeEmployee = (i: number) => setEmployees(employees.filter((_, idx) => idx !== i));
  const updateEmployee = (i: number, field: keyof EmployeeRow, value: string) => {
    const updated = [...employees];
    updated[i] = { ...updated[i], [field]: value };
    setEmployees(updated);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 text-sm mb-4">
            We sent a verification link to <strong>{successEmail}</strong>.
            Please check your inbox and click the link to activate your account.
          </p>
          {employeesInvited > 0 && (
            <p className="text-gray-600 text-sm mb-4">
              <strong>{employeesInvited} employee invitation(s)</strong> have been sent.
              They will receive an email to set up their accounts.
            </p>
          )}
          <p className="text-xs text-gray-500 mb-4">
            Using a local dev environment? Check{' '}
            <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-dti-blue hover:underline">
              Mailpit (localhost:8025)
            </a>{' '}
            for the email.
          </p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  const field = (name: string) => ({
    value: form[name as keyof typeof form] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [name]: e.target.value }),
    className: `input ${errors[name] ? 'border-red-400 focus:ring-red-200' : ''}`,
  });

  const bizField = (name: string) => ({
    value: bizForm[name as keyof typeof bizForm] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setBizForm({ ...bizForm, [name]: e.target.value }),
    className: `input ${errors[name] ? 'border-red-400 focus:ring-red-200' : ''}`,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Register once — pre-filled for all DTI Region 7 events.</p>

        {/* Registration type tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {([
            { type: 'individual', icon: <User className="w-4 h-4" />, label: 'Individual / Citizen', desc: 'General public, student, or professional' },
            { type: 'government', icon: <Landmark className="w-4 h-4" />, label: 'Government Employee', desc: 'LGU, agency, or gov\'t staff' },
            { type: 'ngo', icon: <Users className="w-4 h-4" />, label: 'NGO / Organization', desc: 'Non-profit, cooperative, or association' },
            { type: 'business', icon: <Building2 className="w-4 h-4" />, label: 'Business / MSME', desc: 'DTI-registered enterprise or startup' },
          ] as const).map(({ type, icon, label, desc }) => (
            <button
              key={type}
              type="button"
              onClick={() => setRegType(type)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-colors ${
                regType === type
                  ? 'border-dti-blue bg-dti-blue/5 text-dti-blue'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-1.5">{icon}{label}</span>
              <span className={`text-[11px] font-normal ${regType === type ? 'text-dti-blue/70' : 'text-gray-400'}`}>{desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* ── Personal information ── */}
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            {regType === 'business' ? 'Owner / Representative Information' : regType === 'ngo' ? 'Representative Information' : regType === 'government' ? 'Personal Information' : 'Personal Information'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input type="text" autoComplete="given-name" {...field('firstName')} />
              {errors['firstName'] && <p className="text-red-500 text-xs mt-1">{errors['firstName']}</p>}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input type="text" autoComplete="family-name" {...field('lastName')} />
              {errors['lastName'] && <p className="text-red-500 text-xs mt-1">{errors['lastName']}</p>}
            </div>
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input type="email" autoComplete="email" {...field('email')} placeholder="you@example.com" />
            {errors['email'] && <p className="text-red-500 text-xs mt-1">{errors['email']}</p>}
          </div>

          <div>
            <label className="label">Mobile Number</label>
            <input type="tel" autoComplete="tel" {...field('mobileNumber')} placeholder="09XX XXX XXXX" />
          </div>

          <div>
            <label className="label">Region</label>
            <select {...field('region')} className={`input ${errors['region'] ? 'border-red-400' : ''}`}>
              {PH_REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* ── Business / Organization information ── */}
          {(regType === 'business' || regType === 'ngo') && (
            <>
              <hr className="my-2" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                {regType === 'ngo' ? 'Organization Information' : 'Business Information'}
              </h3>

              <div>
                <label className="label">{regType === 'ngo' ? 'Organization Name *' : 'Business Name *'}</label>
                <input type="text" {...bizField('businessName')} placeholder={regType === 'ngo' ? 'e.g., Cebu Youth Alliance' : "e.g., Juan's Coffee Shop"} />
                {errors['businessName'] && <p className="text-red-500 text-xs mt-1">{errors['businessName']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Industry Sector *</label>
                  <select {...bizField('industrySector')} className={`input ${errors['industrySector'] ? 'border-red-400' : ''}`}>
                    <option value="">Select sector</option>
                    {INDUSTRY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors['industrySector'] && <p className="text-red-500 text-xs mt-1">{errors['industrySector']}</p>}
                </div>
                {regType === 'business' && (
                  <div>
                    <label className="label">Business Stage</label>
                    <select {...bizField('stage')} className="input">
                      <option value="PRE_STARTUP">Pre-Startup</option>
                      <option value="STARTUP">Startup</option>
                      <option value="GROWTH">Growth</option>
                      <option value="EXPANSION">Expansion</option>
                      <option value="MATURE">Mature</option>
                    </select>
                  </div>
                )}
              </div>

              {regType === 'business' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Trade Name</label>
                    <input type="text" {...bizField('tradeName')} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="label">Number of Employees</label>
                    <input type="number" {...bizField('employeeCount')} placeholder="e.g., 10" min="1" />
                  </div>
                </div>
              )}

              {regType === 'business' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">DTI/SEC Registration No.</label>
                    <input type="text" {...bizField('registrationNo')} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="label">TIN Number</label>
                    <input type="text" {...bizField('tinNumber')} placeholder="Optional" />
                  </div>
                </div>
              )}

              {/* ── Members/Employees Section ── */}
              <hr className="my-2" />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  {regType === 'ngo' ? 'Members' : 'Employees'} <span className="text-xs font-normal text-gray-400">(optional)</span>
                </h3>
                <button type="button" onClick={addEmployee} className="text-dti-blue text-sm font-medium flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Employee
                </button>
              </div>
              {employees.length > 0 && (
                <p className="text-xs text-gray-500 -mt-2">
                  Each employee will receive an email invitation to create their account.
                </p>
              )}
              {employees.map((emp, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeEmployee(i)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <p className="text-xs font-medium text-gray-500">Employee {i + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="First Name *"
                        value={emp.firstName}
                        onChange={(e) => updateEmployee(i, 'firstName', e.target.value)}
                        className={`input text-sm ${errors[`emp_${i}_firstName`] ? 'border-red-400' : ''}`}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Last Name *"
                        value={emp.lastName}
                        onChange={(e) => updateEmployee(i, 'lastName', e.target.value)}
                        className={`input text-sm ${errors[`emp_${i}_lastName`] ? 'border-red-400' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={emp.email}
                        onChange={(e) => updateEmployee(i, 'email', e.target.value)}
                        className={`input text-sm ${errors[`emp_${i}_email`] ? 'border-red-400' : ''}`}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Job Title (optional)"
                        value={emp.jobTitle}
                        onChange={(e) => updateEmployee(i, 'jobTitle', e.target.value)}
                        className="input text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Password ── */}
          <hr className="my-2" />
          <div>
            <label className="label">Password *</label>
            <input type="password" autoComplete="new-password" {...field('password')} placeholder="Min. 10 characters" />
            {errors['password'] && <p className="text-red-500 text-xs mt-1">{errors['password']}</p>}
          </div>

          <div>
            <label className="label">Confirm Password *</label>
            <input type="password" autoComplete="new-password" {...field('confirmPassword')} placeholder="Repeat password" />
            {errors['confirmPassword'] && <p className="text-red-500 text-xs mt-1">{errors['confirmPassword']}</p>}
          </div>

          {/* DPA Consent */}
          <div className="bg-blue-50 rounded-card p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 accent-dti-blue"
                checked={form.dpaConsentGiven === true}
                onChange={(e) => setForm({ ...form, dpaConsentGiven: e.target.checked as true })}
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

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {isPending
              ? 'Creating account…'
              : regType === 'business'
                ? 'Register Business Account'
                : regType === 'ngo'
                  ? 'Register Organization Account'
                  : regType === 'government'
                    ? 'Register Government Account'
                    : 'Create Account'}
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

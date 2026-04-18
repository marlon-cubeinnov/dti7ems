import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api';

export function VerifyCertificatePage() {
  const { code: paramCode } = useParams<{ code?: string }>();
  const [inputCode, setInputCode] = useState(paramCode ?? '');
  const [searchCode, setSearchCode] = useState(paramCode ?? '');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-cert', searchCode],
    queryFn: () => certificatesApi.verifyCertificate(searchCode),
    enabled: searchCode.length >= 8,
    retry: false,
  });

  const result = data as { data?: { valid: boolean; reason?: string; certificate?: any } } | undefined;
  const certData = result?.data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the verification code printed on the certificate.</p>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); setSearchCode(inputCode.trim().toUpperCase()); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputCode}
            onChange={e => setInputCode(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3D4E5F6"
            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={30}
          />
          <button type="submit" className="btn-primary text-sm px-4">Verify</button>
        </form>

        {isLoading && searchCode && (
          <p className="text-center text-gray-400 text-sm">Verifying…</p>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700 font-semibold">Certificate Not Found</p>
            <p className="text-red-500 text-sm mt-1">The code you entered is not valid.</p>
          </div>
        )}

        {certData && !isLoading && (
          certData.valid ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-2xl">✓</span>
                <div>
                  <p className="font-semibold text-green-800">Valid Certificate</p>
                  <p className="text-xs text-green-600">This certificate is authentic.</p>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-green-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Event</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">
                    {certData.certificate?.event?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">
                    {certData.certificate?.event?.startDate
                      ? new Date(certData.certificate.event.startDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </span>
                </div>
                {certData.certificate?.event?.venue && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Venue</span>
                    <span className="font-medium text-gray-900">{certData.certificate.event.venue}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued</span>
                  <span className="font-medium text-gray-900">
                    {certData.certificate?.issuedAt
                      ? new Date(certData.certificate.issuedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-semibold">Certificate Revoked</p>
              <p className="text-red-500 text-sm mt-1">{certData.reason}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

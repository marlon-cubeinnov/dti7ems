import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ClipboardList, RefreshCw } from 'lucide-react';
import { enterpriseApi } from '@/lib/api';

interface UpdateStatus {
  updateDue: boolean;
  updateType: 'FIRST_LOGIN' | 'ANNUAL' | null;
  lastUpdatedAt: string | null;
  lastUpdatedYear: number | null;
}

interface Props {
  enterpriseId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function CompanyProfileModal({ enterpriseId, onClose }: Props) {
  const navigate = useNavigate();
  const [updateType, setUpdateType] = useState<'FIRST_LOGIN' | 'ANNUAL' | null>(null);
  const [lastUpdatedYear, setLastUpdatedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enterpriseApi.getUpdateStatus(enterpriseId)
      .then((res) => {
        const status = res?.data as UpdateStatus | undefined;
        setUpdateType(status?.updateType ?? null);
        setLastUpdatedYear(status?.lastUpdatedYear ?? null);
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false));
  }, [enterpriseId]);

  function handleGoToProfile() {
    onClose();
    navigate(`/company-profile?mode=required&type=${updateType ?? 'FIRST_LOGIN'}`);
  }

  const isFirstLogin = updateType === 'FIRST_LOGIN';
  const currentYear = new Date().getFullYear();

  // Overlay
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={isFirstLogin ? undefined : onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div style={{ background: '#172187', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {isFirstLogin
            ? <ClipboardList style={{ width: 24, height: 24, color: '#fff', flexShrink: 0 }} />
            : <RefreshCw style={{ width: 24, height: 24, color: '#fff', flexShrink: 0 }} />
          }
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>
              {isFirstLogin ? 'Complete Your Company Profile' : 'Annual Company Profile Update'}
            </h2>
            <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              MSME CPMS Form 01 — DTI Region 7
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#888' }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                <Building2 style={{ width: 36, height: 36, color: '#172187', flexShrink: 0, marginTop: 2 }} />
                <div>
                  {isFirstLogin ? (
                    <>
                      <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1a1a1a' }}>
                        Your account has been approved. Please complete your full company profile.
                      </p>
                      <p style={{ margin: 0, color: '#555', fontSize: 14, lineHeight: 1.5 }}>
                        DTI Region 7 needs your complete MSME CPMS information — including your business registration, owner details, financial structure, and employment data — before you can access all features.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1a1a1a' }}>
                        Annual update required for {currentYear}.
                      </p>
                      <p style={{ margin: 0, color: '#555', fontSize: 14, lineHeight: 1.5 }}>
                        {lastUpdatedYear
                          ? `Your last update was in ${lastUpdatedYear}.`
                          : 'Your profile has not been updated this year.'
                        }{' '}
                        DTI Region 7 collects updated MSME data each year for program planning and regional reporting. Please review and update all sections.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleGoToProfile}
                  style={{
                    background: '#172187', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '12px 20px', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', width: '100%',
                  }}
                >
                  {isFirstLogin ? 'Complete Company Profile Now' : 'Update Company Profile'}
                </button>

                {!isFirstLogin && (
                  <button
                    onClick={onClose}
                    style={{
                      background: 'transparent', color: '#666', border: '1px solid #ddd',
                      borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', width: '100%',
                    }}
                  >
                    Remind Me Later
                  </button>
                )}
              </div>

              {isFirstLogin && (
                <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: '#aaa' }}>
                  This step is required before you can continue.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

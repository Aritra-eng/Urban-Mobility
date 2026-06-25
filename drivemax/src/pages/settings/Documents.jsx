import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle, Download, Eye, Calendar, Hash, User, Car, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import './SettingsShared.css';

const documents = [
  {
    id: 'license',
    title: "Driver's License",
    icon: <FileText size={20} />,
    status: 'verified',
    statusLabel: 'Verified',
    details: [
      { label: 'License Number', value: 'KA05-2019-0084521' },
      { label: 'Holder Name', value: 'Askk' },
      { label: 'Issue Date', value: 'March 15, 2019' },
      { label: 'Expiry Date', value: 'March 14, 2039' },
      { label: 'Category', value: 'LMV, Transport' },
      { label: 'Issuing Authority', value: 'RTO Bangalore' },
    ],
  },
  {
    id: 'rc',
    title: 'Vehicle Registration (RC)',
    icon: <Car size={20} />,
    status: 'verified',
    statusLabel: 'Verified',
    details: [
      { label: 'Registration No.', value: 'KA-01-AB-1234' },
      { label: 'Owner Name', value: 'Askk' },
      { label: 'Vehicle', value: 'Toyota Camry Hybrid 2023' },
      { label: 'Chassis No.', value: 'JTDBR***5678' },
      { label: 'Engine No.', value: '2AR-***890' },
      { label: 'Registration Date', value: 'January 10, 2023' },
    ],
  },
  {
    id: 'inspection',
    title: 'Vehicle Inspection',
    icon: <AlertTriangle size={20} />,
    status: 'expiring',
    statusLabel: 'Expires in 14 days',
    details: [
      { label: 'Inspection ID', value: 'INS-2025-78452' },
      { label: 'Last Inspected', value: 'December 23, 2025' },
      { label: 'Valid Until', value: 'June 23, 2026' },
      { label: 'Inspector', value: 'Certified AutoCheck™' },
      { label: 'Result', value: 'Pass — All Clear' },
      { label: 'Next Due', value: 'June 23, 2026' },
    ],
  },
  {
    id: 'insurance',
    title: 'Insurance Policy',
    icon: <Shield size={20} />,
    status: 'verified',
    statusLabel: 'Active',
    details: [
      { label: 'Policy Number', value: 'HDFC-ERG-87456321' },
      { label: 'Provider', value: 'HDFC ERGO General Insurance' },
      { label: 'Plan', value: 'Comprehensive — Full Cover' },
      { label: 'Premium', value: '₹18,500 / year' },
      { label: 'Coverage', value: '₹15,00,000' },
      { label: 'Valid Until', value: 'December 31, 2026' },
    ],
  },
];

const getStatusBadge = (status) => {
  if (status === 'verified') return 'green';
  if (status === 'expiring') return 'amber';
  return 'red';
};

const getIconColor = (status) => {
  if (status === 'verified') return 'green';
  if (status === 'expiring') return 'amber';
  return 'red';
};

const Documents = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [viewDoc, setViewDoc] = useState(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const handleViewDocument = (doc) => {
    setViewDoc(doc);
  };

  const handleDownload = (doc) => {
    setDownloading(doc.id);
    setTimeout(() => {
      setDownloading(null);
      toast(`${doc.title} downloaded successfully!`, 'success');
    }, 1500);
  };

  const handleScheduleRenewal = () => {
    setShowRenewalModal(false);
    toast('Inspection renewal scheduled for June 20, 2026', 'success');
  };

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-heading">Documents & Compliance</h1>
          <p className="page-subheading">Manage your driving licenses and vehicle documents</p>
        </div>
      </div>

      {/* Warning banner for expiring doc */}
      <div className="sp-banner warning">
        <div className="sp-banner-icon">
          <AlertTriangle size={20} />
        </div>
        <div className="sp-banner-text">
          <strong>Vehicle Inspection expires in 14 days</strong>
          <span>Schedule a renewal to avoid service interruption</span>
        </div>
      </div>

      {/* Document Cards */}
      {documents.map((doc, i) => (
        <div key={doc.id} className="doc-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="doc-card-header">
            <div className="doc-card-title">
              <div className={`sp-row-icon ${getIconColor(doc.status)}`}>
                {doc.icon}
              </div>
              <h4>{doc.title}</h4>
            </div>
            <span className={`sp-badge ${getStatusBadge(doc.status)}`}>
              {doc.status === 'verified' && <CheckCircle size={12} />}
              {doc.status === 'expiring' && <AlertTriangle size={12} />}
              {doc.statusLabel}
            </span>
          </div>

          <div className="doc-card-body">
            <div className="doc-detail-grid">
              {doc.details.map((detail) => (
                <div key={detail.label} className="doc-detail">
                  <span className="doc-detail-label">{detail.label}</span>
                  <span className="doc-detail-value">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-card-footer">
            <button className="doc-btn primary" onClick={() => handleViewDocument(doc)}>
              <Eye size={14} /> View Document
            </button>
            <button
              className="doc-btn outline"
              onClick={() => handleDownload(doc)}
              disabled={downloading === doc.id}
            >
              <Download size={14} /> {downloading === doc.id ? 'Downloading...' : 'Download'}
            </button>
            {doc.status === 'expiring' && (
              <button
                className="doc-btn primary"
                style={{ background: 'var(--gradient-warm)' }}
                onClick={() => setShowRenewalModal(true)}
              >
                <Calendar size={14} /> Schedule Renewal
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Document Viewer Modal */}
      {viewDoc && (
        <div className="modal-overlay" onClick={() => setViewDoc(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0, textAlign: 'left' }}>{viewDoc.title}</h3>
              <button
                onClick={() => setViewDoc(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {viewDoc.details.map((d) => (
                <div key={d.label} className="doc-detail">
                  <span className="doc-detail-label">{d.label}</span>
                  <span className="doc-detail-value">{d.value}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="modal-btn cancel" onClick={() => setViewDoc(null)}>Close</button>
              <button className="modal-btn primary" onClick={() => { handleDownload(viewDoc); setViewDoc(null); }}>
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Schedule Modal */}
      <ConfirmModal
        isOpen={showRenewalModal}
        icon={<Calendar size={28} />}
        iconType="warning"
        title="Schedule Inspection Renewal"
        description="Your vehicle inspection is expiring on June 23, 2026. We'll schedule a renewal appointment at the nearest Certified AutoCheck™ center on June 20, 2026."
        confirmText="Schedule Renewal"
        cancelText="Not Now"
        confirmStyle="primary"
        onConfirm={handleScheduleRenewal}
        onCancel={() => setShowRenewalModal(false)}
      />
    </div>
  );
};

export default Documents;

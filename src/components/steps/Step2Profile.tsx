import React, { useState, useEffect } from 'react';
import { OfficialProfile, FullOfficialProfile } from '../../types';
import { 
  User, 
  Building, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  MapPin, 
  Mail, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Github,
  Globe,
  FileText,
  Upload,
  ExternalLink,
  Download
} from 'lucide-react';
import { profileApi } from '../../services/profileApi';

interface Step2ProfileProps {
  profile: OfficialProfile;
  onUpdateProfile: (updated: Partial<OfficialProfile>) => void;
  onNext?: () => void;
  onBack?: () => void;
  theme: 'light' | 'dark';
}

export const Step2Profile: React.FC<Step2ProfileProps> = ({
  profile: initialProfile,
  onUpdateProfile,
  theme,
}) => {
  const isLight = theme === 'light';

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: initialProfile.name || '',
    officialEmail: initialProfile.email || '',
    workLocation: 'New Delhi',
    department: initialProfile.department || initialProfile.ministry || '',
    designation: initialProfile.designation || '',
    education: 'Master of Public Administration (MPA)',
    yearsOfExperience: initialProfile.experienceYears || 4,
    profilePhoto: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    resumeName: '',
  });

  // Load profile from backend GET /api/profile
  const fetchProfile = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data: FullOfficialProfile = await profileApi.getProfile();
      
      let eduSummary = 'Master of Public Administration (MPA)';
      if (typeof (data as any).educationSummary === 'string' && (data as any).educationSummary) {
        eduSummary = (data as any).educationSummary;
      } else if (Array.isArray(data.education) && data.education.length > 0) {
        eduSummary = data.education.map(e => `${e.degree} (${e.specialization || e.university})`).join(', ');
      }

      setFormData({
        fullName: data.fullName || initialProfile.name || '',
        officialEmail: data.officialEmail || initialProfile.email || '',
        workLocation: data.workLocation || 'New Delhi',
        department: data.department || initialProfile.department || '',
        designation: data.designation || initialProfile.designation || '',
        education: eduSummary,
        yearsOfExperience: data.yearsOfExperience !== undefined ? data.yearsOfExperience : (initialProfile.experienceYears || 4),
        profilePhoto: data.profilePhoto || '',
        githubUrl: data.githubUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        resumeUrl: data.resumeUrl || '',
        resumeName: data.resumeName || '',
      });
    } catch (err: any) {
      console.warn('Backend profile fetch warning, fallback to initial state:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image Photo Upload Handler (Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Profile photo size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Resume File Upload Handler (Base64)
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Resume file size must be less than 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          resumeUrl: reader.result as string,
          resumeName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation logic as required by Phase 2 spec
  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return 'Full Name is required.';
    if (!formData.department.trim()) return 'Department / Organization is required.';
    if (!formData.designation.trim()) return 'Designation / Job Role is required.';
    if (!formData.education.trim()) return 'Education details are required.';
    if (!formData.workLocation.trim()) return 'Location / State is required.';
    
    const exp = Number(formData.yearsOfExperience);
    if (isNaN(exp) || exp < 0) return 'Years of Experience must be a valid non-negative number.';
    
    if (formData.githubUrl && !formData.githubUrl.startsWith('http://') && !formData.githubUrl.startsWith('https://')) {
      return 'GitHub Link must start with http:// or https://';
    }
    if (formData.portfolioUrl && !formData.portfolioUrl.startsWith('http://') && !formData.portfolioUrl.startsWith('https://')) {
      return 'Portfolio Link must start with http:// or https://';
    }

    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const validationErr = validateForm();
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        educationSummary: formData.education.trim(),
        yearsOfExperience: Number(formData.yearsOfExperience),
        workLocation: formData.workLocation.trim(),
        profilePhoto: formData.profilePhoto.trim(),
        githubUrl: formData.githubUrl.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
        resumeUrl: formData.resumeUrl,
        resumeName: formData.resumeName.trim(),
      };

      await profileApi.updateProfile(payload as any);

      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);

      // Notify parent app state
      onUpdateProfile({
        name: formData.fullName.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        experienceYears: Number(formData.yearsOfExperience),
      });

      // Refresh data
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    fetchProfile();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#0c2340] animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading Official Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <h2 className={`text-2xl font-extrabold ${isLight ? 'text-[#0c2340]' : 'text-slate-100'}`}>
            Official Profile
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Civil Service Official Profile & Digital Portfolio Record
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#0c2340] hover:bg-[#15345a] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                form="profile-form"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-300 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form id="profile-form" onSubmit={handleSave} className="space-y-6">
        {/* Profile Card Header (Photo + Identity) */}
        <div className={`p-6 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Profile Photo */}
          <div className="relative group flex flex-col items-center">
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt={formData.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#0c2340] shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0c2340] to-blue-900 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                {formData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'GO'}
              </div>
            )}
            
            {isEditing && (
              <div className="mt-2 flex flex-col items-center gap-1">
                <label className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold hover:bg-blue-100 cursor-pointer flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {formData.fullName}
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  {formData.designation}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#0c2340] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-center sm:self-start">
                Government Official
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{formData.department}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{formData.workLocation}</span>
              </span>
            </div>

            {/* Links Badges in View Mode */}
            {!isEditing && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {formData.githubUrl && (
                  <a
                    href={formData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {formData.portfolioUrl && (
                  <a
                    href={formData.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {formData.resumeUrl && (
                  <a
                    href={formData.resumeUrl}
                    download={formData.resumeName || 'Resume.pdf'}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{formData.resumeName || 'Resume Document'}</span>
                    <Download className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1: Personal Information */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-[#0c2340] dark:text-blue-400" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.fullName}
                </p>
              )}
            </div>

            {/* Email (Read-only / Disabled) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address <span className="text-slate-400 font-normal">(Linked to Account)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.officialEmail}
                  disabled
                  readOnly
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none opacity-80 cursor-not-allowed ${
                    isLight ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Location / State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location / State <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                  placeholder="e.g. New Delhi / Maharashtra"
                  required
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formData.workLocation}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Professional Information */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <Briefcase className="w-4 h-4 text-[#0c2340] dark:text-blue-400" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Professional Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department / Organization */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department / Organization <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Ministry of Statistics & Programme Implementation"
                  required
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.department}
                </p>
              )}
            </div>

            {/* Designation / Job Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Designation / Job Role <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Assistant Section Officer (ASO)"
                  required
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.designation}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Education <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. Master of Public Administration (MPA) / B.Sc Statistics"
                  required
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>{formData.education}</span>
                </p>
              )}
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Years of Experience <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="yearsOfExperience"
                  min="0"
                  step="1"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  required
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formData.yearsOfExperience} Years</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Links, Portfolio & Resume Upload */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <Globe className="w-4 h-4 text-[#0c2340] dark:text-blue-400" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Links, Portfolio & Resume Document
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GitHub Profile URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                GitHub Profile URL
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  {formData.githubUrl ? (
                    <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {formData.githubUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-normal">Not provided</span>
                  )}
                </p>
              )}
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Portfolio / Website URL
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://portfolio.me"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isLight ? 'border-slate-300 bg-white text-slate-800 focus:border-[#0c2340]' : 'border-slate-700 bg-slate-800 text-white'
                  }`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {formData.portfolioUrl ? (
                    <a href={formData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {formData.portfolioUrl}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-normal">Not provided</span>
                  )}
                </p>
              )}
            </div>

            {/* Resume File Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Upload Resume / CV Document (PDF / DOCX)
              </label>

              {isEditing ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose Resume File</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.resumeName && (
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formData.resumeName}</span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="py-1.5">
                  {formData.resumeUrl ? (
                    <a
                      href={formData.resumeUrl}
                      download={formData.resumeName || 'Resume.pdf'}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download {formData.resumeName || 'Resume'}</span>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No resume document uploaded.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

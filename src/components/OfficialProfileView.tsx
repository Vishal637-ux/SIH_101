import { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Sliders,
  Check,
} from 'lucide-react';
import {
  FullOfficialProfile,
  EducationRecord,
  ExperienceRecord,
  TrainingRecord,
  OfficialSkillRecord,
  ProfileCompletionStatus,
} from '../types';
import { profileApi } from '../services/profileApi';

interface OfficialProfileViewProps {
  userId: string;
  onProceedToAssessment?: () => void;
  onProfileUpdated?: (updated: FullOfficialProfile) => void;
}

type TabKey = 'overview' | 'professional' | 'education' | 'experience' | 'training' | 'skills' | 'preferences';

export default function OfficialProfileView({
  userId,
  onProceedToAssessment,
  onProfileUpdated,
}: OfficialProfileViewProps) {
  const [profile, setProfile] = useState<FullOfficialProfile | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletionStatus | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit modal states
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState<Partial<FullOfficialProfile>>({});

  const [educationModal, setEducationModal] = useState<{ open: boolean; mode: 'add' | 'edit'; record?: EducationRecord }>({ open: false, mode: 'add' });
  const [eduForm, setEduForm] = useState<Partial<EducationRecord>>({});

  const [experienceModal, setExperienceModal] = useState<{ open: boolean; mode: 'add' | 'edit'; record?: ExperienceRecord }>({ open: false, mode: 'add' });
  const [expForm, setExpForm] = useState<Partial<ExperienceRecord>>({});

  const [trainingModal, setTrainingModal] = useState<{ open: boolean; mode: 'add' | 'edit'; record?: TrainingRecord }>({ open: false, mode: 'add' });
  const [trainForm, setTrainForm] = useState<Partial<TrainingRecord>>({});

  const [skillModal, setSkillModal] = useState<{ open: boolean; mode: 'add' | 'edit'; record?: OfficialSkillRecord }>({ open: false, mode: 'add' });
  const [skillForm, setSkillForm] = useState<Partial<OfficialSkillRecord>>({});

  const [isEditingProf, setIsEditingProf] = useState(false);
  const [profForm, setProfForm] = useState<Partial<FullOfficialProfile>>({});
  const [expertiseInput, setExpertiseInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [prefForm, setPrefForm] = useState<Partial<FullOfficialProfile['learningPreferences']>>({});

  const [validationError, setValidationError] = useState<string | null>(null);

  // Load profile data
  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const data = await profileApi.getProfile(userId);
      setProfile(data);
      if (data.completionStatus) {
        setCompletion(data.completionStatus);
      } else {
        const comp = await profileApi.getCompletionStatus(userId);
        setCompletion(comp);
      }
      onProfileUpdated?.(data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Could not load official profile' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const showSuccess = (msg: string) => {
    setNotification({ type: 'success', message: msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const showError = (msg: string) => {
    setNotification({ type: 'error', message: msg });
    setTimeout(() => setNotification(null), 5000);
  };

  // ---------------- BASIC INFO SAVE ----------------
  const handleSaveBasic = async () => {
    setValidationError(null);
    if (!basicForm.fullName || basicForm.fullName.trim().length < 2) {
      setValidationError('Full Name must be at least 2 characters long.');
      return;
    }
    if (basicForm.mobileNumber) {
      const cleaned = basicForm.mobileNumber.replace(/[\s-]/g, '');
      if (!/^\+?[0-9]{10,14}$/.test(cleaned)) {
        setValidationError('Please enter a valid 10 to 14 digit mobile number.');
        return;
      }
    }
    if (basicForm.dateOfJoining) {
      const jDate = new Date(basicForm.dateOfJoining);
      if (jDate > new Date()) {
        setValidationError('Date of Joining cannot be a future date.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await profileApi.updateProfile(basicForm, userId);
      setProfile(res.profile);
      setCompletion(res.profile.completionStatus || null);
      setIsEditingBasic(false);
      showSuccess('Basic information updated successfully.');
      onProfileUpdated?.(res.profile);
    } catch (err: any) {
      showError(err.message || 'Failed to update basic information.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- PROFESSIONAL PROFILE SAVE ----------------
  const handleSaveProfessional = async () => {
    setValidationError(null);
    setIsSaving(true);
    try {
      const res = await profileApi.updateProfile(
        {
          department: profForm.department,
          designation: profForm.designation,
          jobRole: profForm.jobRole,
          currentAssignment: profForm.currentAssignment,
          responsibilities: profForm.responsibilities,
          yearsOfExperience: Number(profForm.yearsOfExperience) || 0,
          areasOfExpertise: profForm.areasOfExpertise || [],
          professionalInterests: profForm.professionalInterests || [],
        },
        userId
      );
      setProfile(res.profile);
      setCompletion(res.profile.completionStatus || null);
      setIsEditingProf(false);
      showSuccess('Professional details updated successfully.');
      onProfileUpdated?.(res.profile);
    } catch (err: any) {
      showError(err.message || 'Failed to update professional details.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- EDUCATION ACTIONS ----------------
  const handleOpenAddEdu = () => {
    setEduForm({
      degree: '',
      specialization: '',
      institution: '',
      university: '',
      startYear: new Date().getFullYear() - 4,
      completionYear: new Date().getFullYear(),
      gradePercentage: '',
      relevantSkills: '',
    });
    setValidationError(null);
    setEducationModal({ open: true, mode: 'add' });
  };

  const handleOpenEditEdu = (record: EducationRecord) => {
    setEduForm({ ...record });
    setValidationError(null);
    setEducationModal({ open: true, mode: 'edit', record });
  };

  const handleSaveEducation = async () => {
    setValidationError(null);
    if (!eduForm.degree || !eduForm.degree.trim()) {
      setValidationError('Degree / Qualification is required.');
      return;
    }
    if (!eduForm.institution || !eduForm.institution.trim()) {
      setValidationError('Institution name is required.');
      return;
    }
    if (!eduForm.completionYear || isNaN(Number(eduForm.completionYear))) {
      setValidationError('Valid completion year is required.');
      return;
    }
    if (eduForm.startYear && Number(eduForm.completionYear) < Number(eduForm.startYear)) {
      setValidationError('Completion year cannot precede start year.');
      return;
    }

    setIsSaving(true);
    try {
      if (educationModal.mode === 'add') {
        await profileApi.addEducation(
          {
            degree: eduForm.degree.trim(),
            specialization: eduForm.specialization || '',
            institution: eduForm.institution.trim(),
            university: eduForm.university || eduForm.institution.trim(),
            startYear: Number(eduForm.startYear) || Number(eduForm.completionYear),
            completionYear: Number(eduForm.completionYear),
            gradePercentage: eduForm.gradePercentage || '',
            relevantSkills: eduForm.relevantSkills || '',
          },
          userId
        );
        showSuccess('Education record added successfully.');
      } else if (educationModal.record) {
        await profileApi.updateEducation(educationModal.record.id, eduForm, userId);
        showSuccess('Education record updated.');
      }
      setEducationModal({ open: false, mode: 'add' });
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to save education record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Are you sure you want to remove this education record?')) return;
    try {
      await profileApi.deleteEducation(id, userId);
      showSuccess('Education record deleted.');
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete education record.');
    }
  };

  // ---------------- EXPERIENCE ACTIONS ----------------
  const handleOpenAddExp = () => {
    setExpForm({
      organization: '',
      department: '',
      designation: '',
      employmentType: 'Permanent',
      startDate: '',
      endDate: '',
      isCurrentPosition: true,
      responsibilities: '',
      keyAchievements: '',
      skillsUsed: '',
    });
    setValidationError(null);
    setExperienceModal({ open: true, mode: 'add' });
  };

  const handleOpenEditExp = (record: ExperienceRecord) => {
    setExpForm({ ...record });
    setValidationError(null);
    setExperienceModal({ open: true, mode: 'edit', record });
  };

  const handleSaveExperience = async () => {
    setValidationError(null);
    if (!expForm.organization || !expForm.organization.trim()) {
      setValidationError('Organization name is required.');
      return;
    }
    if (!expForm.designation || !expForm.designation.trim()) {
      setValidationError('Designation / Role is required.');
      return;
    }
    if (!expForm.startDate) {
      setValidationError('Start date is required.');
      return;
    }
    if (!expForm.isCurrentPosition && expForm.endDate) {
      if (new Date(expForm.endDate) < new Date(expForm.startDate)) {
        setValidationError('End date cannot be prior to start date.');
        return;
      }
    }

    setIsSaving(true);
    try {
      if (experienceModal.mode === 'add') {
        await profileApi.addExperience(
          {
            organization: expForm.organization.trim(),
            department: expForm.department || '',
            designation: expForm.designation.trim(),
            employmentType: expForm.employmentType || 'Permanent',
            startDate: expForm.startDate,
            endDate: expForm.isCurrentPosition ? undefined : expForm.endDate,
            isCurrentPosition: Boolean(expForm.isCurrentPosition),
            responsibilities: expForm.responsibilities || '',
            keyAchievements: expForm.keyAchievements || '',
            skillsUsed: expForm.skillsUsed || '',
          },
          userId
        );
        showSuccess('Work experience added successfully.');
      } else if (experienceModal.record) {
        await profileApi.updateExperience(experienceModal.record.id, expForm, userId);
        showSuccess('Work experience updated.');
      }
      setExperienceModal({ open: false, mode: 'add' });
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to save experience record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience?')) return;
    try {
      await profileApi.deleteExperience(id, userId);
      showSuccess('Work experience removed.');
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete experience.');
    }
  };

  // ---------------- TRAINING ACTIONS ----------------
  const handleOpenAddTrain = () => {
    setTrainForm({
      courseName: '',
      trainingProvider: '',
      category: 'Administrative Governance',
      startDate: '',
      completionDate: '',
      duration: '2 Weeks',
      mode: 'Online',
      certificateNumber: '',
      competenciesAcquired: '',
    });
    setValidationError(null);
    setTrainingModal({ open: true, mode: 'add' });
  };

  const handleOpenEditTrain = (record: TrainingRecord) => {
    setTrainForm({ ...record });
    setValidationError(null);
    setTrainingModal({ open: true, mode: 'edit', record });
  };

  const handleSaveTraining = async () => {
    setValidationError(null);
    if (!trainForm.courseName || !trainForm.courseName.trim()) {
      setValidationError('Course / Training Name is required.');
      return;
    }
    if (!trainForm.trainingProvider || !trainForm.trainingProvider.trim()) {
      setValidationError('Training Provider is required.');
      return;
    }
    if (!trainForm.startDate || !trainForm.completionDate) {
      setValidationError('Start date and completion date are required.');
      return;
    }
    if (new Date(trainForm.completionDate) < new Date(trainForm.startDate)) {
      setValidationError('Completion date cannot precede start date.');
      return;
    }

    setIsSaving(true);
    try {
      if (trainingModal.mode === 'add') {
        await profileApi.addTraining(
          {
            courseName: trainForm.courseName.trim(),
            trainingProvider: trainForm.trainingProvider.trim(),
            category: trainForm.category || 'General Administration',
            startDate: trainForm.startDate,
            completionDate: trainForm.completionDate,
            duration: trainForm.duration || '2 Weeks',
            mode: trainForm.mode || 'Online',
            certificateNumber: trainForm.certificateNumber || '',
            competenciesAcquired: trainForm.competenciesAcquired || '',
          },
          userId
        );
        showSuccess('Training record logged successfully.');
      } else if (trainingModal.record) {
        await profileApi.updateTraining(trainingModal.record.id, trainForm, userId);
        showSuccess('Training record updated.');
      }
      setTrainingModal({ open: false, mode: 'add' });
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to save training record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training record?')) return;
    try {
      await profileApi.deleteTraining(id, userId);
      showSuccess('Training record deleted.');
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete training record.');
    }
  };

  // ---------------- SKILLS ACTIONS ----------------
  const handleOpenAddSkill = () => {
    setSkillForm({
      skillName: '',
      skillCategory: 'Domain-specific',
      selfAssessedProficiency: 3,
      yearsOfExperience: 3,
      certificationEvidence: '',
    });
    setValidationError(null);
    setSkillModal({ open: true, mode: 'add' });
  };

  const handleOpenEditSkill = (record: OfficialSkillRecord) => {
    setSkillForm({ ...record });
    setValidationError(null);
    setSkillModal({ open: true, mode: 'edit', record });
  };

  const handleSaveSkill = async () => {
    setValidationError(null);
    if (!skillForm.skillName || !skillForm.skillName.trim()) {
      setValidationError('Skill name is required.');
      return;
    }
    const prof = Number(skillForm.selfAssessedProficiency);
    if (isNaN(prof) || prof < 1 || prof > 5) {
      setValidationError('Proficiency must be between 1 and 5.');
      return;
    }

    setIsSaving(true);
    try {
      if (skillModal.mode === 'add') {
        await profileApi.addSkill(
          {
            skillName: skillForm.skillName.trim(),
            skillCategory: skillForm.skillCategory || 'Domain-specific',
            selfAssessedProficiency: prof as any,
            yearsOfExperience: Number(skillForm.yearsOfExperience) || 1,
            certificationEvidence: skillForm.certificationEvidence || '',
          },
          userId
        );
        showSuccess('Skill added to official profile.');
      } else if (skillModal.record) {
        await profileApi.updateSkill(skillModal.record.id, skillForm, userId);
        showSuccess('Skill updated.');
      }
      setSkillModal({ open: false, mode: 'add' });
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to save skill.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await profileApi.deleteSkill(id, userId);
      showSuccess('Skill removed.');
      await loadProfileData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete skill.');
    }
  };

  // ---------------- LEARNING PREFERENCES SAVE ----------------
  const handleSavePreferences = async () => {
    setValidationError(null);
    setIsSaving(true);
    try {
      const res = await profileApi.updateProfile(
        {
          learningPreferences: {
            careerGoals: prefForm.careerGoals || '',
            preferredFormats: prefForm.preferredFormats || ['Text', 'Interactive'],
            preferredLanguage: prefForm.preferredLanguage || 'English',
            areasToImprove: prefForm.areasToImprove || '',
            targetCompetencies: prefForm.targetCompetencies || '',
            learningInterests: prefForm.learningInterests || '',
          },
        },
        userId
      );
      setProfile(res.profile);
      setCompletion(res.profile.completionStatus || null);
      setIsEditingPrefs(false);
      showSuccess('Learning & career preferences updated successfully.');
      onProfileUpdated?.(res.profile);
    } catch (err: any) {
      showError(err.message || 'Failed to save learning preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#0c2340] animate-spin" />
        <p className="text-sm font-medium text-slate-600">Retrieving official service dossier...</p>
      </div>
    );
  }

  const completionPct = completion?.percentage ?? 80;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm font-medium border shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER: OFFICIAL PROFILE HERO BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tricolor accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Profile Avatar & Primary Identifiers */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0c2340] to-slate-800 text-white flex items-center justify-center text-2xl font-bold tracking-wider shadow-md">
                  {profile.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {profile.serviceCadre}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Official ID: {profile.employeeId}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700">{profile.designation}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {profile.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile.officialEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.workLocation || 'New Delhi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="lg:w-80 bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Profile Completion
                </span>
                <span className="text-sm font-bold text-[#0c2340]">{completionPct}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#0c2340] rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>
                  {completion?.incompleteSections.length === 0
                    ? 'All 7 sections verified'
                    : `${completion?.incompleteSections.length || 0} section(s) pending`}
                </span>
                <span className="font-medium text-amber-700">Official Dossier</span>
              </div>
            </div>
          </div>

          {/* Callout Notice & Workflow Continuation */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {completion?.recommendation ||
                  'Complete your educational and training records to calibrate your personalized AI learning pathways.'}
              </span>
            </div>

            {onProceedToAssessment && (
              <button
                onClick={onProceedToAssessment}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0c2340] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <span>Proceed to Competency Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="px-6 bg-slate-50/70 border-t border-slate-200 flex items-center overflow-x-auto gap-2">
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'professional', label: 'Professional', icon: Briefcase },
            { key: 'education', label: `Education (${profile.education?.length || 0})`, icon: GraduationCap },
            { key: 'experience', label: `Experience (${profile.experience?.length || 0})`, icon: Building },
            { key: 'training', label: `Training (${profile.training?.length || 0})`, icon: Award },
            { key: 'skills', label: `Skills (${profile.skills?.length || 0})`, icon: Sliders },
            { key: 'preferences', label: 'Learning Preferences', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#0c2340] text-[#0c2340] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0c2340]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic / Official Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#0c2340]" />
                <h2 className="text-base font-bold text-slate-900">Basic & Official Information</h2>
              </div>
              <button
                onClick={() => {
                  setBasicForm({
                    fullName: profile.fullName,
                    mobileNumber: profile.mobileNumber,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    department: profile.department,
                    designation: profile.designation,
                    jobRole: profile.jobRole,
                    currentAssignment: profile.currentAssignment,
                    serviceCadre: profile.serviceCadre,
                    dateOfJoining: profile.dateOfJoining,
                    workLocation: profile.workLocation,
                  });
                  setValidationError(null);
                  setIsEditingBasic(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0c2340] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Information</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Full Legal Name</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.fullName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Official Email</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-medium">System Protected</span>
                </div>
                <span className="font-semibold text-slate-800 text-sm">{profile.officialEmail}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Employee / Official ID</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-medium">System Protected</span>
                </div>
                <span className="font-semibold text-slate-800 text-sm">{profile.employeeId}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Organization</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-medium">System Protected</span>
                </div>
                <span className="font-semibold text-slate-800 text-sm">{profile.organization}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Mobile Number</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.mobileNumber || 'Not configured'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Service Cadre</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.serviceCadre}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Designation</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.designation}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Date of Joining</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.dateOfJoining || 'N/A'}</span>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Department</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.department}</span>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Current Assignment / Task Force</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.currentAssignment || 'Administrative Duties'}</span>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Work Location</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.workLocation || 'New Delhi'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Completion Status Detail */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dossier Completion Checklist</span>
              </h2>

              <p className="text-xs text-slate-500">
                Checklist reflects profile documentation completeness only. It is not calculated into competency scores.
              </p>

              <div className="space-y-2.5 pt-2">
                {completion?.sections &&
                  Object.entries(completion.sections).map(([key, sec]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 rounded-lg border text-xs bg-slate-50/50 border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        {sec.completed ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                            !
                          </div>
                        )}
                        <span className={sec.completed ? 'font-medium text-slate-800' : 'font-medium text-slate-600'}>
                          {sec.label}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          sec.completed ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {sec.completed ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Record Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Records Log</h3>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-[#0c2340]">{profile.education?.length || 0}</div>
                  <div className="text-[11px] text-slate-500">Qualifications</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-[#0c2340]">{profile.experience?.length || 0}</div>
                  <div className="text-[11px] text-slate-500">Postings</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-[#0c2340]">{profile.training?.length || 0}</div>
                  <div className="text-[11px] text-slate-500">Trainings</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-[#0c2340]">{profile.skills?.length || 0}</div>
                  <div className="text-[11px] text-slate-500">Skills Logged</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: PROFESSIONAL PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'professional' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-5 h-5 text-[#0c2340]" />
              <h2 className="text-base font-bold text-slate-900">Professional Profile & Administrative Context</h2>
            </div>
            {!isEditingProf ? (
              <button
                onClick={() => {
                  setProfForm({
                    designation: profile.designation,
                    department: profile.department,
                    jobRole: profile.jobRole,
                    currentAssignment: profile.currentAssignment,
                    responsibilities: profile.responsibilities,
                    yearsOfExperience: profile.yearsOfExperience,
                    areasOfExpertise: [...(profile.areasOfExpertise || [])],
                    professionalInterests: [...(profile.professionalInterests || [])],
                  });
                  setIsEditingProf(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0c2340] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Professional Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingProf(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfessional}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {!isEditingProf ? (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Current Designation</span>
                  <span className="font-semibold text-slate-800 text-sm">{profile.designation}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Service Cadre</span>
                  <span className="font-semibold text-slate-800 text-sm">{profile.serviceCadre}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Years of Service</span>
                  <span className="font-semibold text-slate-800 text-sm">{profile.yearsOfExperience} Years</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-slate-500 font-semibold block uppercase text-[11px] tracking-wider">
                  Core Responsibilities & Administrative Scope
                </span>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {profile.responsibilities || 'No specific responsibilities documented yet.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-slate-500 font-semibold block uppercase text-[11px] tracking-wider">
                  Areas of Expertise
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.areasOfExpertise && profile.areasOfExpertise.length > 0 ? (
                    profile.areasOfExpertise.map((exp, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-[#0c2340]/5 text-[#0c2340] border border-[#0c2340]/15 rounded-lg font-medium text-xs"
                      >
                        {exp}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No expertise areas logged.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-500 font-semibold block uppercase text-[11px] tracking-wider">
                  Professional Interests
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.professionalInterests && profile.professionalInterests.length > 0 ? (
                    profile.professionalInterests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-medium text-xs"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No professional interests logged.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Editing form */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Designation</label>
                  <input
                    type="text"
                    value={profForm.designation || ''}
                    onChange={(e) => setProfForm({ ...profForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={profForm.department || ''}
                    onChange={(e) => setProfForm({ ...profForm, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Role</label>
                  <input
                    type="text"
                    value={profForm.jobRole || ''}
                    onChange={(e) => setProfForm({ ...profForm, jobRole: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="45"
                    value={profForm.yearsOfExperience ?? 0}
                    onChange={(e) => setProfForm({ ...profForm, yearsOfExperience: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Assignment / Key Initiative</label>
                <input
                  type="text"
                  value={profForm.currentAssignment || ''}
                  onChange={(e) => setProfForm({ ...profForm, currentAssignment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Core Responsibilities (Official Duties)
                </label>
                <textarea
                  rows={4}
                  value={profForm.responsibilities || ''}
                  onChange={(e) => setProfForm({ ...profForm, responsibilities: e.target.value })}
                  placeholder="Detail file examination, regulatory approvals, citizen interface, or administrative duties..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              {/* Areas of Expertise Tags */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Areas of Expertise</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    placeholder="e.g. Public Financial Rules, e-Office, DPDP Act..."
                    className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-[#0c2340]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (expertiseInput.trim()) {
                          const list = profForm.areasOfExpertise || [];
                          setProfForm({ ...profForm, areasOfExpertise: [...list, expertiseInput.trim()] });
                          setExpertiseInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (expertiseInput.trim()) {
                        const list = profForm.areasOfExpertise || [];
                        setProfForm({ ...profForm, areasOfExpertise: [...list, expertiseInput.trim()] });
                        setExpertiseInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#0c2340] text-white rounded-lg font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profForm.areasOfExpertise || []).map((exp, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs"
                    >
                      <span>{exp}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = (profForm.areasOfExpertise || []).filter((_, idx) => idx !== i);
                          setProfForm({ ...profForm, areasOfExpertise: list });
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Professional Interests Tags */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Professional Interests</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    placeholder="e.g. AI Governance, Cabinet Secretariat Procedures..."
                    className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-[#0c2340]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (interestInput.trim()) {
                          const list = profForm.professionalInterests || [];
                          setProfForm({ ...profForm, professionalInterests: [...list, interestInput.trim()] });
                          setInterestInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (interestInput.trim()) {
                        const list = profForm.professionalInterests || [];
                        setProfForm({ ...profForm, professionalInterests: [...list, interestInput.trim()] });
                        setInterestInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#0c2340] text-white rounded-lg font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profForm.professionalInterests || []).map((interest, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = (profForm.professionalInterests || []).filter((_, idx) => idx !== i);
                          setProfForm({ ...profForm, professionalInterests: list });
                        }}
                        className="text-amber-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 3: EDUCATION */}
      {/* ========================================================================= */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#0c2340]" />
              <h2 className="text-base font-bold text-slate-900">Education & Academic Qualifications</h2>
            </div>
            <button
              onClick={handleOpenAddEdu}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Qualification</span>
            </button>
          </div>

          {profile.education && profile.education.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                      <p className="text-xs font-medium text-slate-600">{edu.specialization}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenEditEdu(edu)}
                        className="p-1.5 text-slate-500 hover:text-[#0c2340] hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Edit record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="font-medium text-slate-700">{edu.institution}</p>
                    <p className="text-slate-500">{edu.university}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="font-semibold text-slate-700">
                        {edu.startYear} — {edu.completionYear}
                      </span>
                      {edu.gradePercentage && (
                        <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded font-medium">
                          {edu.gradePercentage}
                        </span>
                      )}
                    </div>
                  </div>

                  {edu.relevantSkills && (
                    <div className="pt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600">Key Subjects: </span>
                      {edu.relevantSkills}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No educational qualifications added</p>
              <p className="text-xs text-slate-500">Record your degrees to complete your official profile.</p>
              <button
                onClick={handleOpenAddEdu}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0c2340] text-white rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Degree</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 4: EXPERIENCE */}
      {/* ========================================================================= */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-[#0c2340]" />
              <h2 className="text-base font-bold text-slate-900">Work Experience & Government Postings</h2>
            </div>
            <button
              onClick={handleOpenAddExp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Posting</span>
            </button>
          </div>

          {profile.experience && profile.experience.length > 0 ? (
            <div className="space-y-4">
              {profile.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 relative group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{exp.designation}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                          {exp.employmentType}
                        </span>
                        {exp.isCurrentPosition && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Current Posting
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-700">{exp.organization}</p>
                      {exp.department && <p className="text-xs text-slate-500">{exp.department}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {exp.startDate} — {exp.isCurrentPosition ? 'Present' : exp.endDate || 'N/A'}
                      </span>
                      <button
                        onClick={() => handleOpenEditExp(exp)}
                        className="p-1.5 text-slate-500 hover:text-[#0c2340] hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Edit posting"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Delete posting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {exp.responsibilities && (
                    <div className="text-xs text-slate-700 pt-1">
                      <span className="font-semibold text-slate-800">Responsibilities: </span>
                      {exp.responsibilities}
                    </div>
                  )}

                  {exp.keyAchievements && (
                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-800">Key Achievements: </span>
                      {exp.keyAchievements}
                    </div>
                  )}

                  {exp.skillsUsed && (
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600">Skills Utilized: </span>
                      {exp.skillsUsed}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <Building className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No work experience or postings logged</p>
              <p className="text-xs text-slate-500">Add your previous and current postings to build your track record.</p>
              <button
                onClick={handleOpenAddExp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0c2340] text-white rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Current Posting</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 5: TRAINING */}
      {/* ========================================================================= */}
      {activeTab === 'training' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#0c2340]" />
              <h2 className="text-base font-bold text-slate-900">Training History & Certified Programs</h2>
            </div>
            <button
              onClick={handleOpenAddTrain}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Training</span>
            </button>
          </div>

          {profile.training && profile.training.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.training.map((train) => (
                <div
                  key={train.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{train.courseName}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {train.mode}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600">{train.trainingProvider}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTrain(train)}
                        className="p-1.5 text-slate-500 hover:text-[#0c2340] hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Edit training"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTraining(train.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Delete training"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-700">Domain: {train.category}</span>
                    <span className="text-slate-500">Duration: {train.duration}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      {train.startDate} to {train.completionDate}
                    </span>
                    {train.certificateNumber && (
                      <span className="font-mono bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {train.certificateNumber}
                      </span>
                    )}
                  </div>

                  {train.competenciesAcquired && (
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Competencies Acquired: </span>
                      {train.competenciesAcquired}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No training programs logged</p>
              <p className="text-xs text-slate-500">Record programs from ISTM, LBSNAA, iGOT Karmayogi, or NSSTA.</p>
              <button
                onClick={handleOpenAddTrain}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0c2340] text-white rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Training Program</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 6: SKILLS */}
      {/* ========================================================================= */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-[#0c2340]" />
              <h2 className="text-base font-bold text-slate-900">Official Skills & Self-Assessed Proficiency</h2>
            </div>
            <button
              onClick={handleOpenAddSkill}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Statutory Integrity Note */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Self-Assessment Integrity Policy</p>
              <p>
                Self-assessed proficiency logged here serves as profile information only. Calibrated competency ratings
                and official skill scores are evaluated objectively in Step 3 Competency Assessment and Step 7 AI
                Assessment.
              </p>
            </div>
          </div>

          {profile.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.skills.map((skl) => (
                <div
                  key={skl.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{skl.skillName}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                        {skl.skillCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSkill(skl)}
                        className="p-1.5 text-slate-500 hover:text-[#0c2340] hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Edit skill"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skl.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Proficiency Rating Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Self-Assessed Level:</span>
                      <span className="font-bold text-[#0c2340]">
                        {skl.selfAssessedProficiency === 1
                          ? '1 - Beginner'
                          : skl.selfAssessedProficiency === 2
                          ? '2 - Elementary'
                          : skl.selfAssessedProficiency === 3
                          ? '3 - Intermediate'
                          : skl.selfAssessedProficiency === 4
                          ? '4 - Advanced'
                          : '5 - Expert'}
                      </span>
                    </div>

                    <div className="flex gap-1 h-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-sm ${
                            level <= skl.selfAssessedProficiency ? 'bg-[#0c2340]' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Experience: {skl.yearsOfExperience} year(s)</span>
                    {skl.certificationEvidence && (
                      <span className="text-slate-500 text-[11px] truncate max-w-[200px]" title={skl.certificationEvidence}>
                        {skl.certificationEvidence}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <Sliders className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No skills logged in official dossier</p>
              <p className="text-xs text-slate-500">Add technical, behavioral, and administrative skills.</p>
              <button
                onClick={handleOpenAddSkill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0c2340] text-white rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Skill</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 7: LEARNING PREFERENCES */}
      {/* ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#0c2340]" />
              <h2 className="text-base font-bold text-slate-900">Learning & Career Development Preferences</h2>
            </div>
            {!isEditingPrefs ? (
              <button
                onClick={() => {
                  setPrefForm({
                    careerGoals: profile.learningPreferences?.careerGoals || '',
                    preferredFormats: [...(profile.learningPreferences?.preferredFormats || ['Text', 'Interactive'])],
                    preferredLanguage: profile.learningPreferences?.preferredLanguage || 'English',
                    areasToImprove: profile.learningPreferences?.areasToImprove || '',
                    targetCompetencies: profile.learningPreferences?.targetCompetencies || '',
                    learningInterests: profile.learningPreferences?.learningInterests || '',
                  });
                  setIsEditingPrefs(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0c2340] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Preferences</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingPrefs(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            )}
          </div>

          {!isEditingPrefs ? (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-slate-400 font-semibold block uppercase text-[11px] tracking-wider">
                  Career / Promotional Goals
                </span>
                <p className="text-slate-800 text-sm font-medium">
                  {profile.learningPreferences?.careerGoals || 'Not specified'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <span className="text-slate-400 font-semibold block uppercase text-[11px] tracking-wider">
                    Preferred Learning Formats
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {profile.learningPreferences?.preferredFormats?.map((fmt, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-slate-400 font-semibold block uppercase text-[11px] tracking-wider">
                    Preferred Instruction Language
                  </span>
                  <p className="text-slate-800 text-sm font-medium">
                    {profile.learningPreferences?.preferredLanguage || 'English'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-slate-400 font-semibold block uppercase text-[11px] tracking-wider">
                  Priority Areas to Improve
                </span>
                <p className="text-slate-800 text-sm font-medium">
                  {profile.learningPreferences?.areasToImprove || 'Not specified'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-slate-400 font-semibold block uppercase text-[11px] tracking-wider">
                  Target Competencies for Next Milestone
                </span>
                <p className="text-slate-800 text-sm font-medium">
                  {profile.learningPreferences?.targetCompetencies || 'Not specified'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Career / Promotional Goals</label>
                <textarea
                  rows={3}
                  value={prefForm.careerGoals || ''}
                  onChange={(e) => setPrefForm({ ...prefForm, careerGoals: e.target.value })}
                  placeholder="e.g. Prepare for promotion to Section Officer / Deputy Secretary..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">Preferred Learning Formats</label>
                <div className="flex flex-wrap gap-4">
                  {(['Text', 'Video', 'Audio', 'Interactive'] as const).map((format) => {
                    const isSelected = (prefForm.preferredFormats || []).includes(format);
                    return (
                      <label key={format} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const cur = prefForm.preferredFormats || [];
                            if (e.target.checked) {
                              setPrefForm({ ...prefForm, preferredFormats: [...cur, format] });
                            } else {
                              setPrefForm({ ...prefForm, preferredFormats: cur.filter((f) => f !== format) });
                            }
                          }}
                          className="rounded text-[#0c2340] focus:ring-[#0c2340]"
                        />
                        <span>{format}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Preferred Language</label>
                <input
                  type="text"
                  value={prefForm.preferredLanguage || ''}
                  onChange={(e) => setPrefForm({ ...prefForm, preferredLanguage: e.target.value })}
                  placeholder="e.g. English, Hindi, Bilingual"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Areas You Wish to Improve</label>
                <input
                  type="text"
                  value={prefForm.areasToImprove || ''}
                  onChange={(e) => setPrefForm({ ...prefForm, areasToImprove: e.target.value })}
                  placeholder="e.g. Public Financial Management (GFR Rules), Data Governance, e-Office"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Competencies</label>
                <input
                  type="text"
                  value={prefForm.targetCompetencies || ''}
                  onChange={(e) => setPrefForm({ ...prefForm, targetCompetencies: e.target.value })}
                  placeholder="e.g. Public Procurement, Regulatory Drafting"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BASIC INFO EDIT */}
      {/* ========================================================================= */}
      {isEditingBasic && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Basic / Official Information</h3>
              <button onClick={() => setIsEditingBasic(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={basicForm.fullName || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={basicForm.mobileNumber || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, mobileNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={basicForm.dateOfBirth || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                <select
                  value={basicForm.gender || 'Male'}
                  onChange={(e) => setBasicForm({ ...basicForm, gender: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={basicForm.designation || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Service Cadre</label>
                <input
                  type="text"
                  value={basicForm.serviceCadre || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, serviceCadre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={basicForm.department || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Current Assignment</label>
                <input
                  type="text"
                  value={basicForm.currentAssignment || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, currentAssignment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={basicForm.dateOfJoining || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, dateOfJoining: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work Location</label>
                <input
                  type="text"
                  value={basicForm.workLocation || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, workLocation: e.target.value })}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              {/* System Managed Notice */}
              <div className="sm:col-span-2 p-3 bg-slate-50 border rounded-lg text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">System Controlled: </span>
                Official Email ({profile.officialEmail}), Employee ID ({profile.employeeId}), and Organization
                (Government of India) are verified through digital service records and cannot be edited.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingBasic(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBasic}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDUCATION (ADD / EDIT) */}
      {/* ========================================================================= */}
      {educationModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {educationModal.mode === 'add' ? 'Add Qualification' : 'Edit Qualification'}
              </h3>
              <button
                onClick={() => setEducationModal({ open: false, mode: 'add' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Degree / Qualification *</label>
                <input
                  type="text"
                  value={eduForm.degree || ''}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  placeholder="e.g. Master of Public Administration, B.Tech, B.A."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Specialization / Field of Study</label>
                <input
                  type="text"
                  value={eduForm.specialization || ''}
                  onChange={(e) => setEduForm({ ...eduForm, specialization: e.target.value })}
                  placeholder="e.g. Public Policy, Computer Science, Economics"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Institution Name *</label>
                <input
                  type="text"
                  value={eduForm.institution || ''}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="e.g. Hindu College, IIT Delhi, St. Stephen's"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">University / Board</label>
                <input
                  type="text"
                  value={eduForm.university || ''}
                  onChange={(e) => setEduForm({ ...eduForm, university: e.target.value })}
                  placeholder="e.g. University of Delhi, IGNOU"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Year</label>
                  <input
                    type="number"
                    value={eduForm.startYear || ''}
                    onChange={(e) => setEduForm({ ...eduForm, startYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Completion Year *</label>
                  <input
                    type="number"
                    value={eduForm.completionYear || ''}
                    onChange={(e) => setEduForm({ ...eduForm, completionYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Grade / CGPA / Percentage (Optional)</label>
                <input
                  type="text"
                  value={eduForm.gradePercentage || ''}
                  onChange={(e) => setEduForm({ ...eduForm, gradePercentage: e.target.value })}
                  placeholder="e.g. 78%, 8.5 CGPA, First Class"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Relevant Subjects / Skills Acquired</label>
                <input
                  type="text"
                  value={eduForm.relevantSkills || ''}
                  onChange={(e) => setEduForm({ ...eduForm, relevantSkills: e.target.value })}
                  placeholder="e.g. Constitutional Law, Statistical Methods, Financial Management"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEducationModal({ open: false, mode: 'add' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEducation}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Qualification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXPERIENCE (ADD / EDIT) */}
      {/* ========================================================================= */}
      {experienceModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {experienceModal.mode === 'add' ? 'Add Work Posting' : 'Edit Work Posting'}
              </h3>
              <button
                onClick={() => setExperienceModal({ open: false, mode: 'add' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization / Ministry *</label>
                <input
                  type="text"
                  value={expForm.organization || ''}
                  onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
                  placeholder="e.g. Ministry of Personnel, Ministry of Finance"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department / Division</label>
                <input
                  type="text"
                  value={expForm.department || ''}
                  onChange={(e) => setExpForm({ ...expForm, department: e.target.value })}
                  placeholder="e.g. Administrative Reforms, Expenditure Division"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Designation / Role *</label>
                <input
                  type="text"
                  value={expForm.designation || ''}
                  onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                  placeholder="e.g. Assistant Section Officer, Under Secretary"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employment Type</label>
                <select
                  value={expForm.employmentType || 'Permanent'}
                  onChange={(e) => setExpForm({ ...expForm, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Deputation">Deputation</option>
                  <option value="Contract">Contract</option>
                  <option value="Probationary">Probationary / Trainee</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="currPos"
                  checked={Boolean(expForm.isCurrentPosition)}
                  onChange={(e) => setExpForm({ ...expForm, isCurrentPosition: e.target.checked })}
                  className="rounded text-[#0c2340]"
                />
                <label htmlFor="currPos" className="text-slate-800 font-semibold">
                  This is my current official posting
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={expForm.startDate || ''}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                {!expForm.isCurrentPosition && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      value={expForm.endDate || ''}
                      onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Key Responsibilities</label>
                <textarea
                  rows={2}
                  value={expForm.responsibilities || ''}
                  onChange={(e) => setExpForm({ ...expForm, responsibilities: e.target.value })}
                  placeholder="Detail primary duties, docket disposal, file handling..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Key Achievements</label>
                <input
                  type="text"
                  value={expForm.keyAchievements || ''}
                  onChange={(e) => setExpForm({ ...expForm, keyAchievements: e.target.value })}
                  placeholder="e.g. Spearheaded digitized workflow reducing turnaround by 20%"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Skills Used</label>
                <input
                  type="text"
                  value={expForm.skillsUsed || ''}
                  onChange={(e) => setExpForm({ ...expForm, skillsUsed: e.target.value })}
                  placeholder="e.g. GeM, GFR Rules, e-Office"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExperienceModal({ open: false, mode: 'add' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExperience}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Posting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRAINING (ADD / EDIT) */}
      {/* ========================================================================= */}
      {trainingModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {trainingModal.mode === 'add' ? 'Log Training Program' : 'Edit Training Program'}
              </h3>
              <button
                onClick={() => setTrainingModal({ open: false, mode: 'add' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course / Training Name *</label>
                <input
                  type="text"
                  value={trainForm.courseName || ''}
                  onChange={(e) => setTrainForm({ ...trainForm, courseName: e.target.value })}
                  placeholder="e.g. Foundational Course on Public Procurement"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Training Provider *</label>
                <input
                  type="text"
                  value={trainForm.trainingProvider || ''}
                  onChange={(e) => setTrainForm({ ...trainForm, trainingProvider: e.target.value })}
                  placeholder="e.g. ISTM, LBSNAA, iGOT Karmayogi Bharat, NSSTA"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category / Domain</label>
                  <input
                    type="text"
                    value={trainForm.category || ''}
                    onChange={(e) => setTrainForm({ ...trainForm, category: e.target.value })}
                    placeholder="e.g. Financial Governance"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mode</label>
                  <select
                    value={trainForm.mode || 'Online'}
                    onChange={(e) => setTrainForm({ ...trainForm, mode: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={trainForm.startDate || ''}
                    onChange={(e) => setTrainForm({ ...trainForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Completion Date *</label>
                  <input
                    type="date"
                    value={trainForm.completionDate || ''}
                    onChange={(e) => setTrainForm({ ...trainForm, completionDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={trainForm.duration || ''}
                    onChange={(e) => setTrainForm({ ...trainForm, duration: e.target.value })}
                    placeholder="e.g. 4 Weeks, 30 Hours"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Certificate / Credential No.</label>
                  <input
                    type="text"
                    value={trainForm.certificateNumber || ''}
                    onChange={(e) => setTrainForm({ ...trainForm, certificateNumber: e.target.value })}
                    placeholder="e.g. ISTM/2024/991"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Competencies / Skills Acquired</label>
                <input
                  type="text"
                  value={trainForm.competenciesAcquired || ''}
                  onChange={(e) => setTrainForm({ ...trainForm, competenciesAcquired: e.target.value })}
                  placeholder="e.g. GFR 2017, GeM Portal Bidding, Conduct Rules"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTrainingModal({ open: false, mode: 'add' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTraining}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Training'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SKILL (ADD / EDIT) */}
      {/* ========================================================================= */}
      {skillModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {skillModal.mode === 'add' ? 'Add Official Skill' : 'Edit Official Skill'}
              </h3>
              <button
                onClick={() => setSkillModal({ open: false, mode: 'add' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={skillForm.skillName || ''}
                  onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  placeholder="e.g. Public Financial Rules, e-Office, Statistical Sampling"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={skillForm.skillCategory || 'Domain-specific'}
                  onChange={(e) => setSkillForm({ ...skillForm, skillCategory: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                >
                  <option value="Domain-specific">Domain-specific</option>
                  <option value="Functional">Functional</option>
                  <option value="Technical">Technical</option>
                  <option value="Statistical">Statistical</option>
                  <option value="Digital">Digital</option>
                  <option value="Behavioural">Behavioural</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Self-Assessed Proficiency (1 to 5)</label>
                  <span className="font-bold text-[#0c2340]">
                    Level {skillForm.selfAssessedProficiency || 3} of 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={skillForm.selfAssessedProficiency || 3}
                  onChange={(e) => setSkillForm({ ...skillForm, selfAssessedProficiency: Number(e.target.value) as any })}
                  className="w-full accent-[#0c2340]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1: Beginner</span>
                  <span>2: Elementary</span>
                  <span>3: Intermediate</span>
                  <span>4: Advanced</span>
                  <span>5: Expert</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Years of Practical Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={skillForm.yearsOfExperience ?? 1}
                  onChange={(e) => setSkillForm({ ...skillForm, yearsOfExperience: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Evidence / Certification / Project (Optional)</label>
                <input
                  type="text"
                  value={skillForm.certificationEvidence || ''}
                  onChange={(e) => setSkillForm({ ...skillForm, certificationEvidence: e.target.value })}
                  placeholder="e.g. iGOT Certified Procurement Official (2024)"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-[#0c2340]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSkillModal({ open: false, mode: 'add' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSkill}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold bg-[#0c2340] text-white hover:bg-slate-800 rounded-lg shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

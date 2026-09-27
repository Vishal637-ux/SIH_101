import {
  FullOfficialProfile,
  EducationRecord,
  ExperienceRecord,
  TrainingRecord,
  OfficialSkillRecord,
  LearningPreferences,
  ProfileCompletionStatus,
} from '../src/types.js';

// In-Memory Relational Database Tables for Official Profile Management (Module 02)
export interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    fullName: string;
    role: string;
    cadre: string;
    organization: string;
    createdAt: string;
  }>;
  official_profiles: Record<string, FullOfficialProfile>;
}

// Initial Seed Data complying with civil service standards (DoPT / Karmayogi Bharat)
const INITIAL_DATABASE: DatabaseSchema = {
  users: [
    {
      id: 'off-001',
      email: 'rajesh.sharma@gov.in',
      fullName: 'Rajesh Sharma',
      role: 'official',
      cadre: 'Central Secretariat Service (CSS)',
      organization: 'Government of India',
      createdAt: '2023-01-15T10:00:00Z',
    },
    {
      id: 'off-002',
      email: 'meera.verma@gov.in',
      fullName: 'Dr. Meera Verma',
      role: 'official',
      cadre: 'Indian Administrative Service (IAS)',
      organization: 'Government of India',
      createdAt: '2021-08-01T09:30:00Z',
    },
  ],
  official_profiles: {
    'off-001': {
      id: 'prof-001',
      userId: 'off-001',
      fullName: 'Rajesh Sharma',
      officialEmail: 'rajesh.sharma@gov.in',
      employeeId: 'GOI-CSS-2018-0941',
      profilePhoto: '',
      mobileNumber: '+91 98765 43210',
      dateOfBirth: '1991-07-14',
      gender: 'Male',
      organization: 'Government of India',
      department: 'Department of Administrative Reforms & Public Grievances (DARPG)',
      designation: 'Assistant Section Officer (ASO)',
      jobRole: 'Section Administration & General Financial Rules Review',
      currentAssignment: 'CPGRAMS Citizen Grievance Portal Quality Audits & Public Procurement Verification',
      serviceCadre: 'Central Secretariat Service (CSS)',
      dateOfJoining: '2018-08-20',
      workLocation: 'Sardar Patel Bhawan, Parliament Street, New Delhi',

      currentDesignation: 'Assistant Section Officer (ASO)',
      responsibilities: 'File movement scrutiny under Manual of Office Procedure (e-Office), review of public grievances escalation matrix, preparation of procurement notes for GeM bidding, and RTI query examination.',
      yearsOfExperience: 6,
      areasOfExpertise: [
        'Public Procurement & GeM Rules',
        'e-Office Workflow & MOP Compliance',
        'Right to Information (RTI) Case Review',
        'Citizen Grievance Redressal (CPGRAMS)',
      ],
      professionalInterests: [
        'Public Financial Management (GFR 2017)',
        'Digital Public Infrastructure in Governance',
        'Administrative Law & Cabinet Note Procedures',
      ],

      education: [
        {
          id: 'edu-001',
          degree: 'Bachelor of Arts (Honours)',
          specialization: 'Public Administration & Political Science',
          institution: 'Hindu College',
          university: 'University of Delhi',
          startYear: 2010,
          completionYear: 2013,
          gradePercentage: '74.5%',
          relevantSkills: 'Indian Constitution, Public Policy Analysis, Administrative History',
          createdAt: '2023-01-15T10:00:00Z',
        },
        {
          id: 'edu-002',
          degree: 'Master of Public Administration (MPA)',
          specialization: 'Governance & Public Financial Management',
          institution: 'Faculty of Social Sciences',
          university: 'Indira Gandhi National Open University (IGNOU)',
          startYear: 2014,
          completionYear: 2016,
          gradePercentage: '71.0%',
          relevantSkills: 'Public Budgeting, Comparative Public Administration, State Government Operations',
          createdAt: '2023-01-15T10:00:00Z',
        },
      ],

      experience: [
        {
          id: 'exp-001',
          organization: 'Ministry of Personnel, Public Grievances & Pensions',
          department: 'Department of Administrative Reforms & Public Grievances',
          designation: 'Assistant Section Officer',
          employmentType: 'Permanent',
          startDate: '2021-04-01',
          isCurrentPosition: true,
          responsibilities: 'Administering citizen grievance disposal benchmarks, preparing monthly compliance dockets for Joint Secretary, analyzing GeM purchase orders.',
          keyAchievements: 'Reduced grievance pendency turnaround time in DARPG section by 22% via automated e-Office tracking.',
          skillsUsed: 'e-Office 7.0, GeM 4.0, GFR Rules, Inter-Ministerial Coordination',
          createdAt: '2023-01-15T10:00:00Z',
        },
        {
          id: 'exp-002',
          organization: 'Ministry of Home Affairs',
          department: 'Internal Security - II Division',
          designation: 'Assistant Section Officer (Trainee / Probationer)',
          employmentType: 'Probationary',
          startDate: '2018-08-20',
          endDate: '2021-03-31',
          isCurrentPosition: false,
          responsibilities: 'Handling confidential security dispatch, liaison with state police headquarters, and cataloging VIP security advisory files.',
          keyAchievements: 'Successfully cleared ISTM Foundation Course with Grade A Distinction.',
          skillsUsed: 'Office Procedure, Statutory Filing, Security Protocols',
          createdAt: '2023-01-15T10:00:00Z',
        },
      ],

      training: [
        {
          id: 'trn-001',
          courseName: 'CSS Foundational Training Course (CFTC-48)',
          trainingProvider: 'Institute of Secretariat Training and Management (ISTM)',
          category: 'Statutory Administration',
          startDate: '2018-09-01',
          completionDate: '2018-12-15',
          duration: '15 Weeks',
          mode: 'Offline',
          certificateNumber: 'ISTM/CFTC/2018/142',
          competenciesAcquired: 'Manual of Office Procedure (MOP), GFR 2017, Conduct Rules 1964, Fundamental & Supplementary Rules (FR/SR)',
          createdAt: '2023-01-15T10:00:00Z',
        },
        {
          id: 'trn-002',
          courseName: 'Public Procurement & GeM Masterclass for Section Officers',
          trainingProvider: 'iGOT Karmayogi Bharat',
          category: 'Financial Governance',
          startDate: '2024-02-05',
          completionDate: '2024-02-28',
          duration: '24 Hours',
          mode: 'Online',
          certificateNumber: 'iGOT/2024/GEM-9931',
          competenciesAcquired: 'Reverse Bidding Rules, Single Tender Exceptions, Consignee Receipt and Acceptance Certificate (CRAC) Timelines',
          createdAt: '2024-03-01T10:00:00Z',
        },
      ],

      skills: [
        {
          id: 'skl-001',
          skillName: 'Public Procurement & GeM Rules',
          skillCategory: 'Domain-specific',
          selfAssessedProficiency: 3,
          yearsOfExperience: 5,
          certificationEvidence: 'iGOT Certified Procurement Official (2024)',
          createdAt: '2023-01-15T10:00:00Z',
        },
        {
          id: 'skl-002',
          skillName: 'e-Office 7.0 & File Lifecycle Management',
          skillCategory: 'Digital',
          selfAssessedProficiency: 4,
          yearsOfExperience: 6,
          certificationEvidence: 'NIC e-Office Master Trainer Badge',
          createdAt: '2023-01-15T10:00:00Z',
        },
        {
          id: 'skl-003',
          skillName: 'Statistical Data Compilation & Indexing',
          skillCategory: 'Statistical',
          selfAssessedProficiency: 3,
          yearsOfExperience: 3,
          certificationEvidence: 'DARPG Departmental Survey Analysis (2023)',
          createdAt: '2023-01-15T10:00:00Z',
        },
        {
          id: 'skl-004',
          skillName: 'Ethical Decision Making & Citizen Centricity',
          skillCategory: 'Behavioural',
          selfAssessedProficiency: 4,
          yearsOfExperience: 6,
          certificationEvidence: 'Civil Services Code of Conduct Orientation',
          createdAt: '2023-01-15T10:00:00Z',
        },
      ],

      learningPreferences: {
        careerGoals: 'Attain Section Officer promotion through LDCE and specialize in Public Finance & Cabinet Secretariat coordination.',
        preferredFormats: ['Interactive', 'Text', 'Video'],
        preferredLanguage: 'English / Hindi (Bilingual)',
        areasToImprove: 'Public Financial Management (GFR Rules 130-175), DPDP Act compliance in citizen portals, and Advanced Excel Dashboarding.',
        targetCompetencies: 'Public Procurement & GeM Rules, Data-Driven Policy Evaluation',
        learningInterests: 'Public policy design, e-governance standards, regulatory impact evaluation',
        updatedAt: '2024-03-01T10:00:00Z',
      },
    },

    'off-002': {
      id: 'prof-002',
      userId: 'off-002',
      fullName: 'Dr. Meera Verma',
      officialEmail: 'meera.verma@gov.in',
      employeeId: 'GOI-IAS-2015-0108',
      profilePhoto: '',
      mobileNumber: '+91 98111 22334',
      dateOfBirth: '1987-11-05',
      gender: 'Female',
      organization: 'Government of India',
      department: 'Digital Governance & Emerging Technologies Division',
      designation: 'Deputy Secretary (Policy & Planning)',
      jobRole: 'National Digital Identity & Data Protection Policy Architecture',
      currentAssignment: 'Implementation Guidelines for Digital Personal Data Protection (DPDP) Act 2023 across Ministries',
      serviceCadre: 'Indian Administrative Service (IAS)',
      dateOfJoining: '2015-09-01',
      workLocation: 'Electronics Niketan, CGO Complex, Lodhi Road, New Delhi',

      currentDesignation: 'Deputy Secretary (Policy & Planning)',
      responsibilities: 'Formulating policy frameworks for trusted digital public infrastructure, inter-ministerial data sharing protocols, and representing MeitY at bilateral digital economy taskforces.',
      yearsOfExperience: 11,
      areasOfExpertise: [
        'Digital Public Infrastructure (DPI)',
        'Data Governance & Privacy Frameworks (DPDP Act)',
        'Public-Private Partnership (PPP) in Technology',
        'Cabinet Memorandum Drafting',
      ],
      professionalInterests: [
        'Ethical Artificial Intelligence in Public Administration',
        'Cross-Border Data Flows & Sovereign Tech Stacks',
        'Public Expenditure Quality in IT Procurement',
      ],

      education: [
        {
          id: 'edu-201',
          degree: 'Bachelor of Technology (B.Tech)',
          specialization: 'Computer Science & Engineering',
          institution: 'Indian Institute of Technology (IIT) Roorkee',
          university: 'IIT Roorkee',
          startYear: 2005,
          completionYear: 2009,
          gradePercentage: '8.8 CGPA',
          relevantSkills: 'Distributed Systems, Information Security, Network Architecture',
          createdAt: '2021-08-01T09:30:00Z',
        },
        {
          id: 'edu-202',
          degree: 'Ph.D. in Public Policy & Technology Governance',
          specialization: 'Information Economics & Regulated Markets',
          institution: 'Indian Institute of Management (IIM) Bangalore',
          university: 'IIM Bangalore',
          startYear: 2010,
          completionYear: 2014,
          gradePercentage: 'Distinction',
          relevantSkills: 'Econometrics, Policy Impact Evaluation, Regulatory Law',
          createdAt: '2021-08-01T09:30:00Z',
        },
      ],

      experience: [
        {
          id: 'exp-201',
          organization: 'Ministry of Electronics & Information Technology (MeitY)',
          department: 'Emerging Technologies Division',
          designation: 'Deputy Secretary',
          employmentType: 'Permanent',
          startDate: '2021-06-01',
          isCurrentPosition: true,
          responsibilities: 'Supervising national AI mission guidelines and data governance architecture.',
          keyAchievements: 'Drafted National Data Governance Framework standard operating procedure consulted with 40+ ministries.',
          skillsUsed: 'Policy Drafting, Strategic Negotiations, Inter-Ministerial Consensuses',
          createdAt: '2021-08-01T09:30:00Z',
        },
      ],

      training: [
        {
          id: 'trn-201',
          courseName: 'IAS Phase-IV Mid-Career Training Program',
          trainingProvider: 'Lal Bahadur Shastri National Academy of Administration (LBSNAA)',
          category: 'Executive Leadership',
          startDate: '2023-05-01',
          completionDate: '2023-06-15',
          duration: '6 Weeks',
          mode: 'Offline',
          certificateNumber: 'LBSNAA/MCTP4/2023/88',
          competenciesAcquired: 'Strategic Foresight, Public Finance, Crisis Leadership',
          createdAt: '2023-07-01T10:00:00Z',
        },
      ],

      skills: [
        {
          id: 'skl-201',
          skillName: 'Digital Governance & Data Privacy Compliance',
          skillCategory: 'Domain-specific',
          selfAssessedProficiency: 5,
          yearsOfExperience: 11,
          certificationEvidence: 'Statutory drafter for National DPDP Rules Committee',
          createdAt: '2021-08-01T09:30:00Z',
        },
        {
          id: 'skl-202',
          skillName: 'Public Policy Formulation & Regulatory Impact',
          skillCategory: 'Domain-specific',
          selfAssessedProficiency: 5,
          yearsOfExperience: 11,
          certificationEvidence: 'Ph.D. in Public Policy & Technology Governance',
          createdAt: '2021-08-01T09:30:00Z',
        },
      ],

      learningPreferences: {
        careerGoals: 'Advance to Director / Joint Secretary grade in economic policy and represent national digital sovereignty frameworks in global fora.',
        preferredFormats: ['Text', 'Interactive'],
        preferredLanguage: 'English',
        areasToImprove: 'Advanced Financial Auditing under CAG mandates and Sovereign Bond Financing.',
        targetCompetencies: 'Public Finance, Strategic Cabinet Submissions',
        learningInterests: 'Digital economy, national cybersecurity architecture, multilateral treaties',
        updatedAt: '2023-08-01T10:00:00Z',
      },
    },
  },
};

// Deep copy for mutable in-memory state
const db: DatabaseSchema = JSON.parse(JSON.stringify(INITIAL_DATABASE));

// Helper: Calculate Profile Completion Status
// Profile completion is strictly profile completeness and NOT competency score
export function calculateProfileCompletion(profile: FullOfficialProfile): ProfileCompletionStatus {
  // 1. Basic Info: Name, mobile, DOB, gender, department, designation, currentAssignment, location
  const basicFields = [
    profile.fullName,
    profile.officialEmail,
    profile.employeeId,
    profile.mobileNumber,
    profile.department,
    profile.designation,
    profile.currentAssignment,
    profile.serviceCadre,
    profile.dateOfJoining,
    profile.workLocation,
  ];
  const basicFilled = basicFields.filter((f) => f && String(f).trim().length > 0).length;
  const basicInfoCompleted = basicFilled >= 8;

  // 2. Professional Info: responsibilities, yearsOfExperience, areasOfExpertise, professionalInterests
  const profCompleted =
    Boolean(profile.responsibilities && profile.responsibilities.trim().length > 10) &&
    Boolean(profile.areasOfExpertise && profile.areasOfExpertise.length > 0) &&
    Boolean(profile.yearsOfExperience >= 0);

  // 3. Education: at least 1 record
  const educationCompleted = Array.isArray(profile.education) && profile.education.length > 0;

  // 4. Experience: at least 1 record
  const experienceCompleted = Array.isArray(profile.experience) && profile.experience.length > 0;

  // 5. Training History: at least 1 record
  const trainingCompleted = Array.isArray(profile.training) && profile.training.length > 0;

  // 6. Skills: at least 2 skills
  const skillsCompleted = Array.isArray(profile.skills) && profile.skills.length >= 2;

  // 7. Learning Preferences: careerGoals, preferredFormats, areasToImprove
  const prefs = profile.learningPreferences;
  const preferencesCompleted = Boolean(
    prefs &&
    prefs.careerGoals &&
    prefs.careerGoals.trim().length > 5 &&
    Array.isArray(prefs.preferredFormats) &&
    prefs.preferredFormats.length > 0 &&
    prefs.areasToImprove &&
    prefs.areasToImprove.trim().length > 5
  );

  // Weights sum to 100
  const weights = {
    basicInfo: 20,
    professional: 15,
    education: 15,
    experience: 15,
    training: 15,
    skills: 10,
    preferences: 10,
  };

  let totalScore = 0;
  if (basicInfoCompleted) totalScore += weights.basicInfo;
  if (profCompleted) totalScore += weights.professional;
  if (educationCompleted) totalScore += weights.education;
  if (experienceCompleted) totalScore += weights.experience;
  if (trainingCompleted) totalScore += weights.training;
  if (skillsCompleted) totalScore += weights.skills;
  if (preferencesCompleted) totalScore += weights.preferences;

  const incompleteSections: string[] = [];
  if (!basicInfoCompleted) incompleteSections.push('Basic / Official Information');
  if (!profCompleted) incompleteSections.push('Professional Profile');
  if (!educationCompleted) incompleteSections.push('Education Records');
  if (!experienceCompleted) incompleteSections.push('Work Experience');
  if (!trainingCompleted) incompleteSections.push('Training History');
  if (!skillsCompleted) incompleteSections.push('Skills & Expertise');
  if (!preferencesCompleted) incompleteSections.push('Learning Preferences');

  let recommendation = 'Your profile is fully populated with comprehensive service records.';
  if (incompleteSections.length > 0) {
    recommendation = `Complete ${incompleteSections.slice(0, 2).join(' and ')} to unlock more precise AI competency recommendations.`;
  }

  return {
    percentage: Math.min(100, totalScore),
    sections: {
      basicInfo: {
        completed: basicInfoCompleted,
        label: 'Basic / Official Information',
        weight: weights.basicInfo,
        detail: basicInfoCompleted ? 'Identity and cadre verified' : 'Requires mobile or location details',
      },
      professional: {
        completed: profCompleted,
        label: 'Professional Profile',
        weight: weights.professional,
        detail: profCompleted ? 'Responsibilities and expertise logged' : 'Responsibilities or expertise missing',
      },
      education: {
        completed: educationCompleted,
        label: `Education Records (${profile.education?.length || 0})`,
        weight: weights.education,
        detail: educationCompleted ? `${profile.education.length} degree(s) on record` : 'No qualifications added',
      },
      experience: {
        completed: experienceCompleted,
        label: `Work Experience (${profile.experience?.length || 0})`,
        weight: weights.experience,
        detail: experienceCompleted ? `${profile.experience.length} posting(s) on record` : 'No work experience added',
      },
      training: {
        completed: trainingCompleted,
        label: `Training History (${profile.training?.length || 0})`,
        weight: weights.training,
        detail: trainingCompleted ? `${profile.training.length} certified program(s)` : 'No official trainings logged',
      },
      skills: {
        completed: skillsCompleted,
        label: `Skills & Expertise (${profile.skills?.length || 0})`,
        weight: weights.skills,
        detail: skillsCompleted ? `${profile.skills.length} self-assessed skills` : 'Minimum 2 skills recommended',
      },
      preferences: {
        completed: preferencesCompleted,
        label: 'Learning & Career Preferences',
        weight: weights.preferences,
        detail: preferencesCompleted ? 'Aspirational goals configured' : 'Preferences incomplete',
      },
    },
    incompleteSections,
    recommendation,
  };
}

// ----------------------------------------------------
// Database Access Layer (DAO) for Module 02
// ----------------------------------------------------

export const profileStore = {
  // Get official profile by authenticated userId
  getProfile(userId: string): FullOfficialProfile | null {
    const profile = db.official_profiles[userId];
    if (!profile) return null;
    const cloned = JSON.parse(JSON.stringify(profile)) as FullOfficialProfile;
    cloned.completionStatus = calculateProfileCompletion(cloned);
    return cloned;
  },

  // Update profile basic / professional / preferences (Guards system-controlled fields)
  updateProfile(userId: string, updates: Partial<FullOfficialProfile>): { profile: FullOfficialProfile; modifiedFields: string[] } {
    let profile = db.official_profiles[userId];
    if (!profile) {
      // Create new profile scaffold if first time
      profile = {
        id: `prof-${Date.now()}`,
        userId,
        fullName: updates.fullName || 'Official',
        officialEmail: updates.officialEmail || `${userId}@gov.in`,
        employeeId: updates.employeeId || `GOI-${Date.now().toString().slice(-6)}`,
        mobileNumber: updates.mobileNumber || '',
        organization: 'Government of India',
        department: updates.department || 'General Administration',
        designation: updates.designation || 'Officer',
        jobRole: updates.jobRole || 'Administrative Officer',
        currentAssignment: updates.currentAssignment || 'Departmental Operations',
        serviceCadre: updates.serviceCadre || 'Central Secretariat Service (CSS)',
        dateOfJoining: updates.dateOfJoining || new Date().toISOString().slice(0, 10),
        workLocation: updates.workLocation || 'New Delhi',
        currentDesignation: updates.designation || 'Officer',
        responsibilities: updates.responsibilities || '',
        yearsOfExperience: updates.yearsOfExperience || 1,
        areasOfExpertise: updates.areasOfExpertise || [],
        professionalInterests: updates.professionalInterests || [],
        education: [],
        experience: [],
        training: [],
        skills: [],
        learningPreferences: {
          careerGoals: '',
          preferredFormats: ['Text', 'Interactive'],
          preferredLanguage: 'English',
          areasToImprove: '',
          targetCompetencies: '',
          learningInterests: '',
        },
      };
      db.official_profiles[userId] = profile;
    }

    const modifiedFields: string[] = [];

    // Allowed editable fields
    if (updates.fullName !== undefined) {
      profile.fullName = updates.fullName.trim();
      modifiedFields.push('fullName');
    }
    if (updates.mobileNumber !== undefined) {
      profile.mobileNumber = updates.mobileNumber.trim();
      modifiedFields.push('mobileNumber');
    }
    if (updates.dateOfBirth !== undefined) {
      profile.dateOfBirth = updates.dateOfBirth;
      modifiedFields.push('dateOfBirth');
    }
    if (updates.gender !== undefined) {
      profile.gender = updates.gender;
      modifiedFields.push('gender');
    }
    if (updates.department !== undefined) {
      profile.department = updates.department.trim();
      modifiedFields.push('department');
    }
    if (updates.designation !== undefined) {
      profile.designation = updates.designation.trim();
      profile.currentDesignation = updates.designation.trim();
      modifiedFields.push('designation');
    }
    if (updates.jobRole !== undefined) {
      profile.jobRole = updates.jobRole.trim();
      modifiedFields.push('jobRole');
    }
    if (updates.currentAssignment !== undefined) {
      profile.currentAssignment = updates.currentAssignment.trim();
      modifiedFields.push('currentAssignment');
    }
    if (updates.serviceCadre !== undefined) {
      profile.serviceCadre = updates.serviceCadre.trim();
      modifiedFields.push('serviceCadre');
    }
    if (updates.dateOfJoining !== undefined) {
      profile.dateOfJoining = updates.dateOfJoining;
      modifiedFields.push('dateOfJoining');
    }
    if (updates.workLocation !== undefined) {
      profile.workLocation = updates.workLocation.trim();
      modifiedFields.push('workLocation');
    }
    if (updates.profilePhoto !== undefined) {
      profile.profilePhoto = updates.profilePhoto;
      modifiedFields.push('profilePhoto');
    }

    // Professional profile fields
    if (updates.responsibilities !== undefined) {
      profile.responsibilities = updates.responsibilities.trim();
      modifiedFields.push('responsibilities');
    }
    if (updates.yearsOfExperience !== undefined) {
      profile.yearsOfExperience = Number(updates.yearsOfExperience) || 0;
      modifiedFields.push('yearsOfExperience');
    }
    if (Array.isArray(updates.areasOfExpertise)) {
      profile.areasOfExpertise = updates.areasOfExpertise.map((s) => String(s).trim()).filter(Boolean);
      modifiedFields.push('areasOfExpertise');
    }
    if (Array.isArray(updates.professionalInterests)) {
      profile.professionalInterests = updates.professionalInterests.map((s) => String(s).trim()).filter(Boolean);
      modifiedFields.push('professionalInterests');
    }

    // Learning Preferences
    if (updates.learningPreferences) {
      profile.learningPreferences = {
        careerGoals: updates.learningPreferences.careerGoals || profile.learningPreferences.careerGoals || '',
        preferredFormats: updates.learningPreferences.preferredFormats || profile.learningPreferences.preferredFormats || ['Text'],
        preferredLanguage: updates.learningPreferences.preferredLanguage || profile.learningPreferences.preferredLanguage || 'English',
        areasToImprove: updates.learningPreferences.areasToImprove || profile.learningPreferences.areasToImprove || '',
        targetCompetencies: updates.learningPreferences.targetCompetencies || profile.learningPreferences.targetCompetencies || '',
        learningInterests: updates.learningPreferences.learningInterests || profile.learningPreferences.learningInterests || '',
        updatedAt: new Date().toISOString(),
      };
      modifiedFields.push('learningPreferences');
    }

    profile.updatedAt = new Date().toISOString();

    const cloned = JSON.parse(JSON.stringify(profile)) as FullOfficialProfile;
    cloned.completionStatus = calculateProfileCompletion(cloned);
    return { profile: cloned, modifiedFields };
  },

  // ---------------- EDUCATION CRUD ----------------
  addEducation(userId: string, data: Omit<EducationRecord, 'id'>): EducationRecord {
    const profile = this.getProfile(userId);
    if (!profile) throw new Error('Profile not found for user');

    const newId = `edu-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: EducationRecord = {
      id: newId,
      degree: data.degree?.trim() || '',
      specialization: data.specialization?.trim() || '',
      institution: data.institution?.trim() || '',
      university: data.university?.trim() || '',
      startYear: Number(data.startYear),
      completionYear: Number(data.completionYear),
      gradePercentage: data.gradePercentage?.trim() || '',
      relevantSkills: data.relevantSkills?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.official_profiles[userId].education.unshift(newRecord);
    db.official_profiles[userId].updatedAt = new Date().toISOString();
    return newRecord;
  },

  updateEducation(userId: string, id: string, data: Partial<EducationRecord>): EducationRecord {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const index = profile.education.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Education record with ID ${id} not found`);

    const existing = profile.education[index];
    const updated: EducationRecord = {
      ...existing,
      degree: data.degree !== undefined ? data.degree.trim() : existing.degree,
      specialization: data.specialization !== undefined ? data.specialization.trim() : existing.specialization,
      institution: data.institution !== undefined ? data.institution.trim() : existing.institution,
      university: data.university !== undefined ? data.university.trim() : existing.university,
      startYear: data.startYear !== undefined ? Number(data.startYear) : existing.startYear,
      completionYear: data.completionYear !== undefined ? Number(data.completionYear) : existing.completionYear,
      gradePercentage: data.gradePercentage !== undefined ? data.gradePercentage.trim() : existing.gradePercentage,
      relevantSkills: data.relevantSkills !== undefined ? data.relevantSkills.trim() : existing.relevantSkills,
      updatedAt: new Date().toISOString(),
    };

    profile.education[index] = updated;
    profile.updatedAt = new Date().toISOString();
    return updated;
  },

  deleteEducation(userId: string, id: string): boolean {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const initialLength = profile.education.length;
    profile.education = profile.education.filter((e) => e.id !== id);
    profile.updatedAt = new Date().toISOString();
    return profile.education.length < initialLength;
  },

  // ---------------- EXPERIENCE CRUD ----------------
  addExperience(userId: string, data: Omit<ExperienceRecord, 'id'>): ExperienceRecord {
    const profile = this.getProfile(userId);
    if (!profile) throw new Error('Profile not found for user');

    const newId = `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: ExperienceRecord = {
      id: newId,
      organization: data.organization?.trim() || '',
      department: data.department?.trim() || '',
      designation: data.designation?.trim() || '',
      employmentType: data.employmentType || 'Permanent',
      startDate: data.startDate,
      endDate: data.isCurrentPosition ? undefined : data.endDate,
      isCurrentPosition: Boolean(data.isCurrentPosition),
      responsibilities: data.responsibilities?.trim() || '',
      keyAchievements: data.keyAchievements?.trim() || '',
      skillsUsed: data.skillsUsed?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.official_profiles[userId].experience.unshift(newRecord);
    db.official_profiles[userId].updatedAt = new Date().toISOString();
    return newRecord;
  },

  updateExperience(userId: string, id: string, data: Partial<ExperienceRecord>): ExperienceRecord {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const index = profile.experience.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Experience record with ID ${id} not found`);

    const existing = profile.experience[index];
    const updated: ExperienceRecord = {
      ...existing,
      organization: data.organization !== undefined ? data.organization.trim() : existing.organization,
      department: data.department !== undefined ? data.department.trim() : existing.department,
      designation: data.designation !== undefined ? data.designation.trim() : existing.designation,
      employmentType: data.employmentType || existing.employmentType,
      startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
      endDate: data.isCurrentPosition ? undefined : data.endDate !== undefined ? data.endDate : existing.endDate,
      isCurrentPosition: data.isCurrentPosition !== undefined ? Boolean(data.isCurrentPosition) : existing.isCurrentPosition,
      responsibilities: data.responsibilities !== undefined ? data.responsibilities.trim() : existing.responsibilities,
      keyAchievements: data.keyAchievements !== undefined ? data.keyAchievements.trim() : existing.keyAchievements,
      skillsUsed: data.skillsUsed !== undefined ? data.skillsUsed.trim() : existing.skillsUsed,
      updatedAt: new Date().toISOString(),
    };

    profile.experience[index] = updated;
    profile.updatedAt = new Date().toISOString();
    return updated;
  },

  deleteExperience(userId: string, id: string): boolean {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const initialLength = profile.experience.length;
    profile.experience = profile.experience.filter((e) => e.id !== id);
    profile.updatedAt = new Date().toISOString();
    return profile.experience.length < initialLength;
  },

  // ---------------- TRAINING CRUD ----------------
  addTraining(userId: string, data: Omit<TrainingRecord, 'id'>): TrainingRecord {
    const profile = this.getProfile(userId);
    if (!profile) throw new Error('Profile not found for user');

    const newId = `trn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: TrainingRecord = {
      id: newId,
      courseName: data.courseName?.trim() || '',
      trainingProvider: data.trainingProvider?.trim() || '',
      category: data.category?.trim() || 'General Administration',
      startDate: data.startDate,
      completionDate: data.completionDate,
      duration: data.duration?.trim() || '2 Weeks',
      mode: data.mode || 'Online',
      certificateNumber: data.certificateNumber?.trim() || '',
      competenciesAcquired: data.competenciesAcquired?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.official_profiles[userId].training.unshift(newRecord);
    db.official_profiles[userId].updatedAt = new Date().toISOString();
    return newRecord;
  },

  updateTraining(userId: string, id: string, data: Partial<TrainingRecord>): TrainingRecord {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const index = profile.training.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Training record with ID ${id} not found`);

    const existing = profile.training[index];
    const updated: TrainingRecord = {
      ...existing,
      courseName: data.courseName !== undefined ? data.courseName.trim() : existing.courseName,
      trainingProvider: data.trainingProvider !== undefined ? data.trainingProvider.trim() : existing.trainingProvider,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
      completionDate: data.completionDate !== undefined ? data.completionDate : existing.completionDate,
      duration: data.duration !== undefined ? data.duration.trim() : existing.duration,
      mode: data.mode || existing.mode,
      certificateNumber: data.certificateNumber !== undefined ? data.certificateNumber.trim() : existing.certificateNumber,
      competenciesAcquired: data.competenciesAcquired !== undefined ? data.competenciesAcquired.trim() : existing.competenciesAcquired,
      updatedAt: new Date().toISOString(),
    };

    profile.training[index] = updated;
    profile.updatedAt = new Date().toISOString();
    return updated;
  },

  deleteTraining(userId: string, id: string): boolean {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const initialLength = profile.training.length;
    profile.training = profile.training.filter((t) => t.id !== id);
    profile.updatedAt = new Date().toISOString();
    return profile.training.length < initialLength;
  },

  // ---------------- SKILLS CRUD ----------------
  getSkills(userId: string): OfficialSkillRecord[] {
    const profile = this.getProfile(userId);
    return profile ? profile.skills : [];
  },

  addSkill(userId: string, data: Omit<OfficialSkillRecord, 'id'>): OfficialSkillRecord {
    const profile = this.getProfile(userId);
    if (!profile) throw new Error('Profile not found for user');

    const newId = `skl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: OfficialSkillRecord = {
      id: newId,
      skillName: data.skillName?.trim() || '',
      skillCategory: data.skillCategory || 'Domain-specific',
      selfAssessedProficiency: (Number(data.selfAssessedProficiency) || 3) as any,
      yearsOfExperience: Number(data.yearsOfExperience) || 1,
      certificationEvidence: data.certificationEvidence?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.official_profiles[userId].skills.unshift(newRecord);
    db.official_profiles[userId].updatedAt = new Date().toISOString();
    return newRecord;
  },

  updateSkill(userId: string, id: string, data: Partial<OfficialSkillRecord>): OfficialSkillRecord {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const index = profile.skills.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Skill with ID ${id} not found`);

    const existing = profile.skills[index];
    const updated: OfficialSkillRecord = {
      ...existing,
      skillName: data.skillName !== undefined ? data.skillName.trim() : existing.skillName,
      skillCategory: data.skillCategory || existing.skillCategory,
      selfAssessedProficiency: data.selfAssessedProficiency !== undefined ? (Number(data.selfAssessedProficiency) as any) : existing.selfAssessedProficiency,
      yearsOfExperience: data.yearsOfExperience !== undefined ? Number(data.yearsOfExperience) : existing.yearsOfExperience,
      certificationEvidence: data.certificationEvidence !== undefined ? data.certificationEvidence.trim() : existing.certificationEvidence,
      updatedAt: new Date().toISOString(),
    };

    profile.skills[index] = updated;
    profile.updatedAt = new Date().toISOString();
    return updated;
  },

  deleteSkill(userId: string, id: string): boolean {
    const profile = db.official_profiles[userId];
    if (!profile) throw new Error('Profile not found for user');

    const initialLength = profile.skills.length;
    profile.skills = profile.skills.filter((s) => s.id !== id);
    profile.updatedAt = new Date().toISOString();
    return profile.skills.length < initialLength;
  },
};

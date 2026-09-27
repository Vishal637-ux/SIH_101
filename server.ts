import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

import { profileStore } from './server/profileStore';
import { competencyStore } from './server/competencyStore';
import { skillGapStore } from './server/skillGapStore';
import { recommendationStore } from './server/recommendationStore';
import { integrationStore } from './server/integrationStore';
import { governmentSsoAdapter } from './server/integrations/ssoAdapter';
import { learningStore } from './server/learningStore';
import { contentStore } from './server/contentStore';
import { assessmentStore } from './server/assessmentStore';
import { aiAssessmentService } from './server/aiAssessmentService';
import { performanceStore } from './server/performanceStore';
import multer from 'multer';

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Authentication middleware for official user context with RBAC (Module 01 & 08 integration)
function authenticateOfficial(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  let userId = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7).trim();
  } else if (req.headers['x-user-id']) {
    userId = String(req.headers['x-user-id']).trim();
  }

  // Graceful fallback to default official session
  if (!userId) {
    userId = 'off-001';
  }

  // Role resolution: Trainer, Admin, or Learner
  let role: 'Trainer' | 'Admin' | 'Learner' = 'Trainer';
  const headerRole = req.headers['x-user-role'] ? String(req.headers['x-user-role']).trim() : '';

  if (headerRole) {
    if (headerRole.toLowerCase() === 'trainer') role = 'Trainer';
    else if (headerRole.toLowerCase() === 'admin') role = 'Admin';
    else if (headerRole.toLowerCase() === 'learner') role = 'Learner';
  } else if (userId === 'trainer-001' || userId.includes('trainer')) {
    role = 'Trainer';
  } else if (userId === 'admin-001' || userId.includes('admin')) {
    role = 'Admin';
  } else {
    // In prototype, default active official has Trainer privileges for content management unless explicitly set to Learner
    role = 'Trainer';
  }

  (req as any).user = {
    id: userId,
    role,
  };
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = (req as any).user?.role || 'Learner';
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!allowed.includes(userRole.toLowerCase())) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role '${userRole}' is not authorized. Required: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

// Initialize Gemini client server-side
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ============================================================================
// MODULE 02: OFFICIAL PROFILE MANAGEMENT BACKEND APIs
// ============================================================================

// 1. GET /api/v1/profile/me - Fetch authenticated official's full profile
app.get('/api/v1/profile/me', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const profile = profileStore.getProfile(userId);

  if (!profile) {
    return res.status(404).json({
      error: 'ProfileNotFound',
      message: `No official profile registered for user ${userId}.`,
    });
  }

  return res.json(profile);
});

// 2. PUT /api/v1/profile/me - Update authenticated official's profile
app.put('/api/v1/profile/me', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const updates = req.body;

  // Validation rules
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'ValidationError', message: 'Request body must be a valid JSON object.' });
  }

  if (updates.fullName !== undefined && (!updates.fullName || updates.fullName.trim().length < 2)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Full Name must be at least 2 characters.' });
  }

  if (updates.mobileNumber) {
    const cleaned = updates.mobileNumber.replace(/[\s-]/g, '');
    if (!/^\+?[0-9]{10,14}$/.test(cleaned)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Mobile number must be a valid 10-14 digit telephone number.' });
    }
  }

  if (updates.dateOfJoining) {
    const joinDate = new Date(updates.dateOfJoining);
    const today = new Date();
    if (isNaN(joinDate.getTime())) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid Date of Joining format.' });
    }
    if (joinDate > today) {
      return res.status(400).json({ error: 'ValidationError', message: 'Date of Joining cannot be in the future.' });
    }
  }

  // System-controlled fields protection
  const attemptedSystemModifications: string[] = [];
  if (updates.officialEmail) attemptedSystemModifications.push('officialEmail');
  if (updates.employeeId) attemptedSystemModifications.push('employeeId');
  if (updates.organization) attemptedSystemModifications.push('organization');

  const { profile, modifiedFields } = profileStore.updateProfile(userId, updates);

  return res.json({
    success: true,
    message: 'Official profile updated successfully.',
    modifiedFields,
    systemFieldsProtected: attemptedSystemModifications.length > 0 ? attemptedSystemModifications : undefined,
    profile,
  });
});

// 3. POST /api/v1/profile/education - Add an education record
app.post('/api/v1/profile/education', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { degree, specialization, institution, university, startYear, completionYear, gradePercentage, relevantSkills } = req.body;

  if (!degree || !degree.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Degree / Qualification is required.' });
  }
  if (!institution || !institution.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Institution name is required.' });
  }
  if (!completionYear || isNaN(Number(completionYear))) {
    return res.status(400).json({ error: 'ValidationError', message: 'Valid completion year is required.' });
  }
  if (startYear && !isNaN(Number(startYear)) && Number(completionYear) < Number(startYear)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Completion year cannot precede start year.' });
  }

  try {
    const record = profileStore.addEducation(userId, {
      degree,
      specialization: specialization || '',
      institution,
      university: university || institution,
      startYear: Number(startYear) || Number(completionYear),
      completionYear: Number(completionYear),
      gradePercentage: gradePercentage || '',
      relevantSkills: relevantSkills || '',
    });
    return res.status(201).json({
      success: true,
      message: 'Education record added successfully.',
      record,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 4. PUT /api/v1/profile/education/:id - Update education record
app.put('/api/v1/profile/education/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { startYear, completionYear } = req.body;

  if (startYear && completionYear && Number(completionYear) < Number(startYear)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Completion year cannot precede start year.' });
  }

  try {
    const updated = profileStore.updateEducation(userId, id, req.body);
    return res.json({
      success: true,
      message: 'Education record updated successfully.',
      record: updated,
    });
  } catch (err: any) {
    return res.status(404).json({ error: 'NotFound', message: err.message });
  }
});

// 5. DELETE /api/v1/profile/education/:id - Remove education record
app.delete('/api/v1/profile/education/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    const deleted = profileStore.deleteEducation(userId, id);
    if (!deleted) {
      return res.status(404).json({ error: 'NotFound', message: 'Education record not found.' });
    }
    return res.json({
      success: true,
      message: 'Education record deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 6. POST /api/v1/profile/experience - Add work experience record
app.post('/api/v1/profile/experience', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { organization, department, designation, employmentType, startDate, endDate, isCurrentPosition, responsibilities, keyAchievements, skillsUsed } = req.body;

  if (!organization || !organization.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Organization is required.' });
  }
  if (!designation || !designation.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Designation / Role is required.' });
  }
  if (!startDate) {
    return res.status(400).json({ error: 'ValidationError', message: 'Start date is required.' });
  }
  if (!isCurrentPosition && endDate) {
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: 'ValidationError', message: 'End date cannot be prior to start date.' });
    }
  }

  try {
    const record = profileStore.addExperience(userId, {
      organization,
      department: department || '',
      designation,
      employmentType: employmentType || 'Permanent',
      startDate,
      endDate: isCurrentPosition ? undefined : endDate,
      isCurrentPosition: Boolean(isCurrentPosition),
      responsibilities: responsibilities || '',
      keyAchievements: keyAchievements || '',
      skillsUsed: skillsUsed || '',
    });
    return res.status(201).json({
      success: true,
      message: 'Work experience record added successfully.',
      record,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 7. PUT /api/v1/profile/experience/:id - Update work experience
app.put('/api/v1/profile/experience/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { startDate, endDate, isCurrentPosition } = req.body;

  if (!isCurrentPosition && startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'ValidationError', message: 'End date cannot be prior to start date.' });
  }

  try {
    const updated = profileStore.updateExperience(userId, id, req.body);
    return res.json({
      success: true,
      message: 'Work experience record updated successfully.',
      record: updated,
    });
  } catch (err: any) {
    return res.status(404).json({ error: 'NotFound', message: err.message });
  }
});

// 8. DELETE /api/v1/profile/experience/:id - Delete work experience
app.delete('/api/v1/profile/experience/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    const deleted = profileStore.deleteExperience(userId, id);
    if (!deleted) {
      return res.status(404).json({ error: 'NotFound', message: 'Work experience record not found.' });
    }
    return res.json({
      success: true,
      message: 'Work experience record deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 9. POST /api/v1/profile/training - Add training record
app.post('/api/v1/profile/training', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { courseName, trainingProvider, category, startDate, completionDate, duration, mode, certificateNumber, competenciesAcquired } = req.body;

  if (!courseName || !courseName.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Training / Course Name is required.' });
  }
  if (!trainingProvider || !trainingProvider.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Training Provider is required.' });
  }
  if (!startDate || !completionDate) {
    return res.status(400).json({ error: 'ValidationError', message: 'Start date and completion date are required.' });
  }
  if (new Date(completionDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Completion date cannot precede start date.' });
  }

  try {
    const record = profileStore.addTraining(userId, {
      courseName,
      trainingProvider,
      category: category || 'Administrative Governance',
      startDate,
      completionDate,
      duration: duration || '1 Week',
      mode: mode || 'Online',
      certificateNumber: certificateNumber || '',
      competenciesAcquired: competenciesAcquired || '',
    });
    return res.status(201).json({
      success: true,
      message: 'Training record added successfully.',
      record,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 10. PUT /api/v1/profile/training/:id - Update training record
app.put('/api/v1/profile/training/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { startDate, completionDate } = req.body;

  if (startDate && completionDate && new Date(completionDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'ValidationError', message: 'Completion date cannot precede start date.' });
  }

  try {
    const updated = profileStore.updateTraining(userId, id, req.body);
    return res.json({
      success: true,
      message: 'Training record updated successfully.',
      record: updated,
    });
  } catch (err: any) {
    return res.status(404).json({ error: 'NotFound', message: err.message });
  }
});

// 11. DELETE /api/v1/profile/training/:id - Delete training record
app.delete('/api/v1/profile/training/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    const deleted = profileStore.deleteTraining(userId, id);
    if (!deleted) {
      return res.status(404).json({ error: 'NotFound', message: 'Training record not found.' });
    }
    return res.json({
      success: true,
      message: 'Training record deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 12. GET /api/v1/profile/skills - List skills
app.get('/api/v1/profile/skills', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const skills = profileStore.getSkills(userId);
  return res.json({
    skills,
    total: skills.length,
    disclaimer: 'Note: Self-assessed proficiency reflects profile documentation and is not a calibrated competency score. Calibrated scores are determined via Step 3 Assessment.',
  });
});

// 13. POST /api/v1/profile/skills - Add skill
app.post('/api/v1/profile/skills', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { skillName, skillCategory, selfAssessedProficiency, yearsOfExperience, certificationEvidence } = req.body;

  if (!skillName || !skillName.trim()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Skill Name is required.' });
  }

  const proficiency = Number(selfAssessedProficiency);
  if (isNaN(proficiency) || proficiency < 1 || proficiency > 5) {
    return res.status(400).json({ error: 'ValidationError', message: 'Self-assessed proficiency must be an integer between 1 and 5.' });
  }

  try {
    const record = profileStore.addSkill(userId, {
      skillName,
      skillCategory: skillCategory || 'Domain-specific',
      selfAssessedProficiency: proficiency as any,
      yearsOfExperience: Number(yearsOfExperience) || 1,
      certificationEvidence: certificationEvidence || '',
    });
    return res.status(201).json({
      success: true,
      message: 'Skill added to official profile.',
      record,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 14. PUT /api/v1/profile/skills/:id - Update skill
app.put('/api/v1/profile/skills/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { selfAssessedProficiency } = req.body;

  if (selfAssessedProficiency !== undefined) {
    const prof = Number(selfAssessedProficiency);
    if (isNaN(prof) || prof < 1 || prof > 5) {
      return res.status(400).json({ error: 'ValidationError', message: 'Proficiency must be between 1 and 5.' });
    }
  }

  try {
    const updated = profileStore.updateSkill(userId, id, req.body);
    return res.json({
      success: true,
      message: 'Skill updated successfully.',
      record: updated,
    });
  } catch (err: any) {
    return res.status(404).json({ error: 'NotFound', message: err.message });
  }
});

// 15. DELETE /api/v1/profile/skills/:id - Delete skill
app.delete('/api/v1/profile/skills/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    const deleted = profileStore.deleteSkill(userId, id);
    if (!deleted) {
      return res.status(404).json({ error: 'NotFound', message: 'Skill not found.' });
    }
    return res.json({
      success: true,
      message: 'Skill removed from profile.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'ServerError', message: err.message });
  }
});

// 16. GET /api/v1/profile/completion - Get profile completion status
app.get('/api/v1/profile/completion', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const profile = profileStore.getProfile(userId);

  if (!profile) {
    return res.status(404).json({ error: 'ProfileNotFound', message: 'Profile not found.' });
  }

  const status = profileStore.getProfile(userId)?.completionStatus;
  return res.json(status);
});

// ============================================================================
// MODULE 03: COMPETENCY MANAGEMENT & ASSESSMENT BACKEND APIs
// ============================================================================

// 1. GET /api/v1/competencies - List all approved competencies in the framework
app.get('/api/v1/competencies', (req, res) => {
  const framework = competencyStore.getFramework();
  return res.json({
    frameworkVersion: framework.version,
    totalCompetencies: framework.competencies.length,
    competencies: framework.competencies,
  });
});

// 2. GET /api/v1/competencies/framework - Get framework metadata, version, and domains
app.get('/api/v1/competencies/framework', (req, res) => {
  const framework = competencyStore.getFramework();
  return res.json(framework);
});

// 3. GET /api/v1/competencies/requirements - Get role-mapped requirements
app.get('/api/v1/competencies/requirements', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const profile = profileStore.getProfile(userId);
  const role = (req.query.role as string) || profile?.designation || 'Assistant Section Officer (ASO)';
  const department = (req.query.department as string) || profile?.department || '';

  const requirements = competencyStore.getRoleRequirements(role, department);
  return res.json({
    role,
    department,
    count: requirements.length,
    requirements,
  });
});

// 4. GET /api/v1/competencies/me - Get current competency state for the official
app.get('/api/v1/competencies/me', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const competencies = competencyStore.getOfficialCompetencies(userId);
  const history = competencyStore.getOfficialHistory(userId);
  const latestAttempt = history.length > 0 ? history[0] : null;

  return res.json({
    userId,
    totalAssessed: competencies.length,
    latestAttemptNumber: latestAttempt ? latestAttempt.attemptNumber : 0,
    lastAssessedAt: latestAttempt ? latestAttempt.assessmentDate : null,
    competencies,
  });
});

// 5. POST /api/v1/competency-assessments - Create or initialize an assessment session
app.post('/api/v1/competency-assessments', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const profile = profileStore.getProfile(userId);

  if (!profile) {
    return res.status(404).json({ error: 'ProfileNotFound', message: 'Official profile not found. Complete profile first.' });
  }

  const { assessmentType } = req.body || {};

  try {
    const session = competencyStore.createAssessmentSession({
      userId,
      officialName: profile.fullName,
      jobRole: profile.designation,
      department: profile.department,
      assessmentType: assessmentType || 'REASSESSMENT',
    });

    return res.status(201).json({
      success: true,
      message: 'Assessment session initialized.',
      session,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'SessionError', message: err.message });
  }
});

// 6. GET /api/v1/competency-assessments/:id - Get session details (masks answers if in-progress)
app.get('/api/v1/competency-assessments/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const session = competencyStore.getAssessmentSession(id, userId, true);
  if (!session) {
    return res.status(404).json({ error: 'SessionNotFound', message: 'Assessment session not found or unauthorized.' });
  }

  return res.json(session);
});

// 7. POST /api/v1/competency-assessments/:id/answers - Record answer
app.post('/api/v1/competency-assessments/:id/answers', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { questionId, selectedIndex } = req.body;

  if (!questionId || selectedIndex === undefined || typeof selectedIndex !== 'number') {
    return res.status(400).json({ error: 'ValidationError', message: 'questionId and numeric selectedIndex required.' });
  }

  try {
    const updatedSession = competencyStore.recordAnswer(id, userId, questionId, selectedIndex);
    return res.json({
      success: true,
      message: 'Answer recorded.',
      answeredCount: updatedSession.answeredCount,
      totalQuestions: updatedSession.totalQuestions,
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'AnswerError', message: err.message });
  }
});

// 8. POST /api/v1/competency-assessments/:id/complete - Submit and evaluate assessment
app.post('/api/v1/competency-assessments/:id/complete', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    const completedSession = competencyStore.completeAssessment(id, userId);

    // Module 04 Automatic Recalculation Trigger:
    // Update skill-gap records immediately after competency evaluation
    const profile = profileStore.getProfile(userId);
    try {
      skillGapStore.recalculateOfficialGaps(
        userId,
        profile?.designation || 'Assistant Section Officer (ASO)',
        profile?.department || '',
        'AUTOMATIC_ASSESSMENT_TRIGGER'
      );
    } catch (recalcErr) {
      console.error('Skill gap recalculation error after assessment:', recalcErr);
    }

    return res.json({
      success: true,
      message: 'Assessment evaluated and competency records updated.',
      overallScore: completedSession.overallScore,
      attemptNumber: completedSession.attemptNumber,
      completedAt: completedSession.completedAt,
      competencyResults: completedSession.competencyResults,
      session: completedSession,
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'EvaluationError', message: err.message });
  }
});

// 9. GET /api/v1/competencies/history - Retrieve assessment history
app.get('/api/v1/competencies/history', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const history = competencyStore.getOfficialHistory(userId);
  return res.json({
    userId,
    totalAttempts: history.length,
    history,
  });
});

// 10. GET /api/v1/competencies/handoff-to-module4 - Structured contract for Module 04
app.get('/api/v1/competencies/handoff-to-module4', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const profile = profileStore.getProfile(userId);
  const role = profile?.designation || 'Assistant Section Officer (ASO)';
  const department = profile?.department || '';

  const handoff = competencyStore.getModule04Handoff(userId, role, department);
  return res.json(handoff);
});

// ============================================================================
// MODULE 04: SKILL-GAP ANALYSIS BACKEND APIs
// ============================================================================

// 1. GET /api/v1/skill-gaps - Fetch current authenticated user's skill gaps
app.get('/api/v1/skill-gaps', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { domain, priority, status } = req.query as {
    domain?: string;
    priority?: string;
    status?: string;
  };

  const gaps = skillGapStore.getUserGaps(userId, { domain, priority, status });
  const summary = skillGapStore.getUserSummary(userId);

  return res.json({
    userId,
    officialName: summary.officialName,
    jobRole: summary.jobRole,
    department: summary.department,
    totalCount: gaps.length,
    lastCalculatedAt: summary.lastCalculatedAt,
    gaps,
  });
});

// 2. GET /api/v1/skill-gaps/summary - Fetch summary statistics
app.get('/api/v1/skill-gaps/summary', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const summary = skillGapStore.getUserSummary(userId);
  return res.json(summary);
});

// 3. GET /api/v1/skill-gaps/handoff-to-module5 - Clean structured handoff for Module 05
app.get('/api/v1/skill-gaps/handoff-to-module5', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const handoff = skillGapStore.getModule05Handoff(userId);
  return res.json(handoff);
});

// 4. GET /api/v1/skill-gaps/audit-logs - Audit trail of gap calculations
app.get('/api/v1/skill-gaps/audit-logs', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const logs = skillGapStore.getAuditLogs(userId);
  return res.json({
    userId,
    count: logs.length,
    logs,
  });
});

// 5. POST /api/v1/skill-gaps/recalculate - Recalculate skill gaps
app.post('/api/v1/skill-gaps/recalculate', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const profile = profileStore.getProfile(userId);

  if (!profile) {
    return res.status(404).json({ error: 'ProfileNotFound', message: 'Profile not found.' });
  }

  const role = profile.designation || 'Assistant Section Officer (ASO)';
  const department = profile.department || '';

  const updatedGaps = skillGapStore.recalculateOfficialGaps(
    userId,
    role,
    department,
    'MANUAL_RECALCULATION'
  );

  // Automatically refresh Module 05 recommendations when skill gaps are recalculated
  try {
    recommendationStore.generateRecommendationsForUser(userId);
  } catch (recErr) {
    console.error('Error refreshing recommendations:', recErr);
  }

  const summary = skillGapStore.getUserSummary(userId);

  return res.json({
    success: true,
    message: 'Skill-gap analysis recalculated successfully.',
    totalAssessed: summary.totalCompetenciesAssessed,
    competenciesWithGaps: summary.competenciesWithGaps,
    highPriorityGaps: summary.highPriorityGaps,
    gaps: updatedGaps,
  });
});

// 6. GET /api/v1/skill-gaps/:competencyId - Retrieve single competency gap details
app.get('/api/v1/skill-gaps/:competencyId', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { competencyId } = req.params;

  const gap = skillGapStore.getGapDetail(userId, competencyId);
  if (!gap) {
    return res.status(404).json({
      error: 'GapNotFound',
      message: `No skill gap found for competency ID ${competencyId}`,
    });
  }

  return res.json(gap);
});

// ============================================================================
// MODULE 05: AI RECOMMENDATION ENGINE BACKEND APIs
// ============================================================================

// 1. GET /api/v1/recommendations - List ranked and explainable recommendations
app.get('/api/v1/recommendations', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { domain, priority, provider, resourceType, difficulty, search } = req.query as {
    domain?: string;
    priority?: string;
    provider?: string;
    resourceType?: string;
    difficulty?: string;
    search?: string;
  };

  const recommendations = recommendationStore.getUserRecommendations(userId, {
    domain,
    priority,
    provider,
    resourceType,
    difficulty,
    search,
  });

  const summary = recommendationStore.getUserSummary(userId);

  return res.json({
    userId,
    officialName: summary.officialName,
    jobRole: summary.jobRole,
    department: summary.department,
    totalCount: recommendations.length,
    lastGeneratedAt: summary.lastGeneratedAt,
    recommendations,
  });
});

// 2. GET /api/v1/recommendations/summary - Metric summary cards for dashboard
app.get('/api/v1/recommendations/summary', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const summary = recommendationStore.getUserSummary(userId);
  return res.json(summary);
});

// 3. GET /api/v1/recommendations/path - Personalized ordered 4-phase learning path
app.get('/api/v1/recommendations/path', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const learningPath = recommendationStore.getPersonalizedLearningPath(userId);
  return res.json(learningPath);
});

// 4. GET /api/v1/recommendations/:id - Detailed recommendation view
app.get('/api/v1/recommendations/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const rec = recommendationStore.getRecommendationById(userId, id);
  if (!rec) {
    return res.status(404).json({
      error: 'RecommendationNotFound',
      message: `No recommendation found for identifier ${id}`,
    });
  }

  return res.json(rec);
});

// 5. POST /api/v1/recommendations/generate - Regenerate/refresh recommendations
app.post('/api/v1/recommendations/generate', authenticateOfficial, async (req, res) => {
  const userId = (req as any).user.id;
  const profile = profileStore.getProfile(userId);

  try {
    const refreshed = recommendationStore.generateRecommendationsForUser(userId);
    const summary = recommendationStore.getUserSummary(userId);

    // Optional Gemini AI enrichment for executive personalized synthesis
    let aiSynthesis = '';
    if (ai && profile) {
      try {
        const topGaps = skillGapStore.getUserGaps(userId).filter(g => g.gapValue > 0).slice(0, 3);
        const prompt = `Official: ${profile.fullName}, Role: ${profile.designation}, Department: ${profile.department}.
Target Goal: ${profile.learningPreferences?.careerGoals || profile.jobRole || 'Next Career Milestone'}.
Identified Gaps: ${topGaps.map(g => `${g.competencyName} (Gap: -${g.gapValue}, Priority: ${g.priority})`).join(', ')}.
Top Recommended Resource: ${refreshed[0]?.resource.title}.
Generate a 2-sentence executive civil-service learning pathway synthesis explaining why these recommended modules bridge their operational gap towards administrative excellence.`;

        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        aiSynthesis = aiRes.text?.trim() || '';
      } catch (aiErr) {
        console.error('Gemini synthesis optional error:', aiErr);
      }
    }

    return res.json({
      success: true,
      message: 'Personalized recommendations regenerated from latest Module 04 skill gaps.',
      totalRecommendations: refreshed.length,
      highPriorityCount: summary.highPriorityLearningAreas,
      aiSynthesis: aiSynthesis || undefined,
      recommendations: refreshed,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'GenerationError', message: err.message });
  }
});

// 6. POST /api/v1/recommendations/:id/start - Module 07 Handoff (Start Learning)
app.post('/api/v1/recommendations/:id/start', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    const handoff = recommendationStore.startLearning(userId, id);
    return res.json({
      success: true,
      message: 'Resource enrolled and handed off to Module 07 Learning Experience.',
      handoff,
    });
  } catch (err: any) {
    return res.status(404).json({ error: 'EnrollmentError', message: err.message });
  }
});

// ============================================================================
// MODULE 06: iGOT / NSSTA-TPAC INTEGRATION & ECOSYSTEM BACKEND APIs
// ============================================================================

// 1. GET /api/v1/integrations/status - Ecosystem health & connection status
app.get('/api/v1/integrations/status', authenticateOfficial, (_req, res) => {
  const status = integrationStore.getEcosystemStatus();
  return res.json(status);
});

// 2. GET /api/v1/integrations/resources - Query normalized external resources
app.get('/api/v1/integrations/resources', authenticateOfficial, (req, res) => {
  const { source, domain, search, resourceType } = req.query as {
    source?: string;
    domain?: string;
    search?: string;
    resourceType?: string;
  };

  const resources = integrationStore.getNormalizedResources({
    source,
    domain,
    search,
    resourceType,
  });

  return res.json({
    totalCount: resources.length,
    filtersApplied: { source, domain, search, resourceType },
    resources,
  });
});

// 3. GET /api/v1/integrations/resources/:id - Get normalized resource details
app.get('/api/v1/integrations/resources/:id', authenticateOfficial, (req, res) => {
  const { id } = req.params;
  const resource = integrationStore.getResourceById(id);

  if (!resource) {
    return res.status(404).json({
      error: 'ResourceNotFound',
      message: `External learning resource not found: ${id}`,
    });
  }

  return res.json(resource);
});

// 4. POST /api/v1/integrations/sync - Trigger authorized synchronization
app.post('/api/v1/integrations/sync', authenticateOfficial, async (req, res) => {
  const userId = (req as any).user.id;
  const { source } = req.body as { source?: 'IGOT' | 'NSSTA' | 'TPAC' | 'ALL' };

  try {
    const syncLog = await integrationStore.executeSync(source || 'ALL', userId);
    return res.json({
      success: syncLog.status !== 'FAILED',
      message: `Synchronization completed for source: ${source || 'ALL'}.`,
      syncLog,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'SyncError', message: err.message });
  }
});

// 5. POST /api/v1/integrations/enroll - Request official enrollment
app.post('/api/v1/integrations/enroll', authenticateOfficial, async (req, res) => {
  const userId = (req as any).user.id;
  const { resourceId } = req.body;

  if (!resourceId) {
    return res.status(400).json({ error: 'BadRequest', message: 'resourceId is required.' });
  }

  try {
    const enrollment = await integrationStore.enrollOfficial(resourceId, userId);
    return res.json({
      success: true,
      message: `Successfully enrolled in ${enrollment.provider} resource.`,
      enrollment,
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'EnrollmentError', message: err.message });
  }
});

// 6. GET /api/v1/integrations/sync-logs - Synchronization audit trail
app.get('/api/v1/integrations/sync-logs', authenticateOfficial, (_req, res) => {
  const logs = integrationStore.getSyncLogs();
  return res.json({
    totalLogs: logs.length,
    logs,
  });
});

// 7. GET /api/v1/integrations/user-enrollments - Official's active external enrollments
app.get('/api/v1/integrations/user-enrollments', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const enrollments = integrationStore.getUserEnrollments(userId);
  return res.json({
    userId,
    totalEnrollments: enrollments.length,
    enrollments,
  });
});

// 8. GET /api/v1/integrations/sso/config - Sanitized Parichay SSO configuration
app.get('/api/v1/integrations/sso/config', (_req, res) => {
  const ssoConfig = governmentSsoAdapter.getSanitizedStatus();
  return res.json(ssoConfig);
});

// ============================================================================
// MODULE 07: LEARNING MANAGEMENT & EXPERIENCE BACKEND APIs
// ============================================================================

// 1. GET /api/v1/learning/resources - List learning resources with user progress
app.get('/api/v1/learning/resources', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { source, domain, status, search } = req.query as {
    source?: string;
    domain?: string;
    status?: string;
    search?: string;
  };

  const items = learningStore.getResourcesWithProgress(userId, {
    source,
    domain,
    status,
    search,
  });

  return res.json({
    totalCount: items.length,
    filtersApplied: { source, domain, status, search },
    items,
  });
});

// 2. GET /api/v1/learning/resources/:id - Resource details with curriculum, lab, quiz & progress
app.get('/api/v1/learning/resources/:id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const resource = learningStore.getDetailedResource(id);
  if (!resource) {
    return res.status(404).json({
      error: 'ResourceNotFound',
      message: `Learning resource not found: ${id}`,
    });
  }

  const progress = learningStore.getOrCreateProgress(userId, resource.id);

  return res.json({
    resource,
    progress,
  });
});

// 3. GET /api/v1/learning/path - Personalized 4-phase learning path with attached live progress
app.get('/api/v1/learning/path', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const path = learningStore.getUserLearningPath(userId);
  return res.json(path);
});

// 4. POST /api/v1/learning/enroll - Enroll official in learning resource
app.post('/api/v1/learning/enroll', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { resourceId } = req.body;

  if (!resourceId) {
    return res.status(400).json({ error: 'BadRequest', message: 'resourceId is required.' });
  }

  try {
    const progress = learningStore.enrollOfficial(userId, resourceId);
    return res.json({
      success: true,
      message: `Enrolled successfully in ${progress.resourceTitle}`,
      progress,
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'EnrollmentError', message: err.message });
  }
});

// 5. GET /api/v1/learning/progress - List all progress records for user
app.get('/api/v1/learning/progress', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const records = learningStore.getAllUserProgress(userId);
  return res.json({
    userId,
    totalRecords: records.length,
    records,
  });
});

// 6. PUT /api/v1/learning/progress/:resource_id - Update learning progress
app.put('/api/v1/learning/progress/:resource_id', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const { resource_id } = req.params;
  const {
    progressPercentage,
    completedModuleIndex,
    completedExerciseId,
    currentModuleIndex,
    timeSpentDeltaMinutes,
    markCompleted,
    notes,
  } = req.body;

  try {
    const updated = learningStore.updateProgress(userId, resource_id, {
      progressPercentage,
      completedModuleIndex,
      completedExerciseId,
      currentModuleIndex,
      timeSpentDeltaMinutes,
      markCompleted,
      notes,
    });

    return res.json({
      success: true,
      message: 'Learning progress updated successfully.',
      progress: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'ProgressUpdateError', message: err.message });
  }
});

// 7. GET /api/v1/learning/history - Chronological learning audit trail
app.get('/api/v1/learning/history', authenticateOfficial, (req, res) => {
  const userId = (req as any).user.id;
  const history = learningStore.getUserHistory(userId);
  return res.json({
    userId,
    totalActivities: history.length,
    history,
  });
});

// 8. POST /api/v1/learning/ask-assistant - Grounded AI civil service learning assistant
app.post('/api/v1/learning/ask-assistant', authenticateOfficial, async (req, res) => {
  const { resourceId, question, currentModuleTitle } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'BadRequest', message: 'Question text is required.' });
  }

  const resource = resourceId ? learningStore.getDetailedResource(resourceId) : null;

  try {
    if (ai) {
      const contextPrompt = `You are a senior civil service faculty tutor and official statistics expert for the Indian Civil Services.
Answer the following question from an official learner with precision, citing statutory guidelines and official frameworks where relevant.
Course: ${resource ? resource.title : 'Official Statistics & Governance'}
Provider: ${resource ? resource.provider : 'iGOT / NSSTA'}
Domain: ${resource ? resource.domain : 'Official Administration'}
Current Unit: ${currentModuleTitle || 'Core Competency Curriculum'}

Question: ${question}

Provide a concise, practical, 2-to-3 paragraph authoritative answer tailored for Central Secretariat and Indian Statistical Service (ISS) officers.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contextPrompt,
      });

      return res.json({
        success: true,
        answer: aiResponse.text?.trim() || 'No answer generated.',
        source: 'Gemini Civil Service Tutor',
      });
    }

    // Deterministic fallback when AI is not enabled
    return res.json({
      success: true,
      answer: `According to standard civil service operating procedures and ${resource?.provider || 'MoSPI'} documentation: Ensure adherence to verified administrative protocols, maintaining comprehensive data lineage and transparency in line with official statistical quality frameworks.`,
      source: 'Curriculum Guidance Engine (Standard Directive)',
    });
  } catch (err: any) {
    console.error('AI assistant query error:', err);
    return res.json({
      success: true,
      answer: `In official administration, strict compliance with the Manual of Office Procedure and ${resource?.competencyName || 'governance'} directives takes precedence. Verify with departmental circulars and statutory manuals.`,
      source: 'Curriculum Fallback Engine',
    });
  }
});

// ============================================================================
// MODULE 08: CONTENT MANAGEMENT & NLP PREPARATION BACKEND APIs
// ============================================================================

// 1. POST /api/v1/content/upload - Real file upload & persistence
app.post(
  '/api/v1/content/upload',
  authenticateOfficial,
  requireRole(['Trainer', 'Admin']),
  uploadMiddleware.single('file'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      let fileBuffer: Buffer | null = null;
      let fileName = '';
      let mimeType = '';
      let fileSize = 0;

      // Check if uploaded via multipart/form-data
      if (req.file) {
        fileBuffer = req.file.buffer;
        fileName = req.file.originalname;
        mimeType = req.file.mimetype;
        fileSize = req.file.size;
      } else if (req.body.fileBase64 && req.body.fileName) {
        // Base64 payload support
        const base64Data = req.body.fileBase64.replace(/^data:[^;]+;base64,/, '');
        fileBuffer = Buffer.from(base64Data, 'base64');
        fileName = req.body.fileName;
        mimeType = req.body.mimeType || 'application/pdf';
        fileSize = fileBuffer.length;
      } else if (req.body.textContent && req.body.fileName) {
        // Plain text / markdown direct string payload
        fileBuffer = Buffer.from(req.body.textContent, 'utf-8');
        fileName = req.body.fileName;
        mimeType = 'text/plain';
        fileSize = fileBuffer.length;
      }

      if (!fileBuffer || !fileName) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'No valid file provided. Upload a file via form-data or provide fileBase64 / textContent.',
        });
      }

      const title = req.body.title || fileName.replace(/\.[^/.]+$/, '');
      const description = req.body.description || '';
      const language = req.body.language || 'English';
      const topics = req.body.topics
        ? Array.isArray(req.body.topics)
          ? req.body.topics
          : String(req.body.topics).split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];
      const competencyId = req.body.competencyId;
      const competencyName = req.body.competencyName;
      const domain = req.body.domain;

      // Get official name from profileStore
      const p = profileStore.getProfile(user.id);
      const ownerName = p?.fullName || 'Faculty / Trainer';

      const contentItem = await contentStore.createContent({
        ownerUserId: user.id,
        ownerName,
        ownerRole: user.role,
        title,
        description,
        language,
        topics,
        competencyId,
        competencyName,
        domain,
        file: {
          name: fileName,
          size: fileSize,
          mimetype: mimeType,
          buffer: fileBuffer,
        },
      });

      return res.status(201).json({
        success: true,
        message: `File '${contentItem.file_name}' uploaded successfully. Processing initiated.`,
        content: contentItem,
      });
    } catch (err: any) {
      console.error('Content upload error:', err);
      return res.status(400).json({
        error: 'UploadError',
        message: err?.message || 'Failed to process file upload.',
      });
    }
  }
);

// 2. GET /api/v1/content - List content items with filtering and RBAC
app.get('/api/v1/content', authenticateOfficial, (req, res) => {
  const user = (req as any).user;
  const { type, status, language, search, owner } = req.query as {
    type?: string;
    status?: string;
    language?: string;
    search?: string;
    owner?: string;
  };

  const items = contentStore.getContentList({
    type,
    status,
    language,
    search,
    ownerId: owner,
    userRole: user.role,
  });

  return res.json({
    totalCount: items.length,
    userRole: user.role,
    filtersApplied: { type, status, language, search, owner },
    items,
  });
});

// 3. GET /api/v1/content/search - Full-text search
app.get('/api/v1/content/search', authenticateOfficial, (req, res) => {
  const user = (req as any).user;
  const q = String(req.query.q || req.query.query || '').trim();

  const items = contentStore.getContentList({
    search: q,
    userRole: user.role,
  });

  return res.json({
    query: q,
    resultsCount: items.length,
    results: items,
  });
});

// 4. GET /api/v1/content/:id - Detailed content item view
app.get('/api/v1/content/:id', authenticateOfficial, (req, res) => {
  const user = (req as any).user;
  const item = contentStore.getContentById(req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'NotFound', message: `Content item not found: ${req.params.id}` });
  }

  // Learner cannot view non-published content
  if (user.role.toLowerCase() === 'learner' && item.status !== 'PUBLISHED') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Learners can only access published learning materials.',
    });
  }

  const versions = contentStore.getVersions(item.content_id);
  const auditLogs = contentStore.getAuditLogs(item.content_id);

  return res.json({
    item,
    versions,
    auditLogs,
  });
});

// 5. POST /api/v1/content/:id/process - Trigger/reprocess extraction
app.post(
  '/api/v1/content/:id/process',
  authenticateOfficial,
  requireRole(['Trainer', 'Admin']),
  async (req, res) => {
    const user = (req as any).user;
    const p = profileStore.getProfile(user.id);
    const userName = p?.fullName || 'Faculty / Trainer';

    try {
      const job = await contentStore.processContent(req.params.id, user.id, userName, user.role);
      const updatedItem = contentStore.getContentById(req.params.id);

      return res.json({
        success: job.status === 'COMPLETED',
        message: job.status === 'COMPLETED' ? 'Content processed successfully.' : 'Processing failed.',
        job,
        content: updatedItem,
      });
    } catch (err: any) {
      return res.status(400).json({ error: 'ProcessingError', message: err?.message });
    }
  }
);

// 6. POST /api/v1/content/:id/publish - Publish to Module 07 Learning & Module 09 Assessment
app.post(
  '/api/v1/content/:id/publish',
  authenticateOfficial,
  requireRole(['Trainer', 'Admin']),
  async (req, res) => {
    const user = (req as any).user;
    const p = profileStore.getProfile(user.id);
    const userName = p?.fullName || 'Faculty / Trainer';

    try {
      const published = await contentStore.publishContent(req.params.id, user.id, userName, user.role);
      return res.json({
        success: true,
        message: `'${published.title}' published successfully. Available in Module 07 Learning Experience and ready for AI Assessment.`,
        content: published,
      });
    } catch (err: any) {
      return res.status(400).json({ error: 'PublishError', message: err?.message });
    }
  }
);

// 7. POST /api/v1/content/:id/archive - Archive content
app.post(
  '/api/v1/content/:id/archive',
  authenticateOfficial,
  requireRole(['Trainer', 'Admin']),
  async (req, res) => {
    const user = (req as any).user;
    const p = profileStore.getProfile(user.id);
    const userName = p?.fullName || 'Faculty / Trainer';

    try {
      const archived = await contentStore.archiveContent(req.params.id, user.id, userName, user.role);
      return res.json({
        success: true,
        message: `'${archived.title}' archived successfully.`,
        content: archived,
      });
    } catch (err: any) {
      return res.status(400).json({ error: 'ArchiveError', message: err?.message });
    }
  }
);

// 8. GET /api/v1/content/:id/versions - Content version history
app.get('/api/v1/content/:id/versions', authenticateOfficial, (req, res) => {
  const versions = contentStore.getVersions(req.params.id);
  return res.json({
    content_id: req.params.id,
    versions,
  });
});

// 9. GET /api/v1/content/:id/audit-logs - Audit trail
app.get('/api/v1/content/:id/audit-logs', authenticateOfficial, (req, res) => {
  const logs = contentStore.getAuditLogs(req.params.id);
  return res.json({
    content_id: req.params.id,
    auditLogs: logs,
  });
});

// 10. GET /api/v1/content/:id/file - Controlled authenticated file stream
app.get('/api/v1/content/:id/file', authenticateOfficial, (req, res) => {
  const user = (req as any).user;
  const item = contentStore.getContentById(req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'NotFound', message: 'Content item not found.' });
  }

  // Learner cannot download non-published content
  if (user.role.toLowerCase() === 'learner' && item.status !== 'PUBLISHED') {
    return res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
  }

  if (!fs.existsSync(item.object_key)) {
    return res.status(404).json({ error: 'FileNotFound', message: 'Stored file not found on disk.' });
  }

  res.setHeader('Content-Type', item.mime_type || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.file_name)}"`);
  const stream = fs.createReadStream(item.object_key);
  return stream.pipe(res);
});

// 11. GET /api/v1/content/:id/assessment-docket - Handoff to Module 09 AI Assessment Engine
app.get('/api/v1/content/:id/assessment-docket', authenticateOfficial, (req, res) => {
  try {
    const docket = contentStore.getAssessmentDocket(req.params.id);
    return res.json({
      success: true,
      message: 'Assessment docket prepared for Module 09 AI Assessment Engine.',
      docket,
    });
  } catch (err: any) {
    return res.status(404).json({ error: 'DocketError', message: err?.message });
  }
});


// 1. Endpoint: AI Competency Gap Analysis
app.post('/api/analyze-gap', async (req, res) => {
  const { profile, currentCompetencies, targetRole } = req.body;

  try {
    if (ai) {
      const prompt = `You are an expert civil service human capital and competency assessment architect.
Official Profile:
Name: ${profile?.name || 'Official'}
Role: ${profile?.role || 'Assistant Section Officer'}
Department: ${profile?.department || 'Department of Administrative Reforms'}
Experience: ${profile?.experienceYears || 5} years
Target Role/Aspiration: ${targetRole || 'Deputy Secretary / Section Head'}

Current Competency Ratings (1 to 5 scale):
${JSON.stringify(currentCompetencies, null, 2)}

Perform a precise competency gap analysis against standard civil service frameworks (e.g. iGOT Karmayogi Competency Dictionary, Public Administration standards).
Return a JSON object with:
1. "overallReadiness": percentage (e.g. 68),
2. "gapSummary": concise executive summary (2-3 sentences max),
3. "gaps": array of objects with { "name": string, "domain": "Behavioral"|"Domain"|"Functional", "currentLevel": number, "requiredLevel": number, "gapScore": number, "urgency": "High"|"Medium"|"Low", "impactExplanation": string },
4. "topPriorities": array of 3 most urgent competency gap names to address first.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallReadiness: { type: Type.NUMBER },
              gapSummary: { type: Type.STRING },
              gaps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    domain: { type: Type.STRING },
                    currentLevel: { type: Type.NUMBER },
                    requiredLevel: { type: Type.NUMBER },
                    gapScore: { type: Type.NUMBER },
                    urgency: { type: Type.STRING },
                    impactExplanation: { type: Type.STRING },
                  },
                  required: ['name', 'domain', 'currentLevel', 'requiredLevel', 'urgency'],
                },
              },
              topPriorities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['overallReadiness', 'gapSummary', 'gaps', 'topPriorities'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }
  } catch (err: any) {
    console.error('Gemini gap analysis error:', err?.message || err);
  }

  // High-fidelity fallback based on civil service standards
  return res.json({
    overallReadiness: 64,
    gapSummary: `Competency gap analysis indicates solid baseline domain knowledge in General Administration, but critical gaps exist in Public Financial Management (GFR 2017/GeM 4.0) and Digital Service Delivery compliance required for the target role.`,
    gaps: [
      {
        name: 'Public Procurement & GeM Rules',
        domain: 'Domain',
        currentLevel: 2.2,
        requiredLevel: 4.5,
        gapScore: 2.3,
        urgency: 'High',
        impactExplanation: 'Essential for transparent tendering, single source contracting scrutiny, and GeM portal operations without audit disallowances.',
      },
      {
        name: 'Digital Governance & Data Privacy Compliance',
        domain: 'Functional',
        currentLevel: 2.6,
        requiredLevel: 4.0,
        gapScore: 1.4,
        urgency: 'High',
        impactExplanation: 'Required for compliant citizen service rollout under DPDP Act 2023 and automated workflow design.',
      },
      {
        name: 'Public Policy Formulation & Regulatory Impact',
        domain: 'Functional',
        currentLevel: 3.1,
        requiredLevel: 4.5,
        gapScore: 1.4,
        urgency: 'Medium',
        impactExplanation: 'Key for drafting cabinet notes, inter-ministerial consultations, and regulatory impact statements.',
      },
      {
        name: 'Ethical Leadership & Citizen Centricity',
        domain: 'Behavioral',
        currentLevel: 3.5,
        requiredLevel: 4.5,
        gapScore: 1.0,
        urgency: 'Medium',
        impactExplanation: 'Supports conflict mediation, citizen grievance redressal, and integrity assurance in decision making.',
      },
      {
        name: 'Data-Driven Decision Making & Analytics',
        domain: 'Functional',
        currentLevel: 2.8,
        requiredLevel: 4.2,
        gapScore: 1.4,
        urgency: 'Medium',
        impactExplanation: 'Needed for dashboard monitoring of KPI outcomes across district and ministry schemes.',
      },
    ],
    topPriorities: [
      'Public Procurement & GeM Rules',
      'Digital Governance & Data Privacy Compliance',
      'Public Policy Formulation & Regulatory Impact',
    ],
  });
});

// 2. Endpoint: AI Recommendation Engine (Role + Gap + Goals -> Pathways)
app.post('/api/recommend-pathway', async (req, res) => {
  const { gaps, role, targetGoal } = req.body;

  try {
    if (ai) {
      const prompt = `You are the AI Recommendation Engine for national civil services training (curating across iGOT Karmayogi, NSSTA - National Statistical Systems Training Academy, TPAC - Training Program on Administration & Compliance, and Platform Content).
Role: ${role}
Target Goal: ${targetGoal || 'Senior Administrative Competency'}
Identified Gaps: ${JSON.stringify(gaps)}

Generate 4 curated personalized learning modules directly resolving these gaps. Include real institutional source tags (iGOT Karmayogi, NSSTA, TPAC, or In-House Platform).
Return a JSON array of objects with:
- "id": string
- "title": string
- "source": "iGOT Karmayogi" | "NSSTA" | "TPAC" | "Platform Content"
- "competencyAddressed": string
- "estimatedHours": number
- "level": "Foundation" | "Intermediate" | "Advanced"
- "description": string (1-2 sentences)
- "karmaPoints": number (e.g. 100, 150)
- "modulesCount": number`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                source: { type: Type.STRING },
                competencyAddressed: { type: Type.STRING },
                estimatedHours: { type: Type.NUMBER },
                level: { type: Type.STRING },
                description: { type: Type.STRING },
                karmaPoints: { type: Type.NUMBER },
                modulesCount: { type: Type.NUMBER },
              },
              required: ['id', 'title', 'source', 'competencyAddressed', 'estimatedHours', 'level', 'description'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json(parsed);
      }
    }
  } catch (err: any) {
    console.error('Gemini recommendation error:', err?.message || err);
  }

  // Realistic fallback pathway
  return res.json([
    {
      id: 'path-igot-101',
      title: 'General Financial Rules 2017 & GeM 4.0 Procurement Framework',
      source: 'iGOT Karmayogi',
      competencyAddressed: 'Public Procurement & GeM Rules',
      estimatedHours: 6,
      level: 'Intermediate',
      description: 'Master contract drafting, reverse bidding, and dispute resolution guidelines under modern public procurement directives.',
      karmaPoints: 150,
      modulesCount: 5,
    },
    {
      id: 'path-nssta-202',
      title: 'Statistical Verification & Evidence-Based Public Policy',
      source: 'NSSTA',
      competencyAddressed: 'Data-Driven Decision Making & Analytics',
      estimatedHours: 4,
      level: 'Intermediate',
      description: 'Field sampling rigor, index analysis, and validating scheme survey data for policy formulation.',
      karmaPoints: 120,
      modulesCount: 4,
    },
    {
      id: 'path-tpac-303',
      title: 'Digital Personal Data Protection (DPDP) Act & e-Governance Compliance',
      source: 'TPAC',
      competencyAddressed: 'Digital Governance & Data Privacy Compliance',
      estimatedHours: 5,
      level: 'Advanced',
      description: 'Implementing security safeguards, data fiduciary duties, and citizen consent workflows in departmental systems.',
      karmaPoints: 140,
      modulesCount: 4,
    },
    {
      id: 'path-plat-404',
      title: 'Executive Note Drafting, Cabinet Briefings & Ethics in Administration',
      source: 'Platform Content',
      competencyAddressed: 'Ethical Leadership & Citizen Centricity',
      estimatedHours: 3.5,
      level: 'Foundation',
      description: 'Concise inter-ministerial correspondence, code of conduct compliance, and transparent citizen grievance handling.',
      karmaPoints: 90,
      modulesCount: 3,
    },
  ]);
});

// 3. Endpoint: "Upload one book / PDF -> AI generates content" prototype (Step 6)
app.post('/api/generate-from-document', async (req, res) => {
  const { documentTitle, documentText } = req.body;

  const contentToAnalyze = (documentText || '').trim();

  try {
    if (ai && contentToAnalyze.length > 30) {
      const prompt = `You are the AI Intelligent Learning Content Generator for official civil services training.
The trainer uploaded a training manual / regulatory book titled: "${documentTitle || 'Official Training Manual'}".
Content extract:
"""${contentToAnalyze.slice(0, 12000)}"""

Analyze this training content and generate:
1. "documentSummary": concise 2-sentence executive summary for officials.
2. "adaptiveModules": array of 3 micro-learning modules extracted from the text, each with:
   - "title": string
   - "keyTakeaways": array of 3 bullet points
   - "readTimeMinutes": number
3. "assessmentQuestions": array of 4 multiple-choice questions (MCQs) directly testing comprehension of the text.
   Each question object must have:
   - "id": string
   - "question": string
   - "options": array of 4 distinct string choices
   - "correctIndex": number (0-3)
   - "explanation": clear rationale citing the regulatory or operational principle
   - "competencyTagged": string`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentSummary: { type: Type.STRING },
              adaptiveModules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
                    readTimeMinutes: { type: Type.NUMBER },
                  },
                  required: ['title', 'keyTakeaways', 'readTimeMinutes'],
                },
              },
              assessmentQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                    competencyTagged: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'competencyTagged'],
                },
              },
            },
            required: ['documentSummary', 'adaptiveModules', 'assessmentQuestions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }
  } catch (err: any) {
    console.error('Gemini document extraction error:', err?.message || err);
  }

  // Pre-configured high-quality response for official handbook prototype
  return res.json({
    documentSummary: `This manual synthesizes statutory procurement principles, open competitive bidding protocols, and electronic contract management standards under General Financial Rules (GFR).`,
    adaptiveModules: [
      {
        title: 'Module 1: Fundamental Principles of Public Procurement',
        keyTakeaways: [
          'Mandatory adherence to fairness, transparency, and value for public expenditure.',
          'Specifications must not be tailored to restrict competition to proprietary vendors.',
          'Explicit justification required for limited or single tender inquiries.',
        ],
        readTimeMinutes: 4,
      },
      {
        title: 'Module 2: Government e-Marketplace (GeM) Mandate & Direct Purchases',
        keyTakeaways: [
          'Direct purchase allowed up to prescribed financial thresholds through lowest certified vendor.',
          'Mandatory reverse auction triggers for procurement exceeding threshold limits.',
          'Timely generation of Provisional Receipt and Consignee Receipt and Acceptance Certificate (CRAC).',
        ],
        readTimeMinutes: 5,
      },
      {
        title: 'Module 3: Integrity Pacts, Bid Securities & Audit Compliance',
        keyTakeaways: [
          'Exemptions and ceilings on Performance Security and Earnest Money Deposits (EMD).',
          'Strict prohibition of post-tender negotiations except with lowest compliant bidder (L1).',
          'Complete audit trail maintenance for Comptroller & Auditor General (CAG) inspection.',
        ],
        readTimeMinutes: 4,
      },
    ],
    assessmentQuestions: [
      {
        id: 'q-doc-1',
        question: 'Under public procurement rules, when is post-tender negotiation permissible?',
        options: [
          'Freely with all participants to drive costs down',
          'Only in exceptional cases and strictly with the lowest compliant bidder (L1)',
          'With the top three bidders simultaneously via sealed envelope',
          'Negotiations are strictly prohibited under every circumstance',
        ],
        correctIndex: 1,
        explanation: 'Post-tender negotiations are severely restricted to prevent cartelization and bias; they are permitted only under recorded exigency strictly with the L1 bidder.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
      {
        id: 'q-doc-2',
        question: 'What is the purpose of the Consignee Receipt and Acceptance Certificate (CRAC) on GeM?',
        options: [
          'To extend the delivery period automatically without penalty',
          'To certify formal inspection and receipt of goods for time-bound vendor payment',
          'To waive performance security deposits for micro enterprises',
          'To issue an administrative sanction for unspent budget grants',
        ],
        correctIndex: 1,
        explanation: 'CRAC verifies goods meet technical specifications and binds the buyer department to disburse vendor payment within the statutory 10-day window.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
      {
        id: 'q-doc-3',
        question: 'Which principle governs the drafting of tender technical specifications?',
        options: [
          'They should specify exact proprietary brand names to ensure high quality',
          'They must be generic, functional, and performance-based to promote broad competition',
          'They must be identical to the previous financial year regardless of market changes',
          'They are determined unilaterally by the supplier after bid submission',
        ],
        correctIndex: 1,
        explanation: 'GFR 2017 mandates generic and performance-oriented specifications to encourage widest possible competition without brand favoritism.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
      {
        id: 'q-doc-4',
        question: 'What constitutes an essential requirement for Single Tender / Proprietary Article procurement?',
        options: [
          'An informal email consent from the vendor',
          'A formal Proprietary Article Certificate (PAC) approved by the competent financial authority',
          'Verbal approval by the immediate section supervisor',
          'A price quote matching market retail list prices',
        ],
        correctIndex: 1,
        explanation: 'A formal PAC from the competent financial authority is mandatory to justify dispensing with open competitive bidding.',
        competencyTagged: 'Public Procurement & GeM Rules',
      },
    ],
  });
});

// 4. Endpoint: AI Assessment Evaluation & Competency Uplift
app.post('/api/evaluate-assessment', async (req, res) => {
  const { answers, questions, officialProfile } = req.body;

  let totalQuestions = Array.isArray(questions) ? questions.length : 0;
  let correctCount = 0;
  let questionBreakdown: any[] = [];

  questions.forEach((q: any, idx: number) => {
    const userSelected = answers[q.id];
    const isCorrect = userSelected === q.correctIndex;
    if (isCorrect) correctCount++;
    questionBreakdown.push({
      questionId: q.id,
      questionText: q.question,
      selected: userSelected,
      correct: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
      competency: q.competencyTagged || 'Public Administration',
    });
  });

  const percentageScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const karmaEarned = correctCount * 25 + (percentageScore >= 75 ? 50 : 20);

  // Compute uplift
  const scoreDelta = percentageScore >= 75 ? 1.2 : percentageScore >= 50 ? 0.7 : 0.3;

  return res.json({
    score: percentageScore,
    correctCount,
    totalQuestions,
    karmaEarned,
    passed: percentageScore >= 60,
    evalSummary: percentageScore >= 75
      ? 'Demonstrated strong operational mastery of statutory procurement rules and compliance protocols.'
      : 'Satisfactory baseline; recommend reviewing proprietary tender justification and GeM CRAC timeline requirements.',
    competencyUplift: {
      competencyName: questions[0]?.competencyTagged || 'Public Procurement & GeM Rules',
      previousLevel: 2.2,
      newLevel: Number((2.2 + scoreDelta).toFixed(1)),
      improvementPercentage: Math.round((scoreDelta / 5) * 100),
    },
    questionBreakdown,
  });
});

// ============================================================================
// MODULE 09: AI ASSESSMENT ENGINE BACKEND APIS
// ============================================================================

// 1. GET /api/v1/assessments - List assessments (supports filtering by status & role)
app.get('/api/v1/assessments', authenticateOfficial, (req, res) => {
  const userRole = (req as any).user.role;
  const statusParam = req.query.status as any;

  try {
    const list = assessmentStore.getAllAssessments({
      status: statusParam,
      role: userRole,
    });
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: 'AssessmentListError', message: err?.message });
  }
});

// 2. GET /api/v1/assessments/:id - Fetch assessment details
app.get('/api/v1/assessments/:id', authenticateOfficial, (req, res) => {
  const { id } = req.params;
  const userRole = (req as any).user.role;
  const asAttempt = req.query.attempt === 'true';

  try {
    if (asAttempt || userRole === 'Learner') {
      // Learner taking assessment: strictly strip answer key and explanation
      const learnerPayload = assessmentStore.getAssessmentForLearnerAttempt(id);
      if (!learnerPayload) {
        return res.status(404).json({
          error: 'AssessmentNotFound',
          message: 'Assessment not found or is not yet published for learner attempts.',
        });
      }
      return res.json(learnerPayload);
    }

    // Trainer / Admin: full assessment details including answer keys and validation status
    const assessment = assessmentStore.getAssessmentById(id, { role: userRole });
    if (!assessment) {
      return res.status(404).json({
        error: 'AssessmentNotFound',
        message: `Assessment ${id} not found.`,
      });
    }

    return res.json(assessment);
  } catch (err: any) {
    return res.status(500).json({ error: 'AssessmentFetchError', message: err?.message });
  }
});

// 3. POST /api/v1/assessments/generate - Generate MCQs from Module 08 content
app.post('/api/v1/assessments/generate', authenticateOfficial, requireRole(['Trainer', 'Admin']), async (req, res) => {
  const { contentId, numQuestions = 5, difficulty = 'MEDIUM', topic, language = 'English' } = req.body;
  const user = (req as any).user;

  if (!contentId) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'contentId of a processed Module 08 document is required.',
    });
  }

  try {
    const userProfile = profileStore.getProfile(user.id);
    const trainerName = userProfile ? userProfile.fullName : 'Civil Services Trainer';

    const assessment = await aiAssessmentService.generateAssessment({
      contentId,
      numQuestions: Math.min(Math.max(Number(numQuestions) || 5, 3), 20),
      difficulty: (['EASY', 'MEDIUM', 'HARD'].includes(difficulty) ? difficulty : 'MEDIUM') as any,
      topic,
      language,
      createdBy: {
        id: user.id,
        name: trainerName,
        role: user.role,
      },
    });

    return res.status(201).json(assessment);
  } catch (err: any) {
    console.error('Assessment generation failed:', err);
    return res.status(400).json({
      error: 'GenerationFailed',
      message: err?.message || 'Failed to generate assessment questions from content.',
    });
  }
});

// 4. POST /api/v1/assessments/:id/publish - Publish assessment (Trainer/Admin)
app.post('/api/v1/assessments/:id/publish', authenticateOfficial, requireRole(['Trainer', 'Admin']), (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    const published = assessmentStore.publishAssessment(id, user.id);
    return res.json(published);
  } catch (err: any) {
    return res.status(400).json({ error: 'PublishError', message: err?.message });
  }
});

// 5. POST /api/v1/assessments/:id/archive - Archive assessment (Trainer/Admin)
app.post('/api/v1/assessments/:id/archive', authenticateOfficial, requireRole(['Trainer', 'Admin']), (req, res) => {
  const { id } = req.params;

  try {
    const archived = assessmentStore.archiveAssessment(id);
    return res.json(archived);
  } catch (err: any) {
    return res.status(400).json({ error: 'ArchiveError', message: err?.message });
  }
});

// 6. POST /api/v1/assessments/:id/questions - Add a manual question (Trainer/Admin)
app.post('/api/v1/assessments/:id/questions', authenticateOfficial, requireRole(['Trainer', 'Admin']), (req, res) => {
  const { id } = req.params;
  const questionData = req.body;

  if (!questionData || !questionData.question_text || !questionData.option_a) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Question text and options are required.',
    });
  }

  try {
    const result = assessmentStore.addQuestion(id, questionData);
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: 'QuestionAddError', message: err?.message });
  }
});

// 7. PUT /api/v1/assessment-questions/:id - Update question (Trainer/Admin)
app.put('/api/v1/assessment-questions/:id', authenticateOfficial, requireRole(['Trainer', 'Admin']), (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const result = assessmentStore.updateQuestion(id, updates);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: 'QuestionUpdateError', message: err?.message });
  }
});

// 8. DELETE /api/v1/assessment-questions/:id - Delete question (Trainer/Admin)
app.delete('/api/v1/assessment-questions/:id', authenticateOfficial, requireRole(['Trainer', 'Admin']), (req, res) => {
  const { id } = req.params;

  try {
    const updatedAssessment = assessmentStore.deleteQuestion(id);
    return res.json(updatedAssessment);
  } catch (err: any) {
    return res.status(400).json({ error: 'QuestionDeleteError', message: err?.message });
  }
});

// 9. POST /api/v1/assessment-questions/:id/regenerate - Regenerate question with AI (Trainer/Admin)
app.post('/api/v1/assessment-questions/:id/regenerate', authenticateOfficial, requireRole(['Trainer', 'Admin']), async (req, res) => {
  const { id } = req.params;
  const { assessmentId, instructions } = req.body;

  if (!assessmentId) {
    return res.status(400).json({ error: 'ValidationError', message: 'assessmentId is required in body.' });
  }

  try {
    const regenerated = await aiAssessmentService.regenerateSingleQuestion(assessmentId, id, instructions);
    return res.json(regenerated);
  } catch (err: any) {
    return res.status(400).json({ error: 'RegenerationError', message: err?.message });
  }
});

// 10. POST /api/v1/assessments/:id/attempt - Start an assessment attempt (Learner)
app.post('/api/v1/assessments/:id/attempt', authenticateOfficial, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    const userProfile = profileStore.getProfile(user.id);
    const learnerName = userProfile ? userProfile.fullName : 'Government Official';

    const attempt = assessmentStore.startAttempt(id, user.id, learnerName, user.role);
    return res.status(201).json(attempt);
  } catch (err: any) {
    return res.status(400).json({ error: 'AttemptStartError', message: err?.message });
  }
});

// 11. POST /api/v1/attempts/:id/submit - Submit answers and evaluate
app.post('/api/v1/attempts/:id/submit', authenticateOfficial, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;
  const { responses, timeSpentSeconds } = req.body;

  if (!responses || typeof responses !== 'object') {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'responses dictionary (question_id -> chosen option) is required.',
    });
  }

  try {
    const evaluatedAttempt = assessmentStore.submitAttempt(
      id,
      user.id,
      responses,
      Number(timeSpentSeconds) || 0
    );

    // Auto-ingest evaluated attempt into Module 10 Progress & Performance Store
    try {
      performanceStore.ingestAssessmentResult(evaluatedAttempt);
    } catch (ingestErr) {
      console.warn('Module 10 auto-ingestion notification:', ingestErr);
    }

    return res.json(evaluatedAttempt);
  } catch (err: any) {
    return res.status(400).json({ error: 'SubmissionError', message: err?.message });
  }
});

// 12. GET /api/v1/attempts/:id/result - Get attempt result & evidence
app.get('/api/v1/attempts/:id/result', authenticateOfficial, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    const attempt = assessmentStore.getAttemptResult(id, user.id, user.role);
    if (!attempt) {
      return res.status(404).json({ error: 'AttemptNotFound', message: `Attempt ${id} not found.` });
    }
    return res.json(attempt);
  } catch (err: any) {
    return res.status(403).json({ error: 'AccessDenied', message: err?.message });
  }
});

// 13. GET /api/v1/attempts/learner/:learnerId - Learner's attempt history
app.get('/api/v1/attempts/learner/:learnerId', authenticateOfficial, (req, res) => {
  const { learnerId } = req.params;
  const user = (req as any).user;

  // Non-trainers can only query their own history
  if (user.role === 'Learner' && user.id !== learnerId) {
    return res.status(403).json({ error: 'AccessDenied', message: 'You can only view your own assessment history.' });
  }

  try {
    const attempts = assessmentStore.getLearnerAttempts(learnerId);
    return res.json(attempts);
  } catch (err: any) {
    return res.status(500).json({ error: 'HistoryFetchError', message: err?.message });
  }
});

// ============================================================================
// MODULE 10: PROGRESS & PERFORMANCE MANAGEMENT BACKEND APIS
// ============================================================================

// Helper to resolve target learner ID with RBAC guard
function resolveTargetLearner(req: express.Request): string {
  const user = (req as any).user;
  const requestedLearner = req.query.learnerId as string;

  if (user.role === 'Learner') {
    return user.id;
  }
  return requestedLearner || user.id || 'off-001';
}

// 1. GET /api/v1/progress - Summary for current or specified learner
app.get('/api/v1/progress', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const summary = performanceStore.getLearnerProgressSummary(targetId);
    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ error: 'ProgressSummaryError', message: err?.message });
  }
});

// 2. GET /api/v1/progress/learning - Detailed learning progress records
app.get('/api/v1/progress/learning', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const progressList = learningStore.getUserProgressList(targetId);
    return res.json(progressList);
  } catch (err: any) {
    return res.status(500).json({ error: 'LearningProgressError', message: err?.message });
  }
});

// 3. GET /api/v1/progress/completion - Overall completion metrics
app.get('/api/v1/progress/completion', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const progressList = learningStore.getUserProgressList(targetId);
    let totalProgressSum = 0;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    progressList.forEach(p => {
      totalProgressSum += p.progressPercentage;
      if (p.status === 'COMPLETED' || p.progressPercentage >= 100) completed++;
      else if (p.status === 'IN_PROGRESS' || p.progressPercentage > 0) inProgress++;
      else notStarted++;
    });

    const overallCompletion = progressList.length > 0 ? Math.round(totalProgressSum / progressList.length) : 0;

    return res.json({
      overallCompletion,
      totalResources: progressList.length,
      completedResources: completed,
      inProgressResources: inProgress,
      notStartedResources: notStarted,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'CompletionStatsError', message: err?.message });
  }
});

// 4. GET /api/v1/progress/hours - Learning hours (total, weekly, monthly, breakdown)
app.get('/api/v1/progress/hours', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const hours = performanceStore.getLearningHours(targetId);
    return res.json(hours);
  } catch (err: any) {
    return res.status(500).json({ error: 'HoursError', message: err?.message });
  }
});

// 5. GET /api/v1/progress/:learner_id - Specific learner progress profile
app.get('/api/v1/progress/:learner_id', authenticateOfficial, (req, res) => {
  const { learner_id } = req.params;
  const user = (req as any).user;

  if (user.role === 'Learner' && user.id !== learner_id) {
    return res.status(403).json({ error: 'AccessDenied', message: 'You cannot inspect another official\'s progress profile.' });
  }

  try {
    const summary = performanceStore.getLearnerProgressSummary(learner_id);
    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ error: 'ProgressSummaryError', message: err?.message });
  }
});

// 6. GET /api/v1/performance - Performance summary
app.get('/api/v1/performance', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const summary = performanceStore.getLearnerProgressSummary(targetId);
    return res.json({
      learnerId: targetId,
      learnerName: summary.learnerName,
      assessmentsCompletedCount: summary.assessmentsCompletedCount,
      averageAssessmentScore: summary.averageAssessmentScore,
      improvingTopicsCount: summary.improvingTopicsCount,
      topicsNeedingPracticeCount: summary.topicsNeedingPracticeCount,
      topImprovingTopics: summary.topImprovingTopics,
      topicsNeedingPractice: summary.topicsNeedingPractice,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'PerformanceError', message: err?.message });
  }
});

// 7. GET /api/v1/performance/topics - Topic-wise performance & trend deltas
app.get('/api/v1/performance/topics', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const topicRecords = performanceStore.getTopicPerformance(targetId);
    return res.json(topicRecords);
  } catch (err: any) {
    return res.status(500).json({ error: 'TopicPerformanceError', message: err?.message });
  }
});

// 8. GET /api/v1/performance/trends - Performance and learning trend points
app.get('/api/v1/performance/trends', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const trends = performanceStore.getPerformanceTrends(targetId);
    return res.json(trends);
  } catch (err: any) {
    return res.status(500).json({ error: 'TrendsError', message: err?.message });
  }
});

// 9. GET /api/v1/performance/evidence - Competency evidence records
app.get('/api/v1/performance/evidence', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const evidence = performanceStore.getEvidenceList(targetId);
    return res.json(evidence);
  } catch (err: any) {
    return res.status(500).json({ error: 'EvidenceError', message: err?.message });
  }
});

// 10. GET /api/v1/performance/assessments - Assessment attempt history
app.get('/api/v1/performance/assessments', authenticateOfficial, (req, res) => {
  const targetId = resolveTargetLearner(req);
  try {
    const attempts = assessmentStore.getLearnerAttempts(targetId);
    return res.json(attempts);
  } catch (err: any) {
    return res.status(500).json({ error: 'AssessmentHistoryError', message: err?.message });
  }
});

// 11. GET /api/v1/performance/:learner_id - Specific learner performance
app.get('/api/v1/performance/:learner_id', authenticateOfficial, (req, res) => {
  const { learner_id } = req.params;
  const user = (req as any).user;

  if (user.role === 'Learner' && user.id !== learner_id) {
    return res.status(403).json({ error: 'AccessDenied', message: 'You cannot inspect another official\'s performance records.' });
  }

  try {
    const summary = performanceStore.getLearnerProgressSummary(learner_id);
    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ error: 'PerformanceError', message: err?.message });
  }
});

// 12. POST /api/v1/performance/assessment-result - Ingest assessment result from Module 09
app.post('/api/v1/performance/assessment-result', authenticateOfficial, (req, res) => {
  const attempt = req.body as AssessmentAttempt;
  const user = (req as any).user;

  if (!attempt || !attempt.id) {
    return res.status(400).json({ error: 'ValidationError', message: 'Valid assessment attempt object is required.' });
  }

  if (user.role === 'Learner' && user.id !== attempt.learner_id) {
    return res.status(403).json({ error: 'AccessDenied', message: 'Cannot submit assessment results for another learner.' });
  }

  try {
    const result = performanceStore.ingestAssessmentResult(attempt);
    return res.status(result.ingested ? 201 : 200).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: 'IngestionError', message: err?.message });
  }
});

// Dev vs Production Vite mounting
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export default app;

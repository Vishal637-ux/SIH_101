/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 06: Integration Ecosystem Data Store & Normalization Engine
 * 
 * Responsibilities:
 * - Unified repository of normalized external learning resources from iGOT, NSSTA, TPAC
 * - Duplicate prevention via compound unique key (source + externalId)
 * - Synchronization execution, logging, and metrics tracking
 * - Enrollment state coordination with external providers
 * - Providing normalized learning catalog directly to Module 05 & Module 07
 */

import { igotClient } from './integrations/igotClient';
import { nsstaClient } from './integrations/nsstaClient';
import { tpacClient } from './integrations/tpacClient';
import { governmentSsoAdapter } from './integrations/ssoAdapter';
import { CompetencyDomain } from './competencyStore';
import { profileStore } from './profileStore';

export type IntegrationSource = 'IGOT' | 'NSSTA' | 'TPAC' | 'INTERNAL';
export type IntegrationStatus = 'CONNECTED' | 'DEMO_MODE' | 'NOT_CONFIGURED' | 'ERROR';

export interface NormalizedLearningResource {
  id: string; // Internal system ID e.g. res-igot-crs-101
  externalId: string; // Unique ID in external ecosystem
  source: IntegrationSource;
  title: string;
  description: string;
  provider: 'iGOT Karmayogi' | 'NSSTA' | 'TPAC' | 'Platform Content';
  resourceType: 'Interactive Course' | 'Micro-Learning' | 'Handbook' | 'Executive Briefing' | 'Case Study';
  primaryCompetencyId: string;
  competencyCode: string;
  competencyName: string;
  domain: CompetencyDomain;
  targetProficiencyLevel: number;
  estimatedHours: number;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  language: string;
  externalUrl: string;
  learningObjectives: string[];
  syllabus: Array<{ title: string; durationMinutes: number }>;
  karmaPoints: number;
  lastSyncedAt: string;
  isActive: boolean;
  syncVersion: number;
}

export interface IntegrationSourceStatus {
  source: 'IGOT' | 'NSSTA' | 'TPAC' | 'GOV_SSO';
  name: string;
  status: IntegrationStatus;
  lastSyncAt: string;
  lastError: string | null;
  totalResourcesCount: number;
  endpointUrl: string;
  isLiveConfigured: boolean;
  notice: string;
}

export interface IntegrationSyncLog {
  id: string;
  source: 'IGOT' | 'NSSTA' | 'TPAC' | 'ALL';
  triggeredBy: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  errorMessage: string | null;
  details: string;
}

export interface ExternalEnrollmentRecord {
  id: string;
  userId: string;
  officialName: string;
  resourceId: string;
  externalId: string;
  source: IntegrationSource;
  resourceTitle: string;
  provider: string;
  competencyId: string;
  competencyName: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED';
  enrolledAt: string;
  confirmationCode: string;
  module07HandoffTicket: string;
}

class IntegrationDataStore {
  // Map of normalized resources: key = "source:externalId"
  private resources: Map<string, NormalizedLearningResource> = new Map();
  private syncLogs: IntegrationSyncLog[] = [];
  private enrollments: Map<string, ExternalEnrollmentRecord> = new Map();

  // Source metadata state
  private sourceMetadata: Map<string, { lastSyncAt: string; lastError: string | null }> = new Map([
    ['IGOT', { lastSyncAt: new Date(Date.now() - 3600000 * 2).toISOString(), lastError: null }],
    ['NSSTA', { lastSyncAt: new Date(Date.now() - 3600000 * 3).toISOString(), lastError: null }],
    ['TPAC', { lastSyncAt: new Date(Date.now() - 3600000 * 4).toISOString(), lastError: null }],
    ['GOV_SSO', { lastSyncAt: new Date().toISOString(), lastError: null }],
  ]);

  constructor() {
    // Seed initial synchronization at server startup
    this.executeSync('ALL', 'SYSTEM_INITIALIZATION');
  }

  // 1. Core Sync Engine with Duplicate Prevention
  public async executeSync(
    source: 'IGOT' | 'NSSTA' | 'TPAC' | 'ALL',
    triggeredBy: string = 'SYSTEM'
  ): Promise<IntegrationSyncLog> {
    const startedAt = new Date().toISOString();
    const logId = `sync-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let errorMessage: string | null = null;
    let status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' = 'SUCCESS';

    try {
      const now = new Date().toISOString();

      // --- Sync iGOT Karmayogi ---
      if (source === 'IGOT' || source === 'ALL') {
        try {
          const igotCourses = await igotClient.fetchCatalog();
          igotCourses.forEach(raw => {
            recordsProcessed++;
            const compoundKey = `IGOT:${raw.courseId}`;
            const existing = this.resources.get(compoundKey);

            const normalized: NormalizedLearningResource = {
              id: `res-${raw.courseId}`,
              externalId: raw.courseId,
              source: 'IGOT',
              title: raw.name,
              description: raw.summary,
              provider: 'iGOT Karmayogi',
              resourceType: raw.contentType as any || 'Interactive Course',
              primaryCompetencyId: raw.competencyMapping.competencyId,
              competencyCode: raw.competencyMapping.competencyCode,
              competencyName: raw.competencyMapping.competencyName,
              domain: raw.competencyMapping.domain as CompetencyDomain,
              targetProficiencyLevel: raw.proficiencyLevel,
              estimatedHours: Math.round(raw.durationMinutes / 60) || 4,
              difficulty: raw.complexity,
              language: raw.language,
              externalUrl: raw.directUrl,
              learningObjectives: raw.learningOutcomes,
              syllabus: raw.syllabusTopics.map(s => ({ title: s.name, durationMinutes: s.durationMinutes })),
              karmaPoints: raw.karmaPointsAwarded,
              lastSyncedAt: now,
              isActive: true,
              syncVersion: existing ? existing.syncVersion + 1 : 1,
            };

            if (existing) {
              recordsUpdated++;
            } else {
              recordsCreated++;
            }
            this.resources.set(compoundKey, normalized);
          });
          this.sourceMetadata.set('IGOT', { lastSyncAt: now, lastError: null });
        } catch (err: any) {
          console.error('Error during iGOT synchronization:', err?.message);
          status = 'PARTIAL_SUCCESS';
          this.sourceMetadata.set('IGOT', { lastSyncAt: now, lastError: err?.message || 'Sync error' });
        }
      }

      // --- Sync NSSTA ---
      if (source === 'NSSTA' || source === 'ALL') {
        try {
          const nsstaProgs = await nsstaClient.fetchProgrammes();
          nsstaProgs.forEach(raw => {
            recordsProcessed++;
            const compoundKey = `NSSTA:${raw.programmeCode}`;
            const existing = this.resources.get(compoundKey);

            const normalized: NormalizedLearningResource = {
              id: `res-${raw.programmeCode}`,
              externalId: raw.programmeCode,
              source: 'NSSTA',
              title: raw.title,
              description: raw.synopsis,
              provider: 'NSSTA',
              resourceType: raw.format as any || 'Interactive Course',
              primaryCompetencyId: raw.competencyMapping.competencyId,
              competencyCode: raw.competencyMapping.competencyCode,
              competencyName: raw.competencyMapping.competencyName,
              domain: raw.competencyMapping.domain as CompetencyDomain,
              targetProficiencyLevel: raw.targetLevel,
              estimatedHours: raw.durationHours,
              difficulty: raw.pedagogicalTier,
              language: raw.medium,
              externalUrl: raw.portalUrl,
              learningObjectives: raw.coreObjectives,
              syllabus: raw.sessions.map(s => ({ title: s.title, durationMinutes: s.durationMinutes })),
              karmaPoints: raw.karmaCredits,
              lastSyncedAt: now,
              isActive: true,
              syncVersion: existing ? existing.syncVersion + 1 : 1,
            };

            if (existing) {
              recordsUpdated++;
            } else {
              recordsCreated++;
            }
            this.resources.set(compoundKey, normalized);
          });
          this.sourceMetadata.set('NSSTA', { lastSyncAt: now, lastError: null });
        } catch (err: any) {
          console.error('Error during NSSTA synchronization:', err?.message);
          status = 'PARTIAL_SUCCESS';
          this.sourceMetadata.set('NSSTA', { lastSyncAt: now, lastError: err?.message || 'Sync error' });
        }
      }

      // --- Sync TPAC ---
      if (source === 'TPAC' || source === 'ALL') {
        try {
          const tpacModules = await tpacClient.fetchModules();
          tpacModules.forEach(raw => {
            recordsProcessed++;
            const compoundKey = `TPAC:${raw.moduleRef}`;
            const existing = this.resources.get(compoundKey);

            const normalized: NormalizedLearningResource = {
              id: `res-${raw.moduleRef}`,
              externalId: raw.moduleRef,
              source: 'TPAC',
              title: raw.name,
              description: raw.abstract,
              provider: 'TPAC',
              resourceType: raw.structure as any || 'Interactive Course',
              primaryCompetencyId: raw.competencyMapping.competencyId,
              competencyCode: raw.competencyMapping.competencyCode,
              competencyName: raw.competencyMapping.competencyName,
              domain: raw.competencyMapping.domain as CompetencyDomain,
              targetProficiencyLevel: raw.benchmarkLevel,
              estimatedHours: raw.durationHours,
              difficulty: raw.rigour,
              language: raw.instructionLanguage,
              externalUrl: raw.accessUrl,
              learningObjectives: raw.practicalGoals,
              syllabus: raw.curriculumUnits.map(s => ({ title: s.title, durationMinutes: s.durationMinutes })),
              karmaPoints: raw.credits,
              lastSyncedAt: now,
              isActive: true,
              syncVersion: existing ? existing.syncVersion + 1 : 1,
            };

            if (existing) {
              recordsUpdated++;
            } else {
              recordsCreated++;
            }
            this.resources.set(compoundKey, normalized);
          });
          this.sourceMetadata.set('TPAC', { lastSyncAt: now, lastError: null });
        } catch (err: any) {
          console.error('Error during TPAC synchronization:', err?.message);
          status = 'PARTIAL_SUCCESS';
          this.sourceMetadata.set('TPAC', { lastSyncAt: now, lastError: err?.message || 'Sync error' });
        }
      }
    } catch (outerErr: any) {
      status = 'FAILED';
      errorMessage = outerErr?.message || 'Catastrophic synchronization fault';
    }

    const completedAt = new Date().toISOString();
    const log: IntegrationSyncLog = {
      id: logId,
      source,
      triggeredBy,
      startedAt,
      completedAt,
      status,
      recordsProcessed,
      recordsCreated,
      recordsUpdated,
      errorMessage,
      details: `Processed ${recordsProcessed} items across ${source} ecosystem: ${recordsCreated} created, ${recordsUpdated} updated. Status: ${status}`,
    };

    this.syncLogs.unshift(log);
    if (this.syncLogs.length > 50) this.syncLogs.pop();

    return log;
  }

  // 2. Query Normalized Resources
  public getNormalizedResources(filters?: {
    source?: string;
    domain?: string;
    search?: string;
    resourceType?: string;
  }): NormalizedLearningResource[] {
    let list = Array.from(this.resources.values());

    if (filters?.source && filters.source !== 'ALL') {
      list = list.filter(r => r.source === filters.source);
    }

    if (filters?.domain && filters.domain !== 'ALL') {
      list = list.filter(r => r.domain === filters.domain);
    }

    if (filters?.resourceType && filters.resourceType !== 'ALL') {
      list = list.filter(r => r.resourceType === filters.resourceType);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.competencyName.toLowerCase().includes(q) ||
        r.competencyCode.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => a.title.localeCompare(b.title));
  }

  // 3. Find Resource by ID
  public getResourceById(id: string): NormalizedLearningResource | null {
    // Check direct ID, externalId, or substring match
    for (const res of this.resources.values()) {
      if (res.id === id || res.externalId === id || res.id.includes(id) || id.includes(res.externalId)) {
        return res;
      }
    }
    return null;
  }

  // 4. Enroll Official in External Course
  public async enrollOfficial(resourceId: string, userId: string): Promise<ExternalEnrollmentRecord> {
    const resource = this.getResourceById(resourceId);
    if (!resource) {
      throw new Error(`Learning resource not found: ${resourceId}`);
    }

    const profile = profileStore.getProfile(userId);
    const officialName = profile ? profile.fullName : 'Official';

    let confirmationCode = '';

    if (resource.source === 'IGOT') {
      const res = await igotClient.enrollOfficial(resource.externalId, userId);
      confirmationCode = res.enrollmentId;
    } else if (resource.source === 'NSSTA') {
      const res = await nsstaClient.enrollOfficial(resource.externalId, userId);
      confirmationCode = res.registrationNumber;
    } else if (resource.source === 'TPAC') {
      const res = await tpacClient.enrollOfficial(resource.externalId, userId);
      confirmationCode = res.docketNumber;
    } else {
      confirmationCode = `INT-ENR-${Date.now().toString().slice(-6)}`;
    }

    const enrollmentRecord: ExternalEnrollmentRecord = {
      id: `enr-${userId}-${resource.id}`,
      userId,
      officialName,
      resourceId: resource.id,
      externalId: resource.externalId,
      source: resource.source,
      resourceTitle: resource.title,
      provider: resource.provider,
      competencyId: resource.primaryCompetencyId,
      competencyName: resource.competencyName,
      status: 'ENROLLED',
      enrolledAt: new Date().toISOString(),
      confirmationCode,
      module07HandoffTicket: `TKT-M07-${Date.now().toString().slice(-6)}`,
    };

    this.enrollments.set(`${userId}:${resource.id}`, enrollmentRecord);
    return enrollmentRecord;
  }

  // 5. Get Ecosystem Status
  public getEcosystemStatus(): {
    overallMode: 'DEMO' | 'HYBRID' | 'LIVE';
    disclaimer: string;
    sources: IntegrationSourceStatus[];
    metrics: {
      totalExternalResources: number;
      totalEnrollments: number;
      lastSyncTimestamp: string;
    };
  } {
    const igotStat = igotClient.getStatus();
    const nsstaStat = nsstaClient.getStatus();
    const tpacStat = tpacClient.getStatus();
    const ssoStat = governmentSsoAdapter.getSanitizedStatus();

    const igotMeta = this.sourceMetadata.get('IGOT')!;
    const nsstaMeta = this.sourceMetadata.get('NSSTA')!;
    const tpacMeta = this.sourceMetadata.get('TPAC')!;

    const resources = Array.from(this.resources.values());
    const igotCount = resources.filter(r => r.source === 'IGOT').length;
    const nsstaCount = resources.filter(r => r.source === 'NSSTA').length;
    const tpacCount = resources.filter(r => r.source === 'TPAC').length;

    const sources: IntegrationSourceStatus[] = [
      {
        source: 'IGOT',
        name: 'iGOT Karmayogi (DoPT)',
        status: igotStat.isDemoMode ? 'DEMO_MODE' : 'CONNECTED',
        lastSyncAt: igotMeta.lastSyncAt,
        lastError: igotMeta.lastError,
        totalResourcesCount: igotCount,
        endpointUrl: igotStat.baseUrl,
        isLiveConfigured: igotStat.isEnabled,
        notice: igotStat.notice,
      },
      {
        source: 'NSSTA',
        name: 'NSSTA Greater Noida (MoSPI)',
        status: nsstaStat.isDemoMode ? 'DEMO_MODE' : 'CONNECTED',
        lastSyncAt: nsstaMeta.lastSyncAt,
        lastError: nsstaMeta.lastError,
        totalResourcesCount: nsstaCount,
        endpointUrl: nsstaStat.baseUrl,
        isLiveConfigured: false,
        notice: nsstaStat.notice,
      },
      {
        source: 'TPAC',
        name: 'TPAC Administrative Competence',
        status: tpacStat.isDemoMode ? 'DEMO_MODE' : 'CONNECTED',
        lastSyncAt: tpacMeta.lastSyncAt,
        lastError: tpacMeta.lastError,
        totalResourcesCount: tpacCount,
        endpointUrl: tpacStat.baseUrl,
        isLiveConfigured: false,
        notice: tpacStat.notice,
      },
      {
        source: 'GOV_SSO',
        name: 'Parichay Government SSO (NIC)',
        status: ssoStat.status === 'CONFIGURED' ? 'CONNECTED' : ssoStat.status,
        lastSyncAt: this.sourceMetadata.get('GOV_SSO')!.lastSyncAt,
        lastError: null,
        totalResourcesCount: 0,
        endpointUrl: ssoStat.issuerUrl,
        isLiveConfigured: ssoStat.isEnabled,
        notice: ssoStat.notice,
      },
    ];

    return {
      overallMode: 'DEMO',
      disclaimer: 'Demo data — live government integration credentials are not configured in environment. The platform uses verified civil service curriculum simulation for iGOT Karmayogi, NSSTA, and TPAC.',
      sources,
      metrics: {
        totalExternalResources: resources.length,
        totalEnrollments: this.enrollments.size,
        lastSyncTimestamp: this.syncLogs[0]?.completedAt || new Date().toISOString(),
      },
    };
  }

  // 6. Get Audit Sync Logs
  public getSyncLogs(): IntegrationSyncLog[] {
    return this.syncLogs;
  }

  // 7. Get Official's External Enrollments
  public getUserEnrollments(userId: string): ExternalEnrollmentRecord[] {
    return Array.from(this.enrollments.values()).filter(e => e.userId === userId);
  }
}

export const integrationStore = new IntegrationDataStore();

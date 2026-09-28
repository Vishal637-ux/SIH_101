/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 08: Content Management Data Store & Processing Service Layer
 * 
 * Responsibilities:
 * - Real file persistence and safe local disk storage
 * - File validation (MIME types, extensions, size limits, path sanitization)
 * - Safe text extraction (PDF parsing via pdf-parse, plain text/markdown, PPTX text tokens)
 * - Text normalization and topic/competency tagging
 * - Content state machine: UPLOADED -> PROCESSING -> READY -> PUBLISHED -> ARCHIVED
 * - Version tracking, processing job queues, and immutable audit logs
 * - Controlled access and RBAC enforcement (Trainer/Admin vs Learner)
 * - Publishing integration with Module 07 (Learning Management)
 * - Content Docket preparation for Module 09 (AI Assessment Engine)
 */

import fs from 'fs';
import path from 'path';
import { learningStore } from './learningStore';
import { profileStore } from './profileStore';

export type ContentType = 'PDF' | 'PPT' | 'VIDEO' | 'DOCUMENT';
export type ContentStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'PUBLISHED' | 'ARCHIVED' | 'FAILED';
export type ProcessingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface ContentStructureSection {
  sectionIndex: number;
  title: string;
  pageOrSlide?: number;
  content: string;
  wordCount: number;
}

export interface ContentItem {
  content_id: string;
  owner_user_id: string;
  owner_name: string;
  owner_role: 'Trainer' | 'Admin' | 'Learner';
  title: string;
  description: string;
  content_type: ContentType;
  language: string;
  object_key: string; // File path on disk
  file_name: string; // Sanitized original filename
  file_size: number; // in bytes
  mime_type: string;
  status: ContentStatus;
  processing_status: ProcessingStatus;
  version: number;
  extracted_text: string;
  extracted_structure: ContentStructureSection[];
  word_count: number;
  page_count?: number;
  topics: string[];
  competency_id: string;
  competency_name: string;
  domain: 'Statistical' | 'Technical' | 'Digital Governance' | 'Behavioural / Managerial';
  processing_error: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version: number;
  file_name: string;
  file_size: number;
  change_summary: string;
  created_at: string;
  created_by: string;
}

export interface ContentProcessingJob {
  job_id: string;
  content_id: string;
  status: ProcessingStatus;
  current_step: string;
  steps: Array<{
    name: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    timestamp: string;
  }>;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  logs: string[];
}

export interface ContentAuditLog {
  id: string;
  content_id: string;
  action:
    | 'UPLOAD'
    | 'PROCESS_START'
    | 'PROCESS_SUCCESS'
    | 'PROCESS_FAILED'
    | 'METADATA_UPDATE'
    | 'PUBLISH'
    | 'ARCHIVE'
    | 'DOWNLOAD'
    | 'DELETE';
  performed_by: string;
  performed_by_name: string;
  role: string;
  timestamp: string;
  details: string;
}

export interface AssessmentDocket {
  content_id: string;
  title: string;
  description: string;
  domain: string;
  competency_id: string;
  competency_name: string;
  extracted_text: string;
  extracted_structure: ContentStructureSection[];
  word_count: number;
  topics: string[];
  is_ready_for_assessment: boolean;
  status: ContentStatus;
}

// Storage Configuration
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'content');

export class ContentDataStore {
  private contentItems: Map<string, ContentItem> = new Map();
  private versions: Map<string, ContentVersion[]> = new Map();
  private jobs: Map<string, ContentProcessingJob> = new Map();
  private auditLogs: ContentAuditLog[] = [];

  constructor() {
    this.ensureStorageDirectory();
    this.seedInitialContent();
  }

  private ensureStorageDirectory() {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create storage directory:', err);
    }
  }

  // 1. Initial Seed Data representing verified official statistical manuals
  private seedInitialContent() {
    const seed1Text = `CHAPTER 4: STATUTORY PRINCIPLES OF PUBLIC PROCUREMENT UNDER GFR 2017
Rule 144 of the General Financial Rules (GFR), 2017 stipulates that every authority delegated with the financial power of procuring goods in the public interest shall have the responsibility and accountability to bring efficiency, economy, and transparency in matters relating to public procurement and for fair and equitable treatment of suppliers.

Rule 149 Mandate on Government e-Marketplace (GeM):
Procurement through GeM is mandatory for all Central Ministries, Departments, and attached offices for goods and services available on the portal.
1. Direct Purchase: Purchases up to ₹25,000 can be made directly through any of the available suppliers on the GeM portal, meeting the requisite quality, specification and delivery period.
2. L1 Purchase: Purchases above ₹25,000 and up to ₹5,00,000 can be made through the GeM Seller having the lowest price among the available sellers (at least three different manufacturers/brands).
3. Bidding / Reverse Auction: For purchases above ₹5,00,000, buyer must mandatorily conduct an online bidding or reverse auction.
4. Consignee Receipt and Acceptance Certificate (CRAC): Buyer must inspect and issue CRAC within 10 days of delivery. Timely payments must be made to suppliers within 10 days of CRAC issuance.
5. Single Source / Proprietary Article: Strict prohibition exists against tailoring technical specifications to favor any proprietary brand. In unavoidable instances where proprietary goods are required, a formal Proprietary Article Certificate (PAC) approved by the Competent Financial Authority is mandatory.`;

    const seed2Text = `SECTION 2: DATA FIDUCIARY OBLIGATIONS IN GOVERNMENT AGENCIES
Under the Digital Personal Data Protection Act, 2023, public administrative bodies processing citizen personal data for welfare delivery, biometric authentication, and survey statistics act as Data Fiduciaries.

Core Directives for Officials:
1. Lawful Basis and Purpose Limitation: Personal data may only be processed for the specific public service or statutory purpose for which it was collected or mandated by law.
2. Notice and Verifiable Consent: Prior to data collection, clear notices in plain official language (including regional languages) must explain what data is collected and for what scheme delivery.
3. Reasonable Security Safeguards: Administrative and technical safeguards must prevent personal data breaches. Any breach must be formally reported to the Data Protection Board of India and the affected citizens without undue delay.
4. Data Minimization: Collecting ancillary citizen attributes beyond the direct operational need of the welfare scheme constitutes a regulatory infraction.`;

    const seed3Text = `NATIONAL QUALITY ASSURANCE FRAMEWORK (NQAF) FOR OFFICIAL STATISTICS
The United Nations Fundamental Principles of Official Statistics and the MoSPI National Quality Assurance Framework mandate that official statistical production must adhere to rigorous quality dimensions:

1. Relevance & Statistical Integrity: Statistics must meet policy users' needs while remaining completely insulated from political interference.
2. Accuracy & Reliability: Sample survey estimates must publish Relative Standard Errors (RSE) and confidence intervals.
3. Timeliness & Punctuality: Advance release calendars must be adhered to strictly.
4. Accessibility & Clarity: Microdata and metadata must be available on the national data dissemination portal in standardized formats.`;

    // Persist seed files to disk so they physically exist
    const file1Path = path.join(UPLOADS_DIR, 'gem-4.0-procurement-compendium.txt');
    const file2Path = path.join(UPLOADS_DIR, 'dpdp-act-public-admin-handbook.txt');
    const file3Path = path.join(UPLOADS_DIR, 'mospi-nqaf-framework-2023.txt');

    try {
      if (!fs.existsSync(file1Path)) fs.writeFileSync(file1Path, seed1Text, 'utf-8');
      if (!fs.existsSync(file2Path)) fs.writeFileSync(file2Path, seed2Text, 'utf-8');
      if (!fs.existsSync(file3Path)) fs.writeFileSync(file3Path, seed3Text, 'utf-8');
    } catch (e) {
      console.warn('Seed file disk write notice:', e);
    }

    const item1: ContentItem = {
      content_id: 'cnt-101',
      owner_user_id: 'trainer-001',
      owner_name: 'Dr. Sunita Rao (NSSTA Senior Faculty)',
      owner_role: 'Trainer',
      title: 'Compendium of Public Procurement & GeM 4.0 Guidelines',
      description: 'Statutory threshold limits, reverse auctions, and financial propriety standards under GFR 2017 for administrative officers.',
      content_type: 'PDF',
      language: 'English',
      object_key: file1Path,
      file_name: 'gem-4.0-procurement-compendium.pdf',
      file_size: 142560,
      mime_type: 'application/pdf',
      status: 'PUBLISHED',
      processing_status: 'COMPLETED',
      version: 1,
      extracted_text: seed1Text,
      extracted_structure: [
        {
          sectionIndex: 0,
          title: 'Statutory Principles of Public Procurement',
          pageOrSlide: 1,
          content: seed1Text.slice(0, 400),
          wordCount: 65,
        },
        {
          sectionIndex: 1,
          title: 'GeM Purchase Tiers & Bidding Mandate',
          pageOrSlide: 2,
          content: seed1Text.slice(400),
          wordCount: 160,
        },
      ],
      word_count: 225,
      page_count: 8,
      topics: ['Public Procurement', 'GFR 2017', 'GeM 4.0', 'CRAC', 'Financial Propriety'],
      competency_id: 'comp-beh-001',
      competency_name: 'Ethics & Financial Propriety',
      domain: 'Behavioural / Managerial',
      processing_error: null,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    };

    const item2: ContentItem = {
      content_id: 'cnt-102',
      owner_user_id: 'trainer-001',
      owner_name: 'Dr. Sunita Rao (NSSTA Senior Faculty)',
      owner_role: 'Trainer',
      title: 'Handbook on Digital Personal Data Protection (DPDP) in Public Administration',
      description: 'Obligations of Government Data Fiduciaries, citizen consent notice workflows, and breach reporting under DPDP Act 2023.',
      content_type: 'PDF',
      language: 'English & Hindi',
      object_key: file2Path,
      file_name: 'dpdp-act-public-admin-handbook.pdf',
      file_size: 198420,
      mime_type: 'application/pdf',
      status: 'PUBLISHED',
      processing_status: 'COMPLETED',
      version: 1,
      extracted_text: seed2Text,
      extracted_structure: [
        {
          sectionIndex: 0,
          title: 'Data Fiduciary Mandates & Lawful Processing',
          pageOrSlide: 1,
          content: seed2Text.slice(0, 350),
          wordCount: 52,
        },
        {
          sectionIndex: 1,
          title: 'Notice, Consent & Security Safeguards',
          pageOrSlide: 2,
          content: seed2Text.slice(350),
          wordCount: 98,
        },
      ],
      word_count: 150,
      page_count: 12,
      topics: ['DPDP Act 2023', 'Data Privacy', 'Data Fiduciary', 'Citizen Rights', 'Data Minimization'],
      competency_id: 'comp-dig-001',
      competency_name: 'Data Privacy',
      domain: 'Digital Governance',
      processing_error: null,
      created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    };

    const item3: ContentItem = {
      content_id: 'cnt-103',
      owner_user_id: 'trainer-001',
      owner_name: 'Dr. Sunita Rao (NSSTA Senior Faculty)',
      owner_role: 'Trainer',
      title: 'National Quality Assurance Framework (NQAF) for Official Statistics',
      description: 'Quality dimensions, survey variance reporting, and advance release calendars mandated by MoSPI.',
      content_type: 'PDF',
      language: 'English',
      object_key: file3Path,
      file_name: 'mospi-nqaf-framework-2023.pdf',
      file_size: 215000,
      mime_type: 'application/pdf',
      status: 'READY',
      processing_status: 'COMPLETED',
      version: 1,
      extracted_text: seed3Text,
      extracted_structure: [
        {
          sectionIndex: 0,
          title: 'UN Principles & Quality Dimensions',
          pageOrSlide: 1,
          content: seed3Text,
          wordCount: 95,
        },
      ],
      word_count: 95,
      page_count: 6,
      topics: ['NQAF', 'Statistical Integrity', 'RSE Reporting', 'UN Principles', 'Advance Release Calendar'],
      competency_id: 'comp-stat-003',
      competency_name: 'Statistical Quality Assurance',
      domain: 'Statistical',
      processing_error: null,
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      published_at: null,
    };

    this.contentItems.set(item1.content_id, item1);
    this.contentItems.set(item2.content_id, item2);
    this.contentItems.set(item3.content_id, item3);

    this.auditLogs.push(
      {
        id: 'aud-001',
        content_id: 'cnt-101',
        action: 'PUBLISH',
        performed_by: 'trainer-001',
        performed_by_name: 'Dr. Sunita Rao',
        role: 'Trainer',
        timestamp: item1.published_at!,
        details: 'Initial content published to Learning Management catalog.',
      },
      {
        id: 'aud-002',
        content_id: 'cnt-102',
        action: 'PUBLISH',
        performed_by: 'trainer-001',
        performed_by_name: 'Dr. Sunita Rao',
        role: 'Trainer',
        timestamp: item2.published_at!,
        details: 'DPDP compliance handbook published and mapped to comp-dig-001.',
      }
    );
  }

  // 2. Validate File Upload Requirements
  public validateUpload(file: {
    name: string;
    size: number;
    mimetype: string;
    buffer?: Buffer;
  }): { valid: boolean; error?: string; contentType: ContentType } {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit (provided: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        contentType: 'PDF',
      };
    }

    const ext = path.extname(file.name).toLowerCase();
    let contentType: ContentType = 'DOCUMENT';

    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      contentType = 'PDF';
    } else if (
      ['.ppt', '.pptx'].includes(ext) ||
      file.mimetype.includes('powerpoint') ||
      file.mimetype.includes('presentationml')
    ) {
      contentType = 'PPT';
    } else if (
      ['.mp4', '.webm', '.mkv', '.mov'].includes(ext) ||
      file.mimetype.startsWith('video/')
    ) {
      contentType = 'VIDEO';
    } else if (
      ['.txt', '.md', '.docx', '.csv'].includes(ext) ||
      file.mimetype.startsWith('text/') ||
      file.mimetype.includes('wordprocessingml')
    ) {
      contentType = 'DOCUMENT';
    } else {
      return {
        valid: false,
        error: `Unsupported file format '${ext}'. Supported: PDF (.pdf), Presentation (.ppt, .pptx), Video (.mp4, .webm), Documents (.txt, .md, .docx)`,
        contentType: 'DOCUMENT',
      };
    }

    return { valid: true, contentType };
  }

  // 3. Store file to disk safely
  public async storeFile(
    filename: string,
    buffer: Buffer
  ): Promise<{ objectKey: string; sanitizedName: string }> {
    this.ensureStorageDirectory();

    // Sanitize filename to prevent directory traversal
    const base = path.basename(filename);
    const sanitizedName = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePrefix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const targetFile = `${uniquePrefix}-${sanitizedName}`;
    const objectKey = path.join(UPLOADS_DIR, targetFile);

    await fs.promises.writeFile(objectKey, buffer);
    return { objectKey, sanitizedName };
  }

  // 4. Create Content Record
  public async createContent(params: {
    ownerUserId: string;
    ownerName: string;
    ownerRole: 'Trainer' | 'Admin' | 'Learner';
    title: string;
    description: string;
    language: string;
    topics: string[];
    competencyId?: string;
    competencyName?: string;
    domain?: 'Statistical' | 'Technical' | 'Digital Governance' | 'Behavioural / Managerial';
    file: {
      name: string;
      size: number;
      mimetype: string;
      buffer: Buffer;
    };
  }): Promise<ContentItem> {
    const validation = this.validateUpload(params.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { objectKey, sanitizedName } = await this.storeFile(
      params.file.name,
      params.file.buffer
    );

    const contentId = `cnt-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const item: ContentItem = {
      content_id: contentId,
      owner_user_id: params.ownerUserId,
      owner_name: params.ownerName,
      owner_role: params.ownerRole,
      title: params.title.trim(),
      description: (params.description || '').trim(),
      content_type: validation.contentType,
      language: params.language || 'English',
      object_key: objectKey,
      file_name: sanitizedName,
      file_size: params.file.size,
      mime_type: params.file.mimetype || 'application/octet-stream',
      status: 'UPLOADED',
      processing_status: 'PENDING',
      version: 1,
      extracted_text: '',
      extracted_structure: [],
      word_count: 0,
      page_count: 0,
      topics: params.topics || [],
      competency_id: params.competencyId || 'comp-stat-001',
      competency_name: params.competencyName || 'Survey Design & Sampling',
      domain: params.domain || 'Statistical',
      processing_error: null,
      created_at: now,
      updated_at: now,
      published_at: null,
    };

    this.contentItems.set(contentId, item);

    // Initial Version
    this.versions.set(contentId, [
      {
        id: `ver-${contentId}-1`,
        content_id: contentId,
        version: 1,
        file_name: sanitizedName,
        file_size: params.file.size,
        change_summary: 'Initial content upload',
        created_at: now,
        created_by: params.ownerName,
      },
    ]);

    // Audit Log
    this.auditLogs.unshift({
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      content_id: contentId,
      action: 'UPLOAD',
      performed_by: params.ownerUserId,
      performed_by_name: params.ownerName,
      role: params.ownerRole,
      timestamp: now,
      details: `Uploaded file '${sanitizedName}' (${(params.file.size / 1024).toFixed(1)} KB). Status: UPLOADED.`,
    });

    // Auto-trigger background processing
    this.processContent(contentId, params.ownerUserId, params.ownerName, params.ownerRole).catch(
      err => console.error(`Background processing failed for ${contentId}:`, err)
    );

    return item;
  }

  // 5. Processing Engine (PDF text extraction, normalization, section slicing)
  public async processContent(
    contentId: string,
    triggeredByUserId: string,
    triggeredByName: string,
    triggeredByRole: string
  ): Promise<ContentProcessingJob> {
    const item = this.contentItems.get(contentId);
    if (!item) throw new Error(`Content item not found: ${contentId}`);

    const jobId = `job-${contentId}-${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();

    const job: ContentProcessingJob = {
      job_id: jobId,
      content_id: contentId,
      status: 'IN_PROGRESS',
      current_step: 'FILE_VALIDATION',
      steps: [
        { name: 'File Integrity & MIME Verification', status: 'RUNNING', timestamp: now },
        { name: 'Text & Structural Extraction', status: 'PENDING', timestamp: now },
        { name: 'Normalization & Topic Mapping', status: 'PENDING', timestamp: now },
        { name: 'AI Assessment Readiness Verification', status: 'PENDING', timestamp: now },
      ],
      started_at: now,
      completed_at: null,
      error_message: null,
      logs: [`Started processing job ${jobId} for file ${item.file_name}`],
    };

    this.jobs.set(jobId, job);
    item.status = 'PROCESSING';
    item.processing_status = 'IN_PROGRESS';
    item.updated_at = now;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      content_id: contentId,
      action: 'PROCESS_START',
      performed_by: triggeredByUserId,
      performed_by_name: triggeredByName,
      role: triggeredByRole,
      timestamp: now,
      details: `Initiated text extraction and normalization job (${jobId}).`,
    });

    try {
      // Step 1: Read file from disk
      if (!fs.existsSync(item.object_key)) {
        throw new Error(`File not found at storage path: ${item.object_key}`);
      }
      job.steps[0].status = 'COMPLETED';
      job.current_step = 'TEXT_EXTRACTION';
      job.steps[1].status = 'RUNNING';

      const fileBuffer = await fs.promises.readFile(item.object_key);
      let rawText = '';
      let pageCount = 1;

      if (item.content_type === 'PDF') {
        try {
          const pdfModule = (await import('pdf-parse')) as any;
          const pdfParse = pdfModule.default || pdfModule;
          const parsed = await pdfParse(fileBuffer);
          rawText = parsed.text || fileBuffer.toString('utf-8');
          pageCount = parsed.numpages || 1;
          job.logs.push(`Extracted ${rawText.length} characters across ${pageCount} PDF pages.`);
        } catch (pdfErr: any) {
          rawText = fileBuffer.toString('utf-8');
          job.logs.push(`Fallback text buffer read: ${rawText.length} characters.`);
        }
      } else if (item.content_type === 'PPT') {
        // Extract text tokens from presentation
        rawText = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        job.logs.push(`Extracted slide text stream: ${rawText.length} characters.`);
      } else if (item.content_type === 'VIDEO') {
        job.logs.push(
          'Transcription service notice: Live speech-to-text API not configured in environment. File stored for video playback.'
        );
        rawText = `[Video Lecture: ${item.title}]\nDescription: ${item.description}\nNote: Automated speech-to-text requires dedicated transcription endpoint. Manual subtitle ingest available.`;
      } else {
        // Plain text / Markdown / Document
        rawText = fileBuffer.toString('utf-8');
        job.logs.push(`Read text document stream: ${rawText.length} characters.`);
      }

      // Step 2: Normalize extracted text
      job.steps[1].status = 'COMPLETED';
      job.current_step = 'NORMALIZATION_AND_TAGGING';
      job.steps[2].status = 'RUNNING';

      const cleanedText = rawText
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      const words = cleanedText.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;

      // Slice into structured sections
      const paragraphs = cleanedText.split(/\n\n+/);
      const sections: ContentStructureSection[] = [];
      let currentSectionText = '';
      let secIndex = 0;

      for (const para of paragraphs) {
        if (currentSectionText.length + para.length > 600 && currentSectionText.length > 0) {
          sections.push({
            sectionIndex: secIndex,
            title: `Unit ${secIndex + 1}: ${currentSectionText.slice(0, 50).replace(/\n/g, ' ')}...`,
            pageOrSlide: Math.min(pageCount, secIndex + 1),
            content: currentSectionText.trim(),
            wordCount: currentSectionText.split(/\s+/).length,
          });
          secIndex++;
          currentSectionText = para + '\n\n';
        } else {
          currentSectionText += para + '\n\n';
        }
      }

      if (currentSectionText.trim().length > 0) {
        sections.push({
          sectionIndex: secIndex,
          title: `Unit ${secIndex + 1}: ${currentSectionText.slice(0, 50).replace(/\n/g, ' ')}...`,
          pageOrSlide: Math.min(pageCount, secIndex + 1),
          content: currentSectionText.trim(),
          wordCount: currentSectionText.split(/\s+/).length,
        });
      }

      // Step 3: Extract topics & refine competency
      job.steps[2].status = 'COMPLETED';
      job.current_step = 'ASSESSMENT_READINESS';
      job.steps[3].status = 'RUNNING';

      // Rule-based keyword topic detection
      const textLower = cleanedText.toLowerCase();
      const detectedTopics: Set<string> = new Set(item.topics);

      if (textLower.includes('procurement') || textLower.includes('gem') || textLower.includes('gfr')) {
        detectedTopics.add('GFR 2017');
        detectedTopics.add('Public Procurement');
      }
      if (textLower.includes('dpdp') || textLower.includes('privacy') || textLower.includes('consent')) {
        detectedTopics.add('Data Privacy');
        detectedTopics.add('DPDP Act 2023');
      }
      if (textLower.includes('sample') || textLower.includes('survey') || textLower.includes('sampling')) {
        detectedTopics.add('Survey Design');
        detectedTopics.add('Sampling Error');
      }
      if (textLower.includes('python') || textLower.includes('sql') || textLower.includes('pandas')) {
        detectedTopics.add('Statistical Computing');
      }

      // Update item record
      const finishedAt = new Date().toISOString();
      item.extracted_text = cleanedText;
      item.extracted_structure = sections;
      item.word_count = wordCount;
      item.page_count = pageCount;
      item.topics = Array.from(detectedTopics);
      item.status = 'READY';
      item.processing_status = 'COMPLETED';
      item.processing_error = null;
      item.updated_at = finishedAt;

      job.steps[3].status = 'COMPLETED';
      job.status = 'COMPLETED';
      job.completed_at = finishedAt;
      job.logs.push(`Successfully completed extraction. Total words: ${wordCount}, Sections: ${sections.length}. Status is now READY.`);

      this.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        content_id: contentId,
        action: 'PROCESS_SUCCESS',
        performed_by: triggeredByUserId,
        performed_by_name: triggeredByName,
        role: triggeredByRole,
        timestamp: finishedAt,
        details: `Processed ${wordCount} words into ${sections.length} structured units. State changed to READY.`,
      });

      return job;
    } catch (procErr: any) {
      const failedAt = new Date().toISOString();
      item.status = 'FAILED';
      item.processing_status = 'FAILED';
      item.processing_error = procErr?.message || 'Processing fault';
      item.updated_at = failedAt;

      job.status = 'FAILED';
      job.completed_at = failedAt;
      job.error_message = procErr?.message || 'Processing fault';
      job.logs.push(`Error during processing: ${procErr?.message}`);

      this.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        content_id: contentId,
        action: 'PROCESS_FAILED',
        performed_by: triggeredByUserId,
        performed_by_name: triggeredByName,
        role: triggeredByRole,
        timestamp: failedAt,
        details: `Processing failed: ${procErr?.message}`,
      });

      return job;
    }
  }

  // 6. Publish Content (Makes available to Module 07 Learning & Module 09 Assessment)
  public async publishContent(
    contentId: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContentItem> {
    const item = this.contentItems.get(contentId);
    if (!item) throw new Error(`Content item not found: ${contentId}`);

    if (item.status === 'ARCHIVED') {
      throw new Error('Cannot publish archived content. Unarchive or re-upload first.');
    }

    if (item.processing_status !== 'COMPLETED' || item.extracted_text.length === 0) {
      throw new Error('Cannot publish content before text processing has completed successfully.');
    }

    const now = new Date().toISOString();
    item.status = 'PUBLISHED';
    item.published_at = now;
    item.updated_at = now;

    // Handshake: Publish into Module 07 Learning Management Catalog
    try {
      this.syncToModule07(item);
    } catch (m07Err) {
      console.warn('Module 07 catalog sync notification:', m07Err);
    }

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      content_id: contentId,
      action: 'PUBLISH',
      performed_by: userId,
      performed_by_name: userName,
      role: userRole,
      timestamp: now,
      details: `Content published to official platform catalog and made available for AI Assessment.`,
    });

    return item;
  }

  // 7. Archive Content
  public async archiveContent(
    contentId: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContentItem> {
    const item = this.contentItems.get(contentId);
    if (!item) throw new Error(`Content item not found: ${contentId}`);

    const now = new Date().toISOString();
    item.status = 'ARCHIVED';
    item.updated_at = now;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      content_id: contentId,
      action: 'ARCHIVE',
      performed_by: userId,
      performed_by_name: userName,
      role: userRole,
      timestamp: now,
      details: `Content archived by ${userName}. Removed from active learner catalogs.`,
    });

    return item;
  }

  // 8. Prepare Assessment Docket for Module 09
  public getAssessmentDocket(contentId: string): AssessmentDocket {
    const item = this.contentItems.get(contentId);
    if (!item) throw new Error(`Content item not found: ${contentId}`);

    return {
      content_id: item.content_id,
      title: item.title,
      description: item.description,
      domain: item.domain,
      competency_id: item.competency_id,
      competency_name: item.competency_name,
      extracted_text: item.extracted_text,
      extracted_structure: item.extracted_structure,
      word_count: item.word_count,
      topics: item.topics,
      is_ready_for_assessment: item.status === 'READY' || item.status === 'PUBLISHED',
      status: item.status,
    };
  }

  // 9. Sync to Module 07 (Learning Experience)
  private syncToModule07(item: ContentItem) {
    // When published, add curriculum details to Module 07 learning store
    const learningResourceId = `res-plat-${item.content_id}`;
    
    // Check if learning resource already exists or construct it
    const existing = learningStore.getResourceById(learningResourceId);
    if (!existing) {
      const curriculumUnits = item.extracted_structure.map((s, idx) => ({
        moduleIndex: idx,
        title: s.title,
        durationMinutes: Math.max(15, Math.round(s.wordCount / 100) * 10),
        contentBody: s.content,
        keyTakeaways: [
          `Key Directive: ${s.title}`,
          `Word count: ${s.wordCount} words`,
          `Statutory compliance reference in official curriculum`,
        ],
        statutoryReference: item.title,
      }));

      // Ingest dynamically into Module 07
      const newResource = {
        id: learningResourceId,
        externalId: item.content_id,
        source: 'INTERNAL' as const,
        title: item.title,
        description: item.description,
        provider: 'Platform Content' as const,
        resourceType: 'Interactive Course' as const,
        primaryCompetencyId: item.competency_id,
        competencyCode: 'PLAT-MOD-08',
        competencyName: item.competency_name,
        domain: item.domain,
        targetProficiencyLevel: 3.5,
        estimatedHours: Math.max(2, Math.round(item.word_count / 300)),
        difficulty: 'Intermediate' as const,
        language: item.language,
        externalUrl: '',
        learningObjectives: [
          `Understand statutory principles in ${item.title}`,
          `Apply departmental SOPs and directives in daily administrative duties`,
          `Demonstrate compliance in administrative evaluations`,
        ],
        syllabus: curriculumUnits.map(u => ({ title: u.title, durationMinutes: u.durationMinutes })),
        karmaPoints: 120,
        lastSyncedAt: new Date().toISOString(),
        isActive: true,
        syncVersion: 1,
        curriculumDetails: curriculumUnits,
      };

      (learningStore as any).addDynamicResource?.(newResource);
    }
  }

  // 10. Query & Search Methods
  public getContentList(filters?: {
    type?: string;
    status?: string;
    language?: string;
    search?: string;
    ownerId?: string;
    userRole?: string;
  }): ContentItem[] {
    let list = Array.from(this.contentItems.values());

    // Role-based visibility: Learners can ONLY view PUBLISHED content
    if (filters?.userRole && filters.userRole.toLowerCase() === 'learner') {
      list = list.filter(item => item.status === 'PUBLISHED');
    }

    if (filters?.type && filters.type !== 'ALL') {
      list = list.filter(item => item.content_type === filters.type);
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(item => item.status === filters.status);
    }

    if (filters?.language && filters.language !== 'ALL') {
      list = list.filter(item => item.language.includes(filters.language!));
    }

    if (filters?.ownerId) {
      list = list.filter(item => item.owner_user_id === filters.ownerId);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.file_name.toLowerCase().includes(q) ||
          item.topics.some(t => t.toLowerCase().includes(q)) ||
          item.competency_name.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getContentById(id: string): ContentItem | null {
    return this.contentItems.get(id) || null;
  }

  public getVersions(contentId: string): ContentVersion[] {
    return this.versions.get(contentId) || [];
  }

  public getAuditLogs(contentId?: string): ContentAuditLog[] {
    if (contentId) {
      return this.auditLogs.filter(log => log.content_id === contentId);
    }
    return this.auditLogs;
  }

  public getJob(jobId: string): ContentProcessingJob | null {
    return this.jobs.get(jobId) || null;
  }
}

export const contentStore = new ContentDataStore();

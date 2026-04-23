# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Phase 4 - Implementation Ready**: All planning documents complete. Project is an AI-driven universal crawler framework (AI Crawler Distillate) using Python + FastAPI backend, Vue.js frontend, with local PostgreSQL storage and Playwright browser automation.

## BMad Workflow System

This repository uses the **BMad Method** for product development. Workflows are organized in `.claude/skills/` with specific skills for each phase:

### Phase Structure
1. **1-Analysis** (Brainstorming, Research, Product Brief)
2. **2-Planning** (PRD, UX Design)
3. **3-Solutioning** (Architecture, Epics/Stories)
4. **4-Implementation** (Sprint Planning, Story Development, Code Review)

### Key Skills

| Skill | Phase | Purpose |
|--------|--------|----------|
| `bmad-create-prd` | Planning | Create Product Requirements Document |
| `bmad-create-architecture` | Solutioning | Document technical decisions (ADR format) |
| `bmad-create-epics-and-stories` | Solutioning | Break requirements into epics and stories |
| `bmad-sprint-planning` | Implementation | Generate sprint plans for story execution |
| `bmad-dev-story` | Implementation | Execute story implementation |
| `bmad-code-review` | Implementation | Review code adversarially |
| `bmad-help` | Anytime | Get workflow guidance |

### Workflow Configuration

- BMad config: `_bmad/bmm/config.yaml` and `_bmad/core/config.yaml`
- Output location: `_bmad-output/planning-artifacts/` (planning), `_bmad-output/implementation-artifacts/` (implementation)
- Communication language: Chinese

## Architecture Decisions (From Planning Phase)

Critical ADRs documented in `_bmad-output/planning-artifacts/architecture.md`:

- **ADR-001**: Local deployment architecture (data never leaves user's machine)
- **ADR-003**: Playwright Python v1.51.0 for browser automation (Worker Pool pattern)
- **ADR-011**: Multi-provider AI model support with unified abstraction layer
- **ADR-012**: Strategy Pattern for managing AI providers
- **ADR-013**: Automatic fallback (3 second) between AI providers

## Project Context for Implementation

AI agents implementing code must read `project-context.md` (65 critical rules, 8 sections) before writing any code. Key constraints:

- **Playwright**: Must use v1.51.0, Worker Pool mode, 100-200MB per browser instance
- **AI Accuracy**: MVP 70-80%, Post-MVP 90-95%
- **Performance**: Page analysis < 8 seconds (95th percentile), 100 concurrent users
- **Compliance**: Chinese network security laws, GDPR, CCPA

## Epic Structure

15 Epics, 87 Stories covering 131 FR (Functional Requirements) and 87 NFR (Non-Functional Requirements). See `_bmad-output/planning-artifacts/epics.md` for complete breakdown.

P0 Epics (MVP):
- Epic 1: Quick Start & Deployment
- Epic 2: AI Page Analysis & Data Extraction
- Epic 3: Crawler Task Management & Scheduling
- Epic 4: User Interface & Interaction
- Epic 5: Data Management & Export
- Epic 6: Security & Compliance
- Epic 7: AI Model Integration

## BMad Skill Usage

When a user invokes a BMad skill (e.g., `/bmad-dev-story`), the skill file contains workflow instructions and checkpoints. Always follow the step-by-step workflow defined in the skill's `workflow.md` or `steps/` directory.

Skills may invoke agents (Architect, Developer, PM, UX Designer) - these are orchestrated subagents with specific domains of expertise.
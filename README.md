# CanCompliance

**AI-assisted compliance scanning for Canadian businesses — CASL, privacy, and Quebec French-language requirements, checked automatically.**

[![Status](https://img.shields.io/badge/status-active_development-yellow)]()
[![License](https://img.shields.io/badge/license-proprietary-red)]()

## Overview
Scans a business's public-facing communications and website against specific Canadian regulatory requirements and flags gaps.

## Problem
Small Canadian businesses often don't know they're out of compliance with CASL, Quebec's French-language law, or basic privacy requirements until a complaint or audit — generic compliance tools don't check for these Canada-specific rules.

## Solution
Automated checks against CASL (commercial email rules), Quebec's Charter of the French Language (Bill 96), and privacy-policy basics, plus an AI research layer (RAG-backed against a seeded compliance knowledge base) so users can ask follow-up questions in plain language.

## Key Capabilities
- CASL check: unsubscribe compliance, consent handling, commercial-email rules
- Quebec French-language check: website content, labelling, contract requirements
- Privacy policy audit: presence, privacy officer designation, data access rights
- AI compliance assistant (Anthropic + OpenAI, RAG-grounded)

## Architecture
This is genuinely substantive product logic, not a demo — real regulatory-check logic backing each scan category.

## Getting Started
See `package.json` for dev server setup.

## Project Status
Active development with real, working compliance-check logic.

## Contributing
Private, proprietary CREOVA product.

## License
Proprietary — All Rights Reserved.

## Author / Organization
Built by [Justin Mafie](https://github.com/creova-gif) under CREOVA.

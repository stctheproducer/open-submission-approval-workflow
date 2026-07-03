---
affects: [application-attachments]
briefed: 2026-07-03
---

# Draft Application Attachment — Brief

## Entry point, user goal, status

An authenticated applicant enters the application draft journey and wants to attach one supporting file to the application while it remains in draft, replacing that file later if needed. This is a new extension to the draft journey.

## Prerequisites

- Applicant-owned draft creation and editing.

## The journey, step by step

1. The applicant opens a draft application and can add one supporting attachment to that draft.
2. The applicant can provide a file only when it matches the allowed file types and size limit.
3. When the attachment is accepted, the draft keeps that file as the current supporting material for the application.
4. If the applicant later edits the same draft, they can replace the current attachment with a newer file.
5. When a replacement is accepted, the application retains only the latest attachment and the prior attachment is no longer the current file for that draft.
6. When the application is no longer in draft, the applicant cannot add or replace the attachment through this journey.
7. When the file type or size is not allowed, the draft attachment change is rejected and the existing attachment state stays unchanged.

## Decisions made

| Decision | Options considered | Chosen | Why |
| --- | --- | --- | --- |
| Attachment count | Single current attachment vs multiple attachments | Single current attachment | Keeps the slice narrow and matches the issue's latest-only rule. |
| Replacement behavior | Replace in place vs keep old and new files together | Replace in place | The product rule is that only the latest attachment is retained. |
| Allowed files | Broad file acceptance vs fixed list | Fixed list: PDF, PNG, JPEG, DOCX up to 5 MB | Keeps applicant uploads predictable and reviewable. |

## Constraints the journey places on implementation

- Attachment support in this slice is limited to draft applications only.
- The journey must accept only PDF, PNG, JPEG, and DOCX files.
- The journey must reject files larger than 5 MB.
- The journey must keep only one current attachment per application.
- Replacing an attachment must remove or supersede the prior current attachment.

# Design

## Theme

The frontend uses a dark, trust-oriented product surface with a split-screen login layout as the current reference.

The visual language is calm and technical:

- deep navy and slate backgrounds
- cyan as the primary accent
- restrained secondary glow in blue and violet tones
- white and slate text for strong contrast

## Typography

- `Inter Variable` is the primary typeface
- headings are semibold and compact, with tighter tracking for focus
- body text stays small-to-medium and clear rather than decorative

## Layout

- the login screen is full-height and split into two panels on large screens
- the left panel carries the product message and illustration
- the right panel centers the form in a constrained column
- on small screens, the layout collapses into a single vertical stack

## Components

The current frontend vocabulary is intentionally familiar:

- form fields with clear labels and strong focus states
- a primary button with a high-contrast filled treatment
- a checkbox for session persistence
- framed imagery used as supporting context, not decoration
- rounded cards and panels with border and subtle glow treatment

## Color And Contrast

- backgrounds should remain dark enough to keep white and slate text legible
- cyan is reserved for emphasis, focus, and primary affordance
- placeholder text and secondary copy still need to read clearly against the dark surface

## Motion

- motion should stay subtle and state-based
- hover and focus feedback are enough for most interactions
- avoid page-load choreography that competes with the task

## Accessibility

- keep labels explicit and associated with inputs
- preserve keyboard focus visibility
- support reduced motion
- maintain strong contrast on all foreground text and controls

## Reference Surface

The login page is the clearest expression of the current design system and should stay the canonical reference for future auth surfaces.

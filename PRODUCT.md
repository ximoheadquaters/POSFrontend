# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Ximo platform administrators who provision client organizations, assign products, and manage subscriptions.
- Client business owners and managers who monitor the workspace connected to their Ximo POS operation.
- POS staff use the related Ximo POS application for daily store operations; its interface is the shared product reference for this portal.

## Product Purpose

Ximo connects a platform administration portal, a client workspace, and the Ximo POS application. Administrators manage client access and product services. Clients review the parts of their business that are surfaced from the POS system, including sales, branches, inventory, customers, and billing.

## Positioning

The product makes a client’s administrative, ownership, and point-of-sale work feel like connected areas of one operational system rather than separate tools.

## Operating Context

The portals are used for frequent business operations on desktop and laptop screens, and for time-sensitive monitoring and management on tablets and phones. They rely on existing authenticated web routes, API services, billing flows, and POS data.

## Capabilities and Constraints

- Preserve current routing, authentication, permissions, API integrations, CRUD flows, billing operations, and database behavior.
- `POSBackend` is the existing Express API boundary. It has no rendered browser interface, so its API contracts remain intact during the frontend redesign.
- `POSFrontend` contains the rendered administrator, client, public, authentication, and checkout experiences.
- The existing `POS` application is the source of truth for the product’s UI organization, responsive behavior, and component behavior.
- The redesign must support desktop, laptop, tablet, mobile landscape, and mobile portrait without accidental horizontal overflow.

## Brand Commitments

Ximo remains the shared product name and identity. The established Ximo POS interface is the binding reference for the portal design language and interaction philosophy.

## Evidence on Hand

- The user’s redesign brief and supplied portal screenshots.
- `POS/apps/mobile`, which contains the established Ximo POS interface.
- `POSFrontend`, which contains the existing rendered portal routes and components.
- `POSBackend`, which contains the API routes and services used by the portal.

## Product Principles

1. Put frequent operational tasks and their next actions in predictable places.
2. Make every Ximo surface feel part of one product system.
3. Use responsive layouts that reorganize for touch screens instead of compressing desktop screens.
4. Prefer clear task information over decorative dashboard treatments.
5. Preserve working business behavior while improving its presentation.

## Accessibility & Inclusion

Keyboard access, visible focus, readable contrast, responsive text, and touch-friendly controls are required for the web portal refactor.

<!-- Product facts above are recorded from the user-provided redesign brief and the existing repository structure. -->

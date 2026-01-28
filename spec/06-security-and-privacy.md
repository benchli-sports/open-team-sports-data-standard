# Security and Privacy

OTSD packages may contain personal data.

## Recommendations
- Prefer exporting only what is needed for portability.
- Support package encryption at rest and in transit (implementation choice).
- Consider redaction modes (e.g., remove DOB; keep birth_year).
- Keep audit logs but avoid sensitive content in free-text fields.

## Roles and access (conceptual)
Membership roles and permissions are represented in data (Membership.role),
but enforcement is the responsibility of the implementing system.